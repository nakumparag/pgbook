drop extension if exists "pg_net";

create type "public"."booking_status" as enum ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED');

create type "public"."food_status" as enum ('AVAILABLE', 'NOT_AVAILABLE', 'INCLUDED');

create type "public"."gender_preference" as enum ('BOYS', 'GIRLS', 'CO_LIVING');

create type "public"."pg_status" as enum ('DRAFT', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED', 'ARCHIVED');

create type "public"."room_availability" as enum ('AVAILABLE', 'LIMITED', 'FULL', 'UNAVAILABLE');

create type "public"."room_type_enum" as enum ('PERSONAL', '2_SHARING', '3_SHARING', '4_SHARING', '5_SHARING', '6_SHARING', '7_SHARING');

create type "public"."user_role" as enum ('USER', 'OWNER', 'ADMIN');


  create table "public"."amenities" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "icon" text,
    "category" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."amenities" enable row level security;


  create table "public"."blog_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."blog_categories" enable row level security;


  create table "public"."blog_posts" (
    "id" uuid not null default gen_random_uuid(),
    "category_id" uuid,
    "author_id" uuid,
    "title" text not null,
    "slug" text not null,
    "content" text not null,
    "cover_image" text,
    "is_published" boolean default false,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."blog_posts" enable row level security;


  create table "public"."business_hubs" (
    "id" uuid not null default gen_random_uuid(),
    "city_id" uuid,
    "locality_id" uuid,
    "name" text not null,
    "slug" text not null,
    "lat" numeric(10,8),
    "lng" numeric(11,8),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."business_hubs" enable row level security;


  create table "public"."cities" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "image_url" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "state" text,
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."cities" enable row level security;


  create table "public"."collection_pgs" (
    "collection_id" uuid not null,
    "pg_id" uuid not null,
    "sort_order" integer default 0,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."collection_pgs" enable row level security;


  create table "public"."collections" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid not null,
    "name" text not null,
    "description" text,
    "is_public" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."collections" enable row level security;


  create table "public"."colleges" (
    "id" uuid not null default gen_random_uuid(),
    "city_id" uuid,
    "locality_id" uuid,
    "name" text not null,
    "slug" text not null,
    "lat" numeric(10,8),
    "lng" numeric(11,8),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."colleges" enable row level security;


  create table "public"."comparisons" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "pg_id" uuid not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."comparisons" enable row level security;


  create table "public"."favorites" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "pg_id" uuid not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."favorites" enable row level security;


  create table "public"."localities" (
    "id" uuid not null default gen_random_uuid(),
    "city_id" uuid,
    "name" text not null,
    "slug" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "description" text,
    "is_active" boolean default true,
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."localities" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "body" text,
    "type" text not null default 'INFO'::text,
    "is_read" boolean default false,
    "link" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."notifications" enable row level security;


  create table "public"."pg_amenities" (
    "pg_id" uuid not null,
    "amenity_id" uuid not null
      );


alter table "public"."pg_amenities" enable row level security;


  create table "public"."pg_images" (
    "id" uuid not null default gen_random_uuid(),
    "pg_id" uuid not null,
    "url" text not null,
    "is_primary" boolean default false,
    "display_order" integer default 0,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "storage_path" text
      );


alter table "public"."pg_images" enable row level security;


  create table "public"."pgs" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid not null,
    "city_id" uuid not null,
    "locality_id" uuid not null,
    "name" text not null,
    "slug" text not null,
    "description" text,
    "address" text not null,
    "lat" numeric(10,8),
    "lng" numeric(11,8),
    "gender" public.gender_preference not null,
    "food_status" public.food_status not null,
    "status" public.pg_status not null default 'PENDING'::public.pg_status,
    "is_verified" boolean default false,
    "verified_at" timestamp with time zone,
    "rating" numeric(3,2) default 0.0,
    "review_count" integer default 0,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "featured" boolean default false,
    "published_at" timestamp with time zone,
    "monthly_rent_from" integer,
    "monthly_rent_to" integer,
    "contact_phone" text,
    "whatsapp_number" text
      );


alter table "public"."pgs" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "role" public.user_role not null default 'USER'::public.user_role,
    "full_name" text,
    "avatar_url" text,
    "phone" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."profiles" enable row level security;


  create table "public"."reports" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "pg_id" uuid not null,
    "reason" text not null,
    "details" text,
    "is_resolved" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."reports" enable row level security;


  create table "public"."reviews" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "pg_id" uuid not null,
    "rating" integer not null,
    "content" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "title" text,
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."reviews" enable row level security;


  create table "public"."rooms" (
    "id" uuid not null default gen_random_uuid(),
    "pg_id" uuid not null,
    "room_type" public.room_type_enum not null,
    "rent" integer not null,
    "security_deposit" integer not null,
    "total_beds" integer not null,
    "occupied_beds" integer not null default 0,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "food_available" boolean default false,
    "availability_status" public.room_availability default 'AVAILABLE'::public.room_availability,
    "available_beds" integer generated always as ((total_beds - occupied_beds)) stored
      );


alter table "public"."rooms" enable row level security;


  create table "public"."saved_searches" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "filters" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."saved_searches" enable row level security;


  create table "public"."visit_bookings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "pg_id" uuid not null,
    "visit_date" date not null,
    "visit_time" time without time zone not null,
    "status" public.booking_status not null default 'PENDING'::public.booking_status,
    "notes" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."visit_bookings" enable row level security;

CREATE UNIQUE INDEX amenities_name_key ON public.amenities USING btree (name);

CREATE UNIQUE INDEX amenities_pkey ON public.amenities USING btree (id);

CREATE UNIQUE INDEX blog_categories_name_key ON public.blog_categories USING btree (name);

CREATE UNIQUE INDEX blog_categories_pkey ON public.blog_categories USING btree (id);

CREATE UNIQUE INDEX blog_categories_slug_key ON public.blog_categories USING btree (slug);

CREATE UNIQUE INDEX blog_posts_pkey ON public.blog_posts USING btree (id);

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);

CREATE UNIQUE INDEX business_hubs_pkey ON public.business_hubs USING btree (id);

CREATE UNIQUE INDEX business_hubs_slug_key ON public.business_hubs USING btree (slug);

CREATE UNIQUE INDEX cities_pkey ON public.cities USING btree (id);

CREATE UNIQUE INDEX cities_slug_key ON public.cities USING btree (slug);

CREATE UNIQUE INDEX collection_pgs_pkey ON public.collection_pgs USING btree (collection_id, pg_id);

CREATE UNIQUE INDEX collections_pkey ON public.collections USING btree (id);

CREATE UNIQUE INDEX colleges_pkey ON public.colleges USING btree (id);

CREATE UNIQUE INDEX colleges_slug_key ON public.colleges USING btree (slug);

CREATE UNIQUE INDEX comparisons_pkey ON public.comparisons USING btree (id);

CREATE UNIQUE INDEX comparisons_user_id_pg_id_key ON public.comparisons USING btree (user_id, pg_id);

CREATE UNIQUE INDEX favorites_pkey ON public.favorites USING btree (id);

CREATE UNIQUE INDEX favorites_user_id_pg_id_key ON public.favorites USING btree (user_id, pg_id);

CREATE UNIQUE INDEX localities_city_id_slug_key ON public.localities USING btree (city_id, slug);

CREATE UNIQUE INDEX localities_pkey ON public.localities USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX pg_amenities_pkey ON public.pg_amenities USING btree (pg_id, amenity_id);

CREATE UNIQUE INDEX pg_images_pkey ON public.pg_images USING btree (id);

CREATE UNIQUE INDEX pgs_pkey ON public.pgs USING btree (id);

CREATE UNIQUE INDEX pgs_slug_key ON public.pgs USING btree (slug);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX reviews_user_id_pg_id_key ON public.reviews USING btree (user_id, pg_id);

CREATE UNIQUE INDEX rooms_pkey ON public.rooms USING btree (id);

CREATE UNIQUE INDEX saved_searches_pkey ON public.saved_searches USING btree (id);

CREATE UNIQUE INDEX visit_bookings_pkey ON public.visit_bookings USING btree (id);

alter table "public"."amenities" add constraint "amenities_pkey" PRIMARY KEY using index "amenities_pkey";

alter table "public"."blog_categories" add constraint "blog_categories_pkey" PRIMARY KEY using index "blog_categories_pkey";

alter table "public"."blog_posts" add constraint "blog_posts_pkey" PRIMARY KEY using index "blog_posts_pkey";

alter table "public"."business_hubs" add constraint "business_hubs_pkey" PRIMARY KEY using index "business_hubs_pkey";

alter table "public"."cities" add constraint "cities_pkey" PRIMARY KEY using index "cities_pkey";

alter table "public"."collection_pgs" add constraint "collection_pgs_pkey" PRIMARY KEY using index "collection_pgs_pkey";

alter table "public"."collections" add constraint "collections_pkey" PRIMARY KEY using index "collections_pkey";

alter table "public"."colleges" add constraint "colleges_pkey" PRIMARY KEY using index "colleges_pkey";

alter table "public"."comparisons" add constraint "comparisons_pkey" PRIMARY KEY using index "comparisons_pkey";

alter table "public"."favorites" add constraint "favorites_pkey" PRIMARY KEY using index "favorites_pkey";

alter table "public"."localities" add constraint "localities_pkey" PRIMARY KEY using index "localities_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."pg_amenities" add constraint "pg_amenities_pkey" PRIMARY KEY using index "pg_amenities_pkey";

alter table "public"."pg_images" add constraint "pg_images_pkey" PRIMARY KEY using index "pg_images_pkey";

alter table "public"."pgs" add constraint "pgs_pkey" PRIMARY KEY using index "pgs_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."rooms" add constraint "rooms_pkey" PRIMARY KEY using index "rooms_pkey";

alter table "public"."saved_searches" add constraint "saved_searches_pkey" PRIMARY KEY using index "saved_searches_pkey";

alter table "public"."visit_bookings" add constraint "visit_bookings_pkey" PRIMARY KEY using index "visit_bookings_pkey";

alter table "public"."amenities" add constraint "amenities_name_key" UNIQUE using index "amenities_name_key";

alter table "public"."blog_categories" add constraint "blog_categories_name_key" UNIQUE using index "blog_categories_name_key";

alter table "public"."blog_categories" add constraint "blog_categories_slug_key" UNIQUE using index "blog_categories_slug_key";

alter table "public"."blog_posts" add constraint "blog_posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."blog_posts" validate constraint "blog_posts_author_id_fkey";

alter table "public"."blog_posts" add constraint "blog_posts_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL not valid;

alter table "public"."blog_posts" validate constraint "blog_posts_category_id_fkey";

alter table "public"."blog_posts" add constraint "blog_posts_slug_key" UNIQUE using index "blog_posts_slug_key";

alter table "public"."business_hubs" add constraint "business_hubs_city_id_fkey" FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE not valid;

alter table "public"."business_hubs" validate constraint "business_hubs_city_id_fkey";

alter table "public"."business_hubs" add constraint "business_hubs_locality_id_fkey" FOREIGN KEY (locality_id) REFERENCES public.localities(id) ON DELETE SET NULL not valid;

alter table "public"."business_hubs" validate constraint "business_hubs_locality_id_fkey";

alter table "public"."business_hubs" add constraint "business_hubs_slug_key" UNIQUE using index "business_hubs_slug_key";

alter table "public"."cities" add constraint "cities_slug_key" UNIQUE using index "cities_slug_key";

alter table "public"."collection_pgs" add constraint "collection_pgs_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE not valid;

alter table "public"."collection_pgs" validate constraint "collection_pgs_collection_id_fkey";

alter table "public"."collection_pgs" add constraint "collection_pgs_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."collection_pgs" validate constraint "collection_pgs_pg_id_fkey";

alter table "public"."collections" add constraint "collections_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."collections" validate constraint "collections_owner_id_fkey";

alter table "public"."colleges" add constraint "colleges_city_id_fkey" FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE not valid;

alter table "public"."colleges" validate constraint "colleges_city_id_fkey";

alter table "public"."colleges" add constraint "colleges_locality_id_fkey" FOREIGN KEY (locality_id) REFERENCES public.localities(id) ON DELETE SET NULL not valid;

alter table "public"."colleges" validate constraint "colleges_locality_id_fkey";

alter table "public"."colleges" add constraint "colleges_slug_key" UNIQUE using index "colleges_slug_key";

alter table "public"."comparisons" add constraint "comparisons_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."comparisons" validate constraint "comparisons_pg_id_fkey";

alter table "public"."comparisons" add constraint "comparisons_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."comparisons" validate constraint "comparisons_user_id_fkey";

alter table "public"."comparisons" add constraint "comparisons_user_id_pg_id_key" UNIQUE using index "comparisons_user_id_pg_id_key";

alter table "public"."favorites" add constraint "favorites_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_pg_id_fkey";

alter table "public"."favorites" add constraint "favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_user_id_fkey";

alter table "public"."favorites" add constraint "favorites_user_id_pg_id_key" UNIQUE using index "favorites_user_id_pg_id_key";

alter table "public"."localities" add constraint "localities_city_id_fkey" FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE not valid;

alter table "public"."localities" validate constraint "localities_city_id_fkey";

alter table "public"."localities" add constraint "localities_city_id_slug_key" UNIQUE using index "localities_city_id_slug_key";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."pg_amenities" add constraint "pg_amenities_amenity_id_fkey" FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) ON DELETE CASCADE not valid;

alter table "public"."pg_amenities" validate constraint "pg_amenities_amenity_id_fkey";

alter table "public"."pg_amenities" add constraint "pg_amenities_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."pg_amenities" validate constraint "pg_amenities_pg_id_fkey";

alter table "public"."pg_images" add constraint "pg_images_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."pg_images" validate constraint "pg_images_pg_id_fkey";

alter table "public"."pgs" add constraint "pgs_city_id_fkey" FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE RESTRICT not valid;

alter table "public"."pgs" validate constraint "pgs_city_id_fkey";

alter table "public"."pgs" add constraint "pgs_locality_id_fkey" FOREIGN KEY (locality_id) REFERENCES public.localities(id) ON DELETE RESTRICT not valid;

alter table "public"."pgs" validate constraint "pgs_locality_id_fkey";

alter table "public"."pgs" add constraint "pgs_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."pgs" validate constraint "pgs_owner_id_fkey";

alter table "public"."pgs" add constraint "pgs_slug_key" UNIQUE using index "pgs_slug_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."reports" add constraint "reports_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_pg_id_fkey";

alter table "public"."reports" add constraint "reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_user_id_fkey";

alter table "public"."reviews" add constraint "reviews_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_pg_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";

alter table "public"."reviews" add constraint "reviews_user_id_pg_id_key" UNIQUE using index "reviews_user_id_pg_id_key";

alter table "public"."rooms" add constraint "rooms_occupied_beds_valid" CHECK (((occupied_beds >= 0) AND (occupied_beds <= total_beds))) not valid;

alter table "public"."rooms" validate constraint "rooms_occupied_beds_valid";

alter table "public"."rooms" add constraint "rooms_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."rooms" validate constraint "rooms_pg_id_fkey";

alter table "public"."rooms" add constraint "rooms_rent_non_negative" CHECK ((rent >= 0)) not valid;

alter table "public"."rooms" validate constraint "rooms_rent_non_negative";

alter table "public"."rooms" add constraint "rooms_security_deposit_non_negative" CHECK ((security_deposit >= 0)) not valid;

alter table "public"."rooms" validate constraint "rooms_security_deposit_non_negative";

alter table "public"."rooms" add constraint "rooms_total_beds_positive" CHECK ((total_beds > 0)) not valid;

alter table "public"."rooms" validate constraint "rooms_total_beds_positive";

alter table "public"."saved_searches" add constraint "saved_searches_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."saved_searches" validate constraint "saved_searches_user_id_fkey";

alter table "public"."visit_bookings" add constraint "visit_bookings_pg_id_fkey" FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE not valid;

alter table "public"."visit_bookings" validate constraint "visit_bookings_pg_id_fkey";

alter table "public"."visit_bookings" add constraint "visit_bookings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."visit_bookings" validate constraint "visit_bookings_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'USER'::user_role
  )
  ON CONFLICT (id) DO NOTHING;  -- idempotent: never fail on duplicate
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'::user_role
  );
$function$
;

grant references on table "public"."amenities" to "anon";

grant trigger on table "public"."amenities" to "anon";

grant truncate on table "public"."amenities" to "anon";

grant delete on table "public"."amenities" to "authenticated";

grant insert on table "public"."amenities" to "authenticated";

grant references on table "public"."amenities" to "authenticated";

grant select on table "public"."amenities" to "authenticated";

grant trigger on table "public"."amenities" to "authenticated";

grant truncate on table "public"."amenities" to "authenticated";

grant update on table "public"."amenities" to "authenticated";

grant references on table "public"."amenities" to "service_role";

grant trigger on table "public"."amenities" to "service_role";

grant truncate on table "public"."amenities" to "service_role";

grant references on table "public"."blog_categories" to "anon";

grant trigger on table "public"."blog_categories" to "anon";

grant truncate on table "public"."blog_categories" to "anon";

grant delete on table "public"."blog_categories" to "authenticated";

grant insert on table "public"."blog_categories" to "authenticated";

grant references on table "public"."blog_categories" to "authenticated";

grant select on table "public"."blog_categories" to "authenticated";

grant trigger on table "public"."blog_categories" to "authenticated";

grant truncate on table "public"."blog_categories" to "authenticated";

grant update on table "public"."blog_categories" to "authenticated";

grant references on table "public"."blog_categories" to "service_role";

grant trigger on table "public"."blog_categories" to "service_role";

grant truncate on table "public"."blog_categories" to "service_role";

grant references on table "public"."blog_posts" to "anon";

grant trigger on table "public"."blog_posts" to "anon";

grant truncate on table "public"."blog_posts" to "anon";

grant delete on table "public"."blog_posts" to "authenticated";

grant insert on table "public"."blog_posts" to "authenticated";

grant references on table "public"."blog_posts" to "authenticated";

grant select on table "public"."blog_posts" to "authenticated";

grant trigger on table "public"."blog_posts" to "authenticated";

grant truncate on table "public"."blog_posts" to "authenticated";

grant update on table "public"."blog_posts" to "authenticated";

grant references on table "public"."blog_posts" to "service_role";

grant trigger on table "public"."blog_posts" to "service_role";

grant truncate on table "public"."blog_posts" to "service_role";

grant references on table "public"."business_hubs" to "anon";

grant trigger on table "public"."business_hubs" to "anon";

grant truncate on table "public"."business_hubs" to "anon";

grant delete on table "public"."business_hubs" to "authenticated";

grant insert on table "public"."business_hubs" to "authenticated";

grant references on table "public"."business_hubs" to "authenticated";

grant select on table "public"."business_hubs" to "authenticated";

grant trigger on table "public"."business_hubs" to "authenticated";

grant truncate on table "public"."business_hubs" to "authenticated";

grant update on table "public"."business_hubs" to "authenticated";

grant references on table "public"."business_hubs" to "service_role";

grant trigger on table "public"."business_hubs" to "service_role";

grant truncate on table "public"."business_hubs" to "service_role";

grant references on table "public"."cities" to "anon";

grant trigger on table "public"."cities" to "anon";

grant truncate on table "public"."cities" to "anon";

grant delete on table "public"."cities" to "authenticated";

grant insert on table "public"."cities" to "authenticated";

grant references on table "public"."cities" to "authenticated";

grant select on table "public"."cities" to "authenticated";

grant trigger on table "public"."cities" to "authenticated";

grant truncate on table "public"."cities" to "authenticated";

grant update on table "public"."cities" to "authenticated";

grant references on table "public"."cities" to "service_role";

grant trigger on table "public"."cities" to "service_role";

grant truncate on table "public"."cities" to "service_role";

grant references on table "public"."collection_pgs" to "anon";

grant trigger on table "public"."collection_pgs" to "anon";

grant truncate on table "public"."collection_pgs" to "anon";

grant delete on table "public"."collection_pgs" to "authenticated";

grant insert on table "public"."collection_pgs" to "authenticated";

grant references on table "public"."collection_pgs" to "authenticated";

grant select on table "public"."collection_pgs" to "authenticated";

grant trigger on table "public"."collection_pgs" to "authenticated";

grant truncate on table "public"."collection_pgs" to "authenticated";

grant update on table "public"."collection_pgs" to "authenticated";

grant references on table "public"."collection_pgs" to "service_role";

grant trigger on table "public"."collection_pgs" to "service_role";

grant truncate on table "public"."collection_pgs" to "service_role";

grant references on table "public"."collections" to "anon";

grant trigger on table "public"."collections" to "anon";

grant truncate on table "public"."collections" to "anon";

grant delete on table "public"."collections" to "authenticated";

grant insert on table "public"."collections" to "authenticated";

grant references on table "public"."collections" to "authenticated";

grant select on table "public"."collections" to "authenticated";

grant trigger on table "public"."collections" to "authenticated";

grant truncate on table "public"."collections" to "authenticated";

grant update on table "public"."collections" to "authenticated";

grant references on table "public"."collections" to "service_role";

grant trigger on table "public"."collections" to "service_role";

grant truncate on table "public"."collections" to "service_role";

grant references on table "public"."colleges" to "anon";

grant trigger on table "public"."colleges" to "anon";

grant truncate on table "public"."colleges" to "anon";

grant delete on table "public"."colleges" to "authenticated";

grant insert on table "public"."colleges" to "authenticated";

grant references on table "public"."colleges" to "authenticated";

grant select on table "public"."colleges" to "authenticated";

grant trigger on table "public"."colleges" to "authenticated";

grant truncate on table "public"."colleges" to "authenticated";

grant update on table "public"."colleges" to "authenticated";

grant references on table "public"."colleges" to "service_role";

grant trigger on table "public"."colleges" to "service_role";

grant truncate on table "public"."colleges" to "service_role";

grant references on table "public"."comparisons" to "anon";

grant trigger on table "public"."comparisons" to "anon";

grant truncate on table "public"."comparisons" to "anon";

grant delete on table "public"."comparisons" to "authenticated";

grant insert on table "public"."comparisons" to "authenticated";

grant references on table "public"."comparisons" to "authenticated";

grant select on table "public"."comparisons" to "authenticated";

grant trigger on table "public"."comparisons" to "authenticated";

grant truncate on table "public"."comparisons" to "authenticated";

grant update on table "public"."comparisons" to "authenticated";

grant references on table "public"."comparisons" to "service_role";

grant trigger on table "public"."comparisons" to "service_role";

grant truncate on table "public"."comparisons" to "service_role";

grant references on table "public"."favorites" to "anon";

grant trigger on table "public"."favorites" to "anon";

grant truncate on table "public"."favorites" to "anon";

grant delete on table "public"."favorites" to "authenticated";

grant insert on table "public"."favorites" to "authenticated";

grant references on table "public"."favorites" to "authenticated";

grant select on table "public"."favorites" to "authenticated";

grant trigger on table "public"."favorites" to "authenticated";

grant truncate on table "public"."favorites" to "authenticated";

grant update on table "public"."favorites" to "authenticated";

grant references on table "public"."favorites" to "service_role";

grant trigger on table "public"."favorites" to "service_role";

grant truncate on table "public"."favorites" to "service_role";

grant references on table "public"."localities" to "anon";

grant trigger on table "public"."localities" to "anon";

grant truncate on table "public"."localities" to "anon";

grant delete on table "public"."localities" to "authenticated";

grant insert on table "public"."localities" to "authenticated";

grant references on table "public"."localities" to "authenticated";

grant select on table "public"."localities" to "authenticated";

grant trigger on table "public"."localities" to "authenticated";

grant truncate on table "public"."localities" to "authenticated";

grant update on table "public"."localities" to "authenticated";

grant references on table "public"."localities" to "service_role";

grant trigger on table "public"."localities" to "service_role";

grant truncate on table "public"."localities" to "service_role";

grant references on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant references on table "public"."pg_amenities" to "anon";

grant trigger on table "public"."pg_amenities" to "anon";

grant truncate on table "public"."pg_amenities" to "anon";

grant delete on table "public"."pg_amenities" to "authenticated";

grant insert on table "public"."pg_amenities" to "authenticated";

grant references on table "public"."pg_amenities" to "authenticated";

grant select on table "public"."pg_amenities" to "authenticated";

grant trigger on table "public"."pg_amenities" to "authenticated";

grant truncate on table "public"."pg_amenities" to "authenticated";

grant update on table "public"."pg_amenities" to "authenticated";

grant references on table "public"."pg_amenities" to "service_role";

grant trigger on table "public"."pg_amenities" to "service_role";

grant truncate on table "public"."pg_amenities" to "service_role";

grant references on table "public"."pg_images" to "anon";

grant trigger on table "public"."pg_images" to "anon";

grant truncate on table "public"."pg_images" to "anon";

grant delete on table "public"."pg_images" to "authenticated";

grant insert on table "public"."pg_images" to "authenticated";

grant references on table "public"."pg_images" to "authenticated";

grant select on table "public"."pg_images" to "authenticated";

grant trigger on table "public"."pg_images" to "authenticated";

grant truncate on table "public"."pg_images" to "authenticated";

grant update on table "public"."pg_images" to "authenticated";

grant references on table "public"."pg_images" to "service_role";

grant trigger on table "public"."pg_images" to "service_role";

grant truncate on table "public"."pg_images" to "service_role";

grant references on table "public"."pgs" to "anon";

grant trigger on table "public"."pgs" to "anon";

grant truncate on table "public"."pgs" to "anon";

grant delete on table "public"."pgs" to "authenticated";

grant insert on table "public"."pgs" to "authenticated";

grant references on table "public"."pgs" to "authenticated";

grant select on table "public"."pgs" to "authenticated";

grant trigger on table "public"."pgs" to "authenticated";

grant truncate on table "public"."pgs" to "authenticated";

grant update on table "public"."pgs" to "authenticated";

grant references on table "public"."pgs" to "service_role";

grant trigger on table "public"."pgs" to "service_role";

grant truncate on table "public"."pgs" to "service_role";

grant references on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant references on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant references on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant references on table "public"."rooms" to "anon";

grant trigger on table "public"."rooms" to "anon";

grant truncate on table "public"."rooms" to "anon";

grant delete on table "public"."rooms" to "authenticated";

grant insert on table "public"."rooms" to "authenticated";

grant references on table "public"."rooms" to "authenticated";

grant select on table "public"."rooms" to "authenticated";

grant trigger on table "public"."rooms" to "authenticated";

grant truncate on table "public"."rooms" to "authenticated";

grant update on table "public"."rooms" to "authenticated";

grant references on table "public"."rooms" to "service_role";

grant trigger on table "public"."rooms" to "service_role";

grant truncate on table "public"."rooms" to "service_role";

grant references on table "public"."saved_searches" to "anon";

grant trigger on table "public"."saved_searches" to "anon";

grant truncate on table "public"."saved_searches" to "anon";

grant delete on table "public"."saved_searches" to "authenticated";

grant insert on table "public"."saved_searches" to "authenticated";

grant references on table "public"."saved_searches" to "authenticated";

grant select on table "public"."saved_searches" to "authenticated";

grant trigger on table "public"."saved_searches" to "authenticated";

grant truncate on table "public"."saved_searches" to "authenticated";

grant update on table "public"."saved_searches" to "authenticated";

grant references on table "public"."saved_searches" to "service_role";

grant trigger on table "public"."saved_searches" to "service_role";

grant truncate on table "public"."saved_searches" to "service_role";

grant references on table "public"."visit_bookings" to "anon";

grant trigger on table "public"."visit_bookings" to "anon";

grant truncate on table "public"."visit_bookings" to "anon";

grant delete on table "public"."visit_bookings" to "authenticated";

grant insert on table "public"."visit_bookings" to "authenticated";

grant references on table "public"."visit_bookings" to "authenticated";

grant select on table "public"."visit_bookings" to "authenticated";

grant trigger on table "public"."visit_bookings" to "authenticated";

grant truncate on table "public"."visit_bookings" to "authenticated";

grant update on table "public"."visit_bookings" to "authenticated";

grant references on table "public"."visit_bookings" to "service_role";

grant trigger on table "public"."visit_bookings" to "service_role";

grant truncate on table "public"."visit_bookings" to "service_role";


  create policy "amenities_all_admin"
  on "public"."amenities"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "amenities_select_public"
  on "public"."amenities"
  as permissive
  for select
  to public
using (true);



  create policy "blog_categories_all_admin"
  on "public"."blog_categories"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "blog_categories_select_public"
  on "public"."blog_categories"
  as permissive
  for select
  to public
using (true);



  create policy "blog_posts_all_admin"
  on "public"."blog_posts"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "blog_posts_select_published"
  on "public"."blog_posts"
  as permissive
  for select
  to public
using ((is_published = true));



  create policy "business_hubs_all_admin"
  on "public"."business_hubs"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "business_hubs_select_public"
  on "public"."business_hubs"
  as permissive
  for select
  to public
using (true);



  create policy "cities_all_admin"
  on "public"."cities"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "cities_select_active"
  on "public"."cities"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "collection_pgs_all_own"
  on "public"."collection_pgs"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_pgs.collection_id) AND (collections.owner_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_pgs.collection_id) AND (collections.owner_id = auth.uid())))));



  create policy "collection_pgs_select_public"
  on "public"."collection_pgs"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_pgs.collection_id) AND (collections.is_public = true)))));



  create policy "collections_all_admin"
  on "public"."collections"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "collections_all_own"
  on "public"."collections"
  as permissive
  for all
  to public
