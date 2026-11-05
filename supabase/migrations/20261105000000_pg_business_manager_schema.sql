-- ==============================================================================
-- PGBook Migration 018: PG Business Manager Complete Operating System Schema
-- ==============================================================================
-- Non-destructive, safe to run on existing Supabase instances.
-- Multi-property management, floors, rooms, beds, tenants, financial ledgers,
-- staff, attendance, operations, maintenance, notices, and atomic functions.

-- 1. Extend pgs table with operational configurations
ALTER TABLE public.pgs
  ADD COLUMN IF NOT EXISTS floors_count INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_rooms INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rules TEXT,
  ADD COLUMN IF NOT EXISTS checkin_time TEXT DEFAULT '10:00 AM',
  ADD COLUMN IF NOT EXISTS checkout_time TEXT DEFAULT '11:00 AM',
  ADD COLUMN IF NOT EXISTS notice_period_days INT DEFAULT 30,
  ADD COLUMN IF NOT EXISTS wifi_ssid TEXT,
  ADD COLUMN IF NOT EXISTS wifi_password TEXT,
  ADD COLUMN IF NOT EXISTS manager_name TEXT,
  ADD COLUMN IF NOT EXISTS manager_phone TEXT;

-- 2. Property Members (Role-based access per property: OWNER, PROPERTY_MANAGER, STAFF)
CREATE TABLE IF NOT EXISTS public.property_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'PROPERTY_MANAGER', 'STAFF')),
  permissions JSONB DEFAULT '{"all": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(pg_id, user_id)
);

CREATE INDEX IF NOT EXISTS property_members_user_id_idx ON public.property_members(user_id);
CREATE INDEX IF NOT EXISTS property_members_pg_id_idx ON public.property_members(pg_id);

-- 3. Floors
CREATE TABLE IF NOT EXISTS public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  floor_number INT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(pg_id, floor_number)
);

CREATE INDEX IF NOT EXISTS floors_pg_id_idx ON public.floors(pg_id);

-- 4. Extend Rooms table
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS floor_id UUID REFERENCES public.floors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS room_number TEXT,
  ADD COLUMN IF NOT EXISTS room_name TEXT,
  ADD COLUMN IF NOT EXISTS attached_bathroom BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS has_balcony BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_ac BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS amenities_list JSONB DEFAULT '[]'::jsonb;

-- 5. Beds Table (with strict double-booking prevention)
CREATE TABLE IF NOT EXISTS public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  monthly_rent INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'VACANT' CHECK (status IN ('VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
  occupied_by_tenant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(room_id, bed_number)
);

CREATE INDEX IF NOT EXISTS beds_pg_id_status_idx ON public.beds(pg_id, status);
CREATE INDEX IF NOT EXISTS beds_room_id_idx ON public.beds(room_id);

-- 6. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  bed_id UUID REFERENCES public.beds(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  id_proof_type TEXT DEFAULT 'AADHAAR',
  id_proof_number TEXT,
  id_proof_url TEXT,
  monthly_rent INT NOT NULL CHECK (monthly_rent >= 0),
  security_deposit INT NOT NULL DEFAULT 0 CHECK (security_deposit >= 0),
  move_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  move_out_date DATE,
  rent_due_day INT NOT NULL DEFAULT 1 CHECK (rent_due_day BETWEEN 1 AND 28),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'NOTICE', 'MOVED_OUT')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT tenants_move_out_after_move_in CHECK (move_out_date IS NULL OR move_out_date >= move_in_date)
);

CREATE INDEX IF NOT EXISTS tenants_pg_id_status_idx ON public.tenants(pg_id, status);
CREATE INDEX IF NOT EXISTS tenants_owner_id_idx ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS tenants_user_id_idx ON public.tenants(user_id);
CREATE INDEX IF NOT EXISTS tenants_bed_id_idx ON public.tenants(bed_id);

