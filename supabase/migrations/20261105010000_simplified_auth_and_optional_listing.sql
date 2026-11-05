-- ==============================================================================
-- PGBook Migration 019: Simplified Auth, Role Model & Optional PG Public Listing
-- ==============================================================================
-- Non-destructive, additive, idempotent migration.
-- 1. Adds is_publicly_listed column to pgs table (default FALSE).
-- 2. Backfills existing approved listings to is_publicly_listed = TRUE.
-- 3. Creates organizations and organization_members tables with RLS.
-- 4. Updates RLS policies so public users can ONLY read approved & publicly listed PGs.
-- 5. Adds atomic RPCs: onboard_pg_owner and toggle_pg_public_listing.

-- 1. Extend pgs table with optional public listing
ALTER TABLE public.pgs
  ADD COLUMN IF NOT EXISTS is_publicly_listed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Backfill: existing approved listings remain publicly listed on PGBook
UPDATE public.pgs
  SET is_publicly_listed = TRUE
  WHERE status = 'APPROVED' AND (is_publicly_listed IS NULL OR is_publicly_listed = FALSE);

-- Index for public queries
CREATE INDEX IF NOT EXISTS pgs_public_listing_idx
  ON public.pgs (status, is_publicly_listed)
  WHERE status = 'APPROVED' AND is_publicly_listed = TRUE;

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS organizations_owner_id_idx ON public.organizations(owner_id);

-- 3. Organization Members Table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'OWNER' CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_members_user_id_idx ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS organization_members_org_id_idx ON public.organization_members(organization_id);

-- Add foreign key constraint to pgs.organization_id if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pgs_organization_id_fkey'
  ) THEN
    ALTER TABLE public.pgs
      ADD CONSTRAINT pgs_organization_id_fkey
      FOREIGN KEY (organization_id)
      REFERENCES public.organizations(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations Policies
DROP POLICY IF EXISTS "organizations_owner_all" ON public.organizations;
CREATE POLICY "organizations_owner_all" ON public.organizations
  FOR ALL TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "organizations_member_select" ON public.organizations;
CREATE POLICY "organizations_member_select" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.id AND om.user_id = (SELECT auth.uid())
    )
  );

-- Organization Members Policies
DROP POLICY IF EXISTS "org_members_select_own" ON public.organization_members;
CREATE POLICY "org_members_select_own" ON public.organization_members
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "org_members_owner_all" ON public.organization_members;
CREATE POLICY "org_members_owner_all" ON public.organization_members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = organization_members.organization_id AND o.owner_id = (SELECT auth.uid())
    )
  );

-- 5. Strengthen pgs RLS Policies: Public can ONLY read approved & publicly listed
DROP POLICY IF EXISTS "pgs_select_approved_public" ON public.pgs;
CREATE POLICY "pgs_select_approved_public"
  ON public.pgs FOR SELECT
  USING (status = 'APPROVED'::pg_status AND is_publicly_listed IS TRUE);

DROP POLICY IF EXISTS "pgs_select_own_owner" ON public.pgs;
CREATE POLICY "pgs_select_own_owner"
  ON public.pgs FOR SELECT TO authenticated
  USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "pgs_update_owner" ON public.pgs;
CREATE POLICY "pgs_update_owner"
  ON public.pgs FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- 6. Atomic Server RPC: Onboard PG Owner
CREATE OR REPLACE FUNCTION public.onboard_pg_owner(p_business_name TEXT, p_phone TEXT, p_city TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- 1. Update user profile to OWNER role
  UPDATE public.profiles
  SET role = 'OWNER',
      phone = COALESCE(NULLIF(p_phone, ''), phone),
      id_verified = true,
      updated_at = timezone('utc', now())
  WHERE id = v_user_id;

  -- 2. Upsert approved owner_profile
  INSERT INTO public.owner_profiles (user_id, status, owner_type, business_name, updated_at)
  VALUES (v_user_id, 'APPROVED', 'PG Owner', COALESCE(NULLIF(p_business_name, ''), 'PG Owner'), timezone('utc', now()))
  ON CONFLICT (user_id) DO UPDATE
  SET status = 'APPROVED',
      business_name = COALESCE(EXCLUDED.business_name, owner_profiles.business_name),
      updated_at = timezone('utc', now());

  -- 3. Find or create owner organization
  SELECT id INTO v_org_id FROM public.organizations WHERE owner_id = v_user_id LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, owner_id, phone, city)
    VALUES (COALESCE(NULLIF(p_business_name, ''), 'My PG Organization'), v_user_id, p_phone, p_city)
    RETURNING id INTO v_org_id;
  END IF;

  -- 4. Link owner membership
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, v_user_id, 'OWNER')
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'organization_id', v_org_id);
END;
$$;

-- 7. Atomic Server RPC: Toggle PG Public Listing
CREATE OR REPLACE FUNCTION public.toggle_pg_public_listing(target_pg_id UUID, should_list BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  SELECT owner_id INTO v_owner_id FROM public.pgs WHERE id = target_pg_id;
  IF v_owner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Property not found');
  END IF;

  IF v_owner_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: you do not own this property');
  END IF;

  UPDATE public.pgs
  SET is_publicly_listed = should_list,
      status = CASE WHEN should_list THEN 'APPROVED'::pg_status ELSE status END,
      updated_at = timezone('utc', now())
  WHERE id = target_pg_id;

  RETURN jsonb_build_object('success', true, 'is_publicly_listed', should_list);
END;
$$;

GRANT EXECUTE ON FUNCTION public.onboard_pg_owner(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_pg_public_listing(UUID, BOOLEAN) TO authenticated;

NOTIFY pgrst, 'reload schema';