using ((auth.uid() = owner_id))
with check ((auth.uid() = owner_id));



  create policy "collections_select_own"
  on "public"."collections"
  as permissive
  for select
  to public
using ((auth.uid() = owner_id));



  create policy "collections_select_public"
  on "public"."collections"
  as permissive
  for select
  to public
using ((is_public = true));



  create policy "colleges_all_admin"
  on "public"."colleges"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "colleges_select_public"
  on "public"."colleges"
  as permissive
  for select
  to public
using (true);



  create policy "comparisons_delete_self"
  on "public"."comparisons"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "comparisons_insert_self"
  on "public"."comparisons"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "comparisons_select_self"
  on "public"."comparisons"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "favorites_delete_self"
  on "public"."favorites"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "favorites_insert_self"
  on "public"."favorites"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "favorites_select_self"
  on "public"."favorites"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "localities_all_admin"
  on "public"."localities"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "localities_select_public"
  on "public"."localities"
  as permissive
  for select
  to public
using (true);



  create policy "notifications_delete_self"
  on "public"."notifications"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "notifications_insert_admin"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check (public.is_admin());



  create policy "notifications_select_self"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "notifications_update_self"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "pg_amenities_delete_owner"
  on "public"."pg_amenities"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = pg_amenities.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "pg_amenities_insert_owner"
  on "public"."pg_amenities"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = pg_amenities.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "pg_amenities_select_public"
  on "public"."pg_amenities"
  as permissive
  for select
  to public