-- Link occupied_by_tenant_id foreign key after tenants table is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'beds_occupied_by_tenant_fkey'
  ) THEN
    ALTER TABLE public.beds
      ADD CONSTRAINT beds_occupied_by_tenant_fkey
      FOREIGN KEY (occupied_by_tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. Tenant Documents
CREATE TABLE IF NOT EXISTS public.tenant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS tenant_docs_tenant_id_idx ON public.tenant_documents(tenant_id);

-- 8. Rent Invoices
CREATE TABLE IF NOT EXISTS public.rent_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES public.beds(id) ON DELETE SET NULL,
  month_year TEXT NOT NULL,
  rent_amount INT NOT NULL DEFAULT 0,
  utility_amount INT NOT NULL DEFAULT 0,
  discount_amount INT NOT NULL DEFAULT 0,
  late_fee INT NOT NULL DEFAULT 0,
  total_amount INT NOT NULL,
  paid_amount INT NOT NULL DEFAULT 0,
  balance_due INT NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS rent_invoices_pg_id_status_idx ON public.rent_invoices(pg_id, status);
CREATE INDEX IF NOT EXISTS rent_invoices_tenant_id_idx ON public.rent_invoices(tenant_id);

-- 9. Invoice Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.rent_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount INT NOT NULL,
  item_type TEXT DEFAULT 'RENT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT NOT NULL UNIQUE,
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.rent_invoices(id) ON DELETE SET NULL,
  amount INT NOT NULL CHECK (amount > 0),
  payment_mode TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE')),
  transaction_ref TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS payments_pg_id_date_idx ON public.payments(pg_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS payments_tenant_id_idx ON public.payments(tenant_id);

-- 11. Security Deposits & Transactions
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  total_deposit INT NOT NULL DEFAULT 0,
  deposit_status TEXT NOT NULL DEFAULT 'HELD' CHECK (deposit_status IN ('HELD', 'ADJUSTED', 'REFUNDED')),
  refund_amount INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS deposits_pg_id_idx ON public.deposits(pg_id);
CREATE INDEX IF NOT EXISTS deposits_tenant_id_idx ON public.deposits(tenant_id);

CREATE TABLE IF NOT EXISTS public.deposit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES public.deposits(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('COLLECTION', 'DEDUCTION', 'REFUND')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount INT NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  vendor_name TEXT,
  vendor_phone TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS expenses_pg_id_date_idx ON public.expenses(pg_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS expenses_owner_id_idx ON public.expenses(owner_id);

-- 13. Utility Bills
CREATE TABLE IF NOT EXISTS public.utility_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  utility_type TEXT NOT NULL CHECK (utility_type IN ('ELECTRICITY', 'WATER', 'INTERNET', 'GAS', 'MAINTENANCE', 'OTHER')),
  billing_period TEXT NOT NULL,
  amount INT NOT NULL CHECK (amount >= 0),
  paid_amount INT NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
  bill_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS utility_bills_pg_id_idx ON public.utility_bills(pg_id);

-- 14. Staff & Attendance
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'WARDEN' CHECK (role IN ('WARDEN', 'COOK', 'CLEANER', 'SECURITY', 'MAINTENANCE', 'MANAGER', 'OTHER')),
  salary INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS staff_pg_id_idx ON public.staff(pg_id);

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIME,
  check_out_time TIME,
  status TEXT NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(staff_id, date)
);

CREATE INDEX IF NOT EXISTS attendance_staff_date_idx ON public.attendance(staff_id, date DESC);

-- 15. Daily Operations: Visitors
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  purpose TEXT,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  check_out_time TIMESTAMPTZ,
  id_type TEXT,
  id_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS visitors_pg_id_idx ON public.visitors(pg_id, check_in_time DESC);

-- 16. Daily Operations: Maintenance Requests
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL' CHECK (category IN ('PLUMBING', 'ELECTRICAL', 'FURNITURE', 'CLEANING', 'AC', 'WIFI', 'SECURITY', 'GENERAL', 'OTHER')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS maintenance_pg_id_status_idx ON public.maintenance_requests(pg_id, status);

-- 17. Notices & Announcements
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID REFERENCES public.pgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'ALL' CHECK (target_role IN ('ALL', 'TENANTS', 'STAFF')),
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'IMPORTANT', 'URGENT')),
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  expires_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS notices_pg_id_idx ON public.notices(pg_id, is_active);

-- 18. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID REFERENCES public.pgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS audit_logs_pg_id_idx ON public.audit_logs(pg_id, created_at DESC);

-- ==============================================================================
-- ATOMIC POSTGRESQL FUNCTIONS
-- ==============================================================================

-- Function 1: Atomic Bed Allocation (Guarantees no double-booking)
CREATE OR REPLACE FUNCTION public.allocate_bed_to_tenant(
  p_bed_id UUID,
  p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status TEXT;
  v_room_id UUID;
  v_pg_id UUID;
BEGIN
  -- Lock the bed row for update to prevent concurrent double allocation
  SELECT status, room_id, pg_id INTO v_current_status, v_room_id, v_pg_id
  FROM public.beds
  WHERE id = p_bed_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bed not found with ID %', p_bed_id;
  END IF;

  IF v_current_status = 'OCCUPIED' THEN
    RAISE EXCEPTION 'Bed is already occupied by an active tenant';
  END IF;

  -- Update bed status and link to tenant
  UPDATE public.beds
  SET
    status = 'OCCUPIED',
    occupied_by_tenant_id = p_tenant_id,
    updated_at = timezone('utc', now())
  WHERE id = p_bed_id;

  -- Update tenant record
  UPDATE public.tenants
  SET
    bed_id = p_bed_id,
    room_id = v_room_id,
    status = 'ACTIVE',
    updated_at = timezone('utc', now())
  WHERE id = p_tenant_id;

  -- Recompute room occupied_beds count
  UPDATE public.rooms
  SET occupied_beds = (
    SELECT COUNT(*) FROM public.beds
    WHERE room_id = v_room_id AND status = 'OCCUPIED'
  )
  WHERE id = v_room_id;

  RETURN TRUE;
END;
$$;

-- Function 2: Atomic Tenant Checkout Workflow
CREATE OR REPLACE FUNCTION public.checkout_tenant(
  p_tenant_id UUID,
  p_checkout_date DATE,
  p_deductions INT DEFAULT 0,
  p_refund_amount INT DEFAULT 0,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bed_id UUID;
  v_room_id UUID;
  v_pg_id UUID;
BEGIN
  SELECT bed_id, room_id, pg_id INTO v_bed_id, v_room_id, v_pg_id
  FROM public.tenants
  WHERE id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found';
  END IF;

  -- 1. Update tenant status to MOVED_OUT
  UPDATE public.tenants
  SET
    status = 'MOVED_OUT',
    move_out_date = p_checkout_date,
    notes = COALESCE(notes || E'\nCheckout note: ' || p_notes, p_notes),
    updated_at = timezone('utc', now())
  WHERE id = p_tenant_id;

  -- 2. Release bed
  IF v_bed_id IS NOT NULL THEN
    UPDATE public.beds
    SET
      status = 'VACANT',
      occupied_by_tenant_id = NULL,
      updated_at = timezone('utc', now())
    WHERE id = v_bed_id;
  END IF;

  -- 3. Recompute room occupied beds
  IF v_room_id IS NOT NULL THEN
    UPDATE public.rooms
    SET occupied_beds = (
      SELECT COUNT(*) FROM public.beds
      WHERE room_id = v_room_id AND status = 'OCCUPIED'
    )
    WHERE id = v_room_id;
  END IF;

  -- 4. Update deposit status
  UPDATE public.deposits
  SET
    deposit_status = CASE WHEN p_refund_amount > 0 THEN 'REFUNDED' ELSE 'ADJUSTED' END,
    refund_amount = p_refund_amount,
    notes = COALESCE(p_notes, 'Settled at checkout'),
    updated_at = timezone('utc', now())
  WHERE tenant_id = p_tenant_id;

  -- Record deposit deduction / refund transaction if deposit exists
  INSERT INTO public.deposit_transactions (deposit_id, amount, transaction_type, reason)
  SELECT id, p_deductions, 'DEDUCTION', 'Checkout settlement deductions'
  FROM public.deposits WHERE tenant_id = p_tenant_id AND p_deductions > 0;

  IF p_refund_amount > 0 THEN
    INSERT INTO public.deposit_transactions (deposit_id, amount, transaction_type, reason)
    SELECT id, p_refund_amount, 'REFUND', 'Checkout deposit refund'
    FROM public.deposits WHERE tenant_id = p_tenant_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================================================

ALTER TABLE public.property_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper check function for property management access
CREATE OR REPLACE FUNCTION public.has_property_access(p_pg_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pgs
    WHERE id = p_pg_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.property_members
    WHERE pg_id = p_pg_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- RLS Policies: Owners and Managers full access to operational tables
CREATE POLICY "Property access to property_members" ON public.property_members
  FOR ALL USING (public.has_property_access(pg_id));

CREATE POLICY "Property access to floors" ON public.floors
  FOR ALL USING (public.has_property_access(pg_id));

CREATE POLICY "Property access to beds" ON public.beds
  FOR ALL USING (public.has_property_access(pg_id));

CREATE POLICY "Property access to tenants" ON public.tenants
  FOR ALL USING (
    public.has_property_access(pg_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "Property access to tenant_documents" ON public.tenant_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = tenant_documents.tenant_id AND (public.has_property_access(tenants.pg_id) OR tenants.user_id = auth.uid()))
  );

CREATE POLICY "Property access to rent_invoices" ON public.rent_invoices
  FOR ALL USING (
    public.has_property_access(pg_id)
    OR EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = rent_invoices.tenant_id AND tenants.user_id = auth.uid())
  );

CREATE POLICY "Property access to payments" ON public.payments
  FOR ALL USING (
    public.has_property_access(pg_id)
    OR EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = payments.tenant_id AND tenants.user_id = auth.uid())
  );

CREATE POLICY "Property access to deposits" ON public.deposits
  FOR ALL USING (
    public.has_property_access(pg_id)
    OR EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = deposits.tenant_id AND tenants.user_id = auth.uid())
  );

CREATE POLICY "Property access to expenses" ON public.expenses
  FOR ALL USING (public.has_property_access(pg_id));

CREATE POLICY "Property access to utility_bills" ON public.utility_bills
  FOR ALL USING (public.has_property_access(pg_id));

CREATE POLICY "Property access to staff" ON public.staff
  FOR ALL USING (public.has_property_access(pg_id));

CREATE POLICY "Property access to attendance" ON public.attendance
  FOR ALL USING (public.has_property_access(pg_id));

CREATE POLICY "Property access to visitors" ON public.visitors
  FOR ALL USING (public.has_property_access(pg_id));

CREATE POLICY "Property access to maintenance_requests" ON public.maintenance_requests
  FOR ALL USING (
    public.has_property_access(pg_id)
    OR EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = maintenance_requests.tenant_id AND tenants.user_id = auth.uid())
  );