using (true);



  create policy "pg_images_delete_owner"
  on "public"."pg_images"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = pg_images.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "pg_images_insert_owner"
  on "public"."pg_images"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = pg_images.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "pg_images_select_approved_public"
  on "public"."pg_images"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = pg_images.pg_id) AND (pgs.status = 'APPROVED'::public.pg_status)))));



  create policy "pg_images_select_own_owner"
  on "public"."pg_images"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = pg_images.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "pg_images_update_owner"
  on "public"."pg_images"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = pg_images.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "pgs_all_admin"
  on "public"."pgs"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "pgs_delete_owner"
  on "public"."pgs"
  as permissive
  for delete
  to public
using ((auth.uid() = owner_id));



  create policy "pgs_insert_owner"
  on "public"."pgs"
  as permissive
  for insert
  to public
with check (((auth.uid() = owner_id) AND (status <> ALL (ARRAY['APPROVED'::public.pg_status, 'REJECTED'::public.pg_status]))));



  create policy "pgs_select_approved_public"
  on "public"."pgs"
  as permissive
  for select
  to public
using ((status = 'APPROVED'::public.pg_status));



  create policy "pgs_select_own_owner"
  on "public"."pgs"
  as permissive
  for select
  to public
using ((auth.uid() = owner_id));



  create policy "pgs_update_owner"
  on "public"."pgs"
  as permissive
  for update
  to public
using ((auth.uid() = owner_id))
with check (((auth.uid() = owner_id) AND (status <> ALL (ARRAY['APPROVED'::public.pg_status, 'REJECTED'::public.pg_status]))));



  create policy "profiles_insert_self"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "profiles_select_public"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "profiles_update_admin"
  on "public"."profiles"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "profiles_update_self_no_role_change"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check (((auth.uid() = id) AND (role = ( SELECT profiles_1.role
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid())))));



  create policy "reports_all_admin"
  on "public"."reports"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "reports_insert_self"
  on "public"."reports"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "reports_select_owner"
  on "public"."reports"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = reports.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "reviews_all_admin"
  on "public"."reviews"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "reviews_delete_self"
  on "public"."reviews"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "reviews_insert_self"
  on "public"."reviews"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "reviews_select_public"
  on "public"."reviews"
  as permissive
  for select
  to public
using (true);



  create policy "reviews_update_self"
  on "public"."reviews"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "rooms_all_admin"
  on "public"."rooms"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "rooms_delete_owner"
  on "public"."rooms"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = rooms.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "rooms_insert_owner"
  on "public"."rooms"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = rooms.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "rooms_select_approved_public"
  on "public"."rooms"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = rooms.pg_id) AND (pgs.status = 'APPROVED'::public.pg_status)))));



  create policy "rooms_select_own_owner"
  on "public"."rooms"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = rooms.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "rooms_update_owner"
  on "public"."rooms"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = rooms.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "saved_searches_all_self"
  on "public"."saved_searches"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "bookings_all_admin"
  on "public"."visit_bookings"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "bookings_insert_self"
  on "public"."visit_bookings"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "bookings_select_owner"
  on "public"."visit_bookings"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = visit_bookings.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "bookings_select_self"
  on "public"."visit_bookings"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "bookings_update_owner"
  on "public"."visit_bookings"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.pgs
  WHERE ((pgs.id = visit_bookings.pg_id) AND (pgs.owner_id = auth.uid())))));



  create policy "bookings_update_self_cancel"
  on "public"."visit_bookings"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) AND (status = 'PENDING'::public.booking_status)))