CREATE POLICY "Property access to notices" ON public.notices
  FOR ALL USING (
    pg_id IS NULL
    OR public.has_property_access(pg_id)
    OR EXISTS (SELECT 1 FROM public.tenants WHERE tenants.pg_id = notices.pg_id AND tenants.user_id = auth.uid() AND tenants.status = 'ACTIVE')
  );

CREATE POLICY "Property access to audit_logs" ON public.audit_logs
  FOR ALL USING (public.has_property_access(pg_id));

-- ==============================================================================
-- SECURITY HARDENING
-- ==============================================================================
-- Replace the broad initial policies with explicit owner, manager, staff, and
-- tenant permissions. This keeps the public PGBook data model intact while
-- preventing a STAFF member from gaining finance or tenant-management access.

CREATE OR REPLACE FUNCTION public.can_manage_property(target_pg_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT (select auth.uid()) IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.pgs WHERE id = target_pg_id AND owner_id = (select auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.property_members
      WHERE pg_id = target_pg_id
        AND user_id = (select auth.uid())
        AND role = 'PROPERTY_MANAGER'
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_property_access(target_pg_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT (select auth.uid()) IS NOT NULL AND (
    public.can_manage_property(target_pg_id)
    OR EXISTS (
      SELECT 1 FROM public.property_members
      WHERE pg_id = target_pg_id
        AND user_id = (select auth.uid())
        AND role = 'STAFF'
    )
  );
$$;

DROP POLICY IF EXISTS "Property access to property_members" ON public.property_members;
DROP POLICY IF EXISTS "Property access to floors" ON public.floors;
DROP POLICY IF EXISTS "Property access to beds" ON public.beds;
DROP POLICY IF EXISTS "Property access to tenants" ON public.tenants;
DROP POLICY IF EXISTS "Property access to tenant_documents" ON public.tenant_documents;
DROP POLICY IF EXISTS "Property access to rent_invoices" ON public.rent_invoices;
DROP POLICY IF EXISTS "Property access to payments" ON public.payments;
DROP POLICY IF EXISTS "Property access to deposits" ON public.deposits;
DROP POLICY IF EXISTS "Property access to expenses" ON public.expenses;
DROP POLICY IF EXISTS "Property access to utility_bills" ON public.utility_bills;
DROP POLICY IF EXISTS "Property access to staff" ON public.staff;
DROP POLICY IF EXISTS "Property access to attendance" ON public.attendance;
DROP POLICY IF EXISTS "Property access to visitors" ON public.visitors;
DROP POLICY IF EXISTS "Property access to maintenance_requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Property access to notices" ON public.notices;
DROP POLICY IF EXISTS "Property access to audit_logs" ON public.audit_logs;

CREATE POLICY "Owners manage property members" ON public.property_members
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pgs WHERE id = pg_id AND owner_id = (select auth.uid())) OR (select public.is_admin()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pgs WHERE id = pg_id AND owner_id = (select auth.uid())) OR (select public.is_admin()));
CREATE POLICY "Members read own membership" ON public.property_members
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Managers operate rooms" ON public.rooms
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Managers view assigned properties" ON public.pgs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.property_members
      WHERE property_members.pg_id = pgs.id
        AND property_members.user_id = (select auth.uid())
        AND property_members.role = 'PROPERTY_MANAGER'
    )
  );

CREATE POLICY "Managers operate floors" ON public.floors
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Managers operate beds" ON public.beds
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Managers operate tenants" ON public.tenants
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Tenants read own record" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR lower(coalesce(email, '')) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );

CREATE POLICY "Managers operate tenant documents" ON public.tenant_documents
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND (select public.can_manage_property(t.pg_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND (select public.can_manage_property(t.pg_id))));
CREATE POLICY "Tenants read own documents" ON public.tenant_documents
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND (t.user_id = (select auth.uid()) OR lower(coalesce(t.email, '')) = lower(coalesce((select auth.jwt() ->> 'email'), '')))));

CREATE POLICY "Managers operate invoices" ON public.rent_invoices
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Tenants read own invoices" ON public.rent_invoices
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND (t.user_id = (select auth.uid()) OR lower(coalesce(t.email, '')) = lower(coalesce((select auth.jwt() ->> 'email'), '')))));
CREATE POLICY "Managers operate invoice items" ON public.invoice_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rent_invoices i WHERE i.id = invoice_id AND (select public.can_manage_property(i.pg_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.rent_invoices i WHERE i.id = invoice_id AND (select public.can_manage_property(i.pg_id))));

CREATE POLICY "Managers operate payments" ON public.payments
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Tenants read own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND (t.user_id = (select auth.uid()) OR lower(coalesce(t.email, '')) = lower(coalesce((select auth.jwt() ->> 'email'), '')))));
CREATE POLICY "Managers operate deposits" ON public.deposits
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Tenants read own deposits" ON public.deposits
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND (t.user_id = (select auth.uid()) OR lower(coalesce(t.email, '')) = lower(coalesce((select auth.jwt() ->> 'email'), '')))));
CREATE POLICY "Managers operate deposit transactions" ON public.deposit_transactions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.deposits d WHERE d.id = deposit_id AND (select public.can_manage_property(d.pg_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.deposits d WHERE d.id = deposit_id AND (select public.can_manage_property(d.pg_id))));