with check (((auth.uid() = user_id) AND (status = 'CANCELLED'::public.booking_status)));


CREATE TRIGGER on_blog_posts_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_cities_updated BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_collections_updated BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_localities_updated BEFORE UPDATE ON public.localities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_pgs_updated BEFORE UPDATE ON public.pgs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_reports_updated BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_rooms_updated BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_saved_searches_updated BEFORE UPDATE ON public.saved_searches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_visit_bookings_updated BEFORE UPDATE ON public.visit_bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "owner_docs_storage_insert_owner"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'owner-documents'::text) AND (auth.uid() IS NOT NULL) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "owner_docs_storage_select_admin"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'owner-documents'::text) AND public.is_admin()));



  create policy "owner_docs_storage_select_self"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'owner-documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "pg_images_storage_delete_owner"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'pg-images'::text) AND (auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.pgs
  WHERE (((pgs.id)::text = (storage.foldername(pgs.name))[1]) AND (pgs.owner_id = auth.uid()))))));



  create policy "pg_images_storage_insert_owner"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'pg-images'::text) AND (auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.pgs
  WHERE (((pgs.id)::text = (storage.foldername(pgs.name))[1]) AND (pgs.owner_id = auth.uid()))))));



  create policy "pg_images_storage_select_public"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'pg-images'::text));



  create policy "pg_images_storage_update_owner"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'pg-images'::text) AND (auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.pgs
  WHERE (((pgs.id)::text = (storage.foldername(pgs.name))[1]) AND (pgs.owner_id = auth.uid()))))));



  create policy "profile_images_storage_delete_self"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'profile-images'::text) AND (auth.uid() IS NOT NULL) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "profile_images_storage_insert_self"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'profile-images'::text) AND (auth.uid() IS NOT NULL) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "profile_images_storage_select_public"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profile-images'::text));



  create policy "profile_images_storage_update_self"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'profile-images'::text) AND (auth.uid() IS NOT NULL) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