CREATE POLICY "Managers operate expenses" ON public.expenses
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Managers operate utilities" ON public.utility_bills
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Managers operate staff" ON public.staff
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Staff read their own profile" ON public.staff
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR lower(coalesce(email, '')) = lower(coalesce((select auth.jwt() ->> 'email'), '')));
CREATE POLICY "Managers operate attendance" ON public.attendance
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Staff read their own attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = staff_id AND s.user_id = (select auth.uid())));

CREATE POLICY "Managers operate visitors" ON public.visitors
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Managers operate maintenance" ON public.maintenance_requests
  FOR ALL TO authenticated
  USING ((select public.can_manage_property(pg_id)))
  WITH CHECK ((select public.can_manage_property(pg_id)));
CREATE POLICY "Tenants read their maintenance" ON public.maintenance_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND (t.user_id = (select auth.uid()) OR lower(coalesce(t.email, '')) = lower(coalesce((select auth.jwt() ->> 'email'), '')))));
CREATE POLICY "Staff read assigned maintenance" ON public.maintenance_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = assigned_staff_id AND s.user_id = (select auth.uid())));
CREATE POLICY "Managers operate notices" ON public.notices
  FOR ALL TO authenticated
  USING (pg_id IS NULL OR (select public.can_manage_property(pg_id)))
  WITH CHECK (pg_id IS NULL OR (select public.can_manage_property(pg_id)));
CREATE POLICY "Residents and staff read notices" ON public.notices
  FOR SELECT TO authenticated
  USING (
    pg_id IS NULL
    OR (select public.has_property_access(pg_id))
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.pg_id = notices.pg_id AND (t.user_id = (select auth.uid()) OR lower(coalesce(t.email, '')) = lower(coalesce((select auth.jwt() ->> 'email'), ''))))
  );
CREATE POLICY "Managers read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING ((select public.can_manage_property(pg_id)));
CREATE POLICY "Managers write audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK ((select public.can_manage_property(pg_id)));

CREATE OR REPLACE FUNCTION public.allocate_bed_to_tenant(p_bed_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_status TEXT;
  v_room_id UUID;
  v_pg_id UUID;
BEGIN
  SELECT status, room_id, pg_id INTO v_current_status, v_room_id, v_pg_id
  FROM public.beds WHERE id = p_bed_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bed not found'; END IF;
  IF NOT public.can_manage_property(v_pg_id) THEN RAISE EXCEPTION 'Not authorized for this property'; END IF;
  IF v_current_status <> 'VACANT' THEN RAISE EXCEPTION 'Bed is not vacant'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = p_tenant_id AND pg_id = v_pg_id AND status IN ('ACTIVE', 'NOTICE')) THEN
    RAISE EXCEPTION 'Tenant does not belong to this property';
  END IF;
  UPDATE public.beds SET status = 'OCCUPIED', occupied_by_tenant_id = p_tenant_id, updated_at = now() WHERE id = p_bed_id;
  UPDATE public.tenants SET bed_id = p_bed_id, room_id = v_room_id, status = 'ACTIVE', updated_at = now() WHERE id = p_tenant_id;
  UPDATE public.rooms SET occupied_beds = (SELECT count(*) FROM public.beds WHERE room_id = v_room_id AND status = 'OCCUPIED') WHERE id = v_room_id;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.checkout_tenant(p_tenant_id UUID, p_checkout_date DATE, p_deductions INT DEFAULT 0, p_refund_amount INT DEFAULT 0, p_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_bed_id UUID;
  v_room_id UUID;
  v_pg_id UUID;
BEGIN
  IF p_deductions < 0 OR p_refund_amount < 0 THEN RAISE EXCEPTION 'Amounts cannot be negative'; END IF;
  SELECT bed_id, room_id, pg_id INTO v_bed_id, v_room_id, v_pg_id FROM public.tenants WHERE id = p_tenant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tenant not found'; END IF;
  IF NOT public.can_manage_property(v_pg_id) THEN RAISE EXCEPTION 'Not authorized for this property'; END IF;
  IF EXISTS (SELECT 1 FROM public.deposits WHERE tenant_id = p_tenant_id AND p_deductions + p_refund_amount > total_deposit) THEN
    RAISE EXCEPTION 'Deposit settlement exceeds the collected deposit';
  END IF;
  UPDATE public.tenants SET status = 'MOVED_OUT', move_out_date = p_checkout_date,
    notes = CASE WHEN coalesce(btrim(p_notes), '') = '' THEN notes ELSE concat_ws(E'\\n', notes, 'Checkout note: ' || p_notes) END,
    updated_at = now() WHERE id = p_tenant_id;
  IF v_bed_id IS NOT NULL THEN UPDATE public.beds SET status = 'VACANT', occupied_by_tenant_id = NULL, updated_at = now() WHERE id = v_bed_id; END IF;
  IF v_room_id IS NOT NULL THEN UPDATE public.rooms SET occupied_beds = (SELECT count(*) FROM public.beds WHERE room_id = v_room_id AND status = 'OCCUPIED') WHERE id = v_room_id; END IF;
  UPDATE public.deposits SET deposit_status = CASE WHEN p_refund_amount > 0 THEN 'REFUNDED' ELSE 'ADJUSTED' END, refund_amount = p_refund_amount, notes = coalesce(p_notes, 'Settled at checkout'), updated_at = now() WHERE tenant_id = p_tenant_id;
  INSERT INTO public.deposit_transactions (deposit_id, amount, transaction_type, reason) SELECT id, p_deductions, 'DEDUCTION', 'Checkout settlement deductions' FROM public.deposits WHERE tenant_id = p_tenant_id AND p_deductions > 0;
  IF p_refund_amount > 0 THEN INSERT INTO public.deposit_transactions (deposit_id, amount, transaction_type, reason) SELECT id, p_refund_amount, 'REFUND', 'Checkout deposit refund' FROM public.deposits WHERE tenant_id = p_tenant_id; END IF;
  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.allocate_bed_to_tenant(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.checkout_tenant(UUID, DATE, INT, INT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.allocate_bed_to_tenant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_tenant(UUID, DATE, INT, INT, TEXT) TO authenticated;
