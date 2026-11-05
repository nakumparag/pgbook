// ============================================================
// PGBook — Supabase Database Types
// Auto-maintained: matches schema.sql + migrations 002, 003, 004
// Use these types for all Supabase client calls.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Enum Types ──────────────────────────────────────────────
export type UserRole = 'USER' | 'OWNER' | 'ADMIN'
export type PgStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED'
export type GenderPreference = 'BOYS' | 'GIRLS' | 'CO_LIVING' | 'UNISEX'
export type FoodStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'INCLUDED' | 'BOTH'
export type RoomTypeEnum = 'PERSONAL' | '2_SHARING' | '3_SHARING' | '4_SHARING' | '5_SHARING' | '6_SHARING' | '7_SHARING'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
export type RoomAvailability = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'UNAVAILABLE'
export type ContactType = 'WHATSAPP' | 'CALL' | 'CALLBACK' | 'IN_APP'
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CLOSED' | 'CANCELLED'
export type OwnerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'

export interface Database {
  public: {
    Tables: {
      // ── organizations ──────────────────────────────────
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          phone: string | null
          city: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          phone?: string | null
          city?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          city?: string | null
          updated_at?: string
        }
        Relationships: []
      }

      // ── organization_members ────────────────────────────
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'OWNER' | 'MANAGER' | 'STAFF'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'OWNER' | 'MANAGER' | 'STAFF'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'OWNER' | 'MANAGER' | 'STAFF'
          created_at?: string
        }
        Relationships: []
      }

      // ── profiles ────────────────────────────────────────
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          id_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          id_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          id_verified?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── owner_profiles ──────────────────────────────────────
      owner_profiles: {
        Row: {
          id: string
          user_id: string
          status: OwnerVerificationStatus
          owner_type: string | null
          id_type: string | null
          id_number: string | null
          id_document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: OwnerVerificationStatus
          owner_type?: string | null
          id_type?: string | null
          id_number?: string | null
          id_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: OwnerVerificationStatus
          owner_type?: string | null
          id_type?: string | null
          id_number?: string | null
          id_document_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── approval_requests ─────────────────────────────
      approval_requests: {
        Row: {
          id: string
          owner_id: string
          pg_id: string | null
          request_type: "OWNER" | "PG" | null
          status: PgStatus
          admin_notes: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          pg_id?: string | null
          request_type?: "OWNER" | "PG" | null
          status?: PgStatus
          admin_notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          owner_id?: string
          pg_id?: string | null
          request_type?: "OWNER" | "PG" | null
          status?: PgStatus
          admin_notes?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── cities ──────────────────────────────────────────
      cities: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
          state: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          image_url?: string | null
          state?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          name?: string
          slug?: string
          image_url?: string | null
          state?: string | null
          is_active?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }

      // ── localities ──────────────────────────────────────
      localities: {
        Row: {
          id: string
          city_id: string
          name: string
          slug: string
          description: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          city_id: string
          name: string
          slug: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          name?: string
          slug?: string
          description?: string | null
          is_active?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "localities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── colleges ────────────────────────────────────────
      colleges: {
        Row: {
          id: string
          city_id: string | null
          locality_id: string | null
          name: string
          slug: string
          lat: number | null
          lng: number | null
          created_at: string
        }
        Insert: {
          id?: string
          city_id?: string | null
          locality_id?: string | null
          name: string
          slug: string
          lat?: number | null
          lng?: number | null
          created_at?: string
        }
        Update: {
          city_id?: string | null
          locality_id?: string | null
          name?: string
          slug?: string
          lat?: number | null
          lng?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "colleges_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colleges_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── business_hubs ───────────────────────────────────
      business_hubs: {
        Row: {
          id: string
          city_id: string | null
          locality_id: string | null
          name: string
          slug: string
          lat: number | null
          lng: number | null
          created_at: string
        }
        Insert: {
          id?: string
          city_id?: string | null
          locality_id?: string | null
          name: string
          slug: string
          lat?: number | null
          lng?: number | null
          created_at?: string
        }
        Update: {
          city_id?: string | null
          locality_id?: string | null
          name?: string
          slug?: string
          lat?: number | null
          lng?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hubs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_hubs_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── pgs ─────────────────────────────────────────────
      pgs: {
        Row: {
          id: string
          owner_id: string
          city_id: string
          locality_id: string
          name: string
          slug: string
          description: string | null
          address: string
          lat: number | null
          lng: number | null
          gender: GenderPreference
          food_status: FoodStatus
          status: PgStatus
          is_verified: boolean
          verified_at: string | null
          rating: number
          review_count: number
          featured: boolean | null
          published_at: string | null
          monthly_rent_from: number | null
          monthly_rent_to: number | null
          contact_phone: string | null
          whatsapp_number: string | null
          rules: string | string[] | null
          is_publicly_listed?: boolean | null
          organization_id?: string | null
          floors_count?: number | null
          total_rooms?: number | null
          checkin_time?: string | null
          checkout_time?: string | null
          notice_period_days?: number | null
          wifi_ssid?: string | null
          wifi_password?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          available_from: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          city_id: string
          locality_id: string
          name: string
          slug: string
          description?: string | null
          address: string
          lat?: number | null
          lng?: number | null
          gender: GenderPreference
          food_status: FoodStatus
          status?: PgStatus
          is_verified?: boolean
          verified_at?: string | null
          rating?: number
          review_count?: number
          featured?: boolean | null
          published_at?: string | null
          monthly_rent_from?: number | null
          monthly_rent_to?: number | null
          contact_phone?: string | null
          whatsapp_number?: string | null
          rules?: string | string[] | null
          is_publicly_listed?: boolean | null
          organization_id?: string | null
          floors_count?: number | null
          total_rooms?: number | null
          checkin_time?: string | null
          checkout_time?: string | null
          notice_period_days?: number | null
          wifi_ssid?: string | null
          wifi_password?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          available_from?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          owner_id?: string
          city_id?: string
          locality_id?: string
          name?: string
          slug?: string
          description?: string | null
          address?: string
          lat?: number | null
          lng?: number | null
          gender?: GenderPreference
          food_status?: FoodStatus
          status?: PgStatus
          is_verified?: boolean
          verified_at?: string | null
          rating?: number
          review_count?: number
          featured?: boolean | null
          published_at?: string | null
          monthly_rent_from?: number | null
          monthly_rent_to?: number | null
          contact_phone?: string | null
          whatsapp_number?: string | null
          rules?: string | string[] | null
          is_publicly_listed?: boolean | null
          organization_id?: string | null
          floors_count?: number | null
          total_rooms?: number | null
          checkin_time?: string | null
          checkout_time?: string | null
          notice_period_days?: number | null
          wifi_ssid?: string | null
          wifi_password?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          available_from?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pgs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pgs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pgs_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── rooms ───────────────────────────────────────────
      rooms: {
        Row: {
          id: string
          pg_id: string
          room_type: RoomTypeEnum
          rent: number
          security_deposit: number | null
          total_beds: number
          occupied_beds: number
          available_beds: number  // generated column
          food_available: boolean | null
          availability_status: RoomAvailability | null
          electricity_charges: number | null
          maintenance_charges: number | null
          other_charges: number | null
          floor_id?: string | null
          room_number?: string | null
          room_name?: string | null
          attached_bathroom?: boolean | null
          has_balcony?: boolean | null
          has_ac?: boolean | null
          amenities_list?: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          room_type: RoomTypeEnum
          rent: number
          security_deposit?: number | null
          total_beds: number
          occupied_beds?: number
          food_available?: boolean | null
          availability_status?: RoomAvailability | null
          electricity_charges?: number | null
          maintenance_charges?: number | null
          other_charges?: number | null
          floor_id?: string | null
          room_number?: string | null
          room_name?: string | null
          attached_bathroom?: boolean | null
          has_balcony?: boolean | null
          has_ac?: boolean | null
          amenities_list?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          pg_id?: string
          room_type?: RoomTypeEnum
          rent?: number
          security_deposit?: number | null
          total_beds?: number
          occupied_beds?: number
          food_available?: boolean | null
          availability_status?: RoomAvailability | null
          electricity_charges?: number | null
          maintenance_charges?: number | null
          other_charges?: number | null
          floor_id?: string | null
          room_number?: string | null
          room_name?: string | null
          attached_bathroom?: boolean | null
          has_balcony?: boolean | null
          has_ac?: boolean | null
          amenities_list?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── pg_images ───────────────────────────────────────
      pg_images: {
        Row: {
          id: string
          pg_id: string
          url: string
          storage_path: string | null
          is_primary: boolean
          display_order: number
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          url: string
          storage_path?: string | null
          is_primary?: boolean
          display_order?: number
          category?: string | null
          created_at?: string
        }
        Update: {
          url?: string
          storage_path?: string | null
          is_primary?: boolean
          display_order?: number
          category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pg_images_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── amenities ───────────────────────────────────────
      amenities: {
        Row: {
          id: string
          name: string
          icon: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          icon?: string | null
          category?: string | null
        }
        Relationships: []
      }

      // ── pg_amenities ─────────────────────────────────────
      pg_amenities: {
        Row: {
          pg_id: string
          amenity_id: string
        }
        Insert: {
          pg_id: string
          amenity_id: string
        }
        Update: {
          pg_id?: string
          amenity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pg_amenities_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pg_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── favorites ───────────────────────────────────────
      favorites: {
        Row: {
          id: string
          user_id: string
          pg_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pg_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          pg_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── visit_bookings ──────────────────────────────────
      visit_bookings: {
        Row: {
          id: string
          user_id: string
          pg_id: string
          visit_date: string
          visit_time: string
          status: BookingStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pg_id: string
          visit_date: string
          visit_time: string
          status?: BookingStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          visit_date?: string
          visit_time?: string
          status?: BookingStatus
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_bookings_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── reviews ─────────────────────────────────────────
      reviews: {
        Row: {
          id: string
          user_id: string
          pg_id: string
          rating: number
          title: string | null
          content: string | null
          status: 'PUBLISHED' | 'HIDDEN'
          display_name: string | null
          moderated_at: string | null
          moderation_note: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pg_id: string
          rating: number
          title?: string | null
          content?: string | null
          status?: 'PUBLISHED' | 'HIDDEN'
          display_name?: string | null
          moderated_at?: string | null
          moderation_note?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          rating?: number
          title?: string | null
          content?: string | null
          status?: 'PUBLISHED' | 'HIDDEN'
          moderated_at?: string | null
          moderation_note?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── reports ─────────────────────────────────────────
      reports: {
        Row: {
          id: string
          user_id: string | null
          pg_id: string
          reason: string
          details: string | null
          is_resolved: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          pg_id: string
          reason: string
          details?: string | null
          is_resolved?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          reason?: string
          details?: string | null
          is_resolved?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── comparisons ─────────────────────────────────────
      comparisons: {
        Row: {
          id: string
          user_id: string
          pg_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pg_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          pg_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparisons_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── saved_searches ──────────────────────────────────
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          filters: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          filters: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          filters?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── notifications ───────────────────────────────────
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          type: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          type?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          is_read?: boolean
          link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── inquiries ───────────────────────────────────────
      inquiries: {
        Row: {
          id: string
          pg_id: string
          user_id: string | null
          owner_id: string
          name: string
          phone: string | null
          contact_type: ContactType
          preferred_time: string | null
          message: string | null
          status: InquiryStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          user_id?: string | null
          owner_id?: string
          name?: string
          phone?: string | null
          contact_type?: ContactType
          preferred_time?: string | null
          message?: string | null
          status?: InquiryStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          pg_id?: string
          user_id?: string | null
          owner_id?: string
          name?: string
          phone?: string | null
          contact_type?: ContactType
          preferred_time?: string | null
          message?: string | null
          status?: InquiryStatus
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── review_reports ───────────────────────────────────
      review_reports: {
        Row: {
          id: string
          review_id: string
          reporter_id: string
          reason: 'SPAM' | 'ABUSE' | 'NOT_RELEVANT' | 'OTHER'
          details: string | null
          status: 'OPEN' | 'REVIEWED' | 'DISMISSED'
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          review_id: string
          reporter_id: string
          reason: 'SPAM' | 'ABUSE' | 'NOT_RELEVANT' | 'OTHER'
          details?: string | null
          status?: 'OPEN' | 'REVIEWED' | 'DISMISSED'
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          status?: 'OPEN' | 'REVIEWED' | 'DISMISSED'
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'review_reports_review_id_fkey'
            columns: ['review_id']
            isOneToOne: false
            referencedRelation: 'reviews'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'review_reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }

      // ── pg_visits ───────────────────────────────────────
      pg_visits: {
        Row: {
          id: string
          pg_id: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          pg_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pg_visits_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pg_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── collections ─────────────────────────────────────
      collections: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          is_public?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── collection_pgs ───────────────────────────────────
      collection_pgs: {
        Row: {
          collection_id: string
          pg_id: string
          sort_order: number
          created_at: string
        }
        Insert: {
          collection_id: string
          pg_id: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_pgs_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_pgs_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── blog_categories ─────────────────────────────────
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
        }
        Relationships: []
      }

      // ── blog_posts ──────────────────────────────────────
      blog_posts: {
        Row: {
          id: string
          category_id: string | null
          author_id: string | null
          title: string
          slug: string
          content: string
          cover_image: string | null
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          author_id?: string | null
          title: string
          slug: string
          content: string
          cover_image?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          author_id?: string | null
          title?: string
          slug?: string
          content?: string
          cover_image?: string | null
          is_published?: boolean
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── property_members ──────────────────────────────────
      property_members: {
        Row: {
          id: string
          pg_id: string
          user_id: string
          role: 'OWNER' | 'PROPERTY_MANAGER' | 'STAFF'
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          user_id: string
          role: 'OWNER' | 'PROPERTY_MANAGER' | 'STAFF'
          permissions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          user_id?: string
          role?: 'OWNER' | 'PROPERTY_MANAGER' | 'STAFF'
          permissions?: Json
          created_at?: string
        }
        Relationships: []
      }

      // ── floors ────────────────────────────────────────────
      floors: {
        Row: {
          id: string
          pg_id: string
          floor_number: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          floor_number: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          floor_number?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ── beds ──────────────────────────────────────────────
      beds: {
        Row: {
          id: string
          pg_id: string
          room_id: string
          bed_number: string
          monthly_rent: number
          status: 'VACANT' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
          occupied_by_tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          room_id: string
          bed_number: string
          monthly_rent?: number
          status?: 'VACANT' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
          occupied_by_tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          room_id?: string
          bed_number?: string
          monthly_rent?: number
          status?: 'VACANT' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
          occupied_by_tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── tenants ───────────────────────────────────────────
      tenants: {
        Row: {
          id: string
          pg_id: string
          owner_id: string
          room_id: string | null
          bed_id: string | null
          user_id: string | null
          full_name: string
          phone: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id_proof_type: string | null
          id_proof_number: string | null
          id_proof_url: string | null
          monthly_rent: number
          security_deposit: number
          move_in_date: string
          move_out_date: string | null
          rent_due_day: number
          status: 'ACTIVE' | 'NOTICE' | 'MOVED_OUT'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          owner_id: string
          room_id?: string | null
          bed_id?: string | null
          user_id?: string | null
          full_name: string
          phone: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id_proof_type?: string | null
          id_proof_number?: string | null
          id_proof_url?: string | null
          monthly_rent: number
          security_deposit?: number
          move_in_date?: string
          move_out_date?: string | null
          rent_due_day?: number
          status?: 'ACTIVE' | 'NOTICE' | 'MOVED_OUT'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          owner_id?: string
          room_id?: string | null
          bed_id?: string | null
          user_id?: string | null
          full_name?: string
          phone?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id_proof_type?: string | null
          id_proof_number?: string | null
          id_proof_url?: string | null
          monthly_rent?: number
          security_deposit?: number
          move_in_date?: string
          move_out_date?: string | null
          rent_due_day?: number
          status?: 'ACTIVE' | 'NOTICE' | 'MOVED_OUT'
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── tenant_documents ──────────────────────────────────
      tenant_documents: {
        Row: {
          id: string
          tenant_id: string
          doc_type: string
          file_name: string
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          doc_type: string
          file_name: string
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          doc_type?: string
          file_name?: string
          file_url?: string
        }
        Relationships: []
      }

      // ── rent_invoices ─────────────────────────────────────
      rent_invoices: {
        Row: {
          id: string
          invoice_number: string
          pg_id: string
          tenant_id: string
          bed_id: string | null
          month_year: string
          rent_amount: number
          utility_amount: number
          discount_amount: number
          late_fee: number
          total_amount: number
          paid_amount: number
          balance_due: number
          due_date: string
          status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          pg_id: string
          tenant_id: string
          bed_id?: string | null
          month_year: string
          rent_amount?: number
          utility_amount?: number
          discount_amount?: number
          late_fee?: number
          total_amount: number
          paid_amount?: number
          balance_due?: number
          due_date: string
          status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          pg_id?: string
          tenant_id?: string
          bed_id?: string | null
          month_year?: string
          rent_amount?: number
          utility_amount?: number
          discount_amount?: number
          late_fee?: number
          total_amount?: number
          paid_amount?: number
          balance_due?: number
          due_date?: string
          status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED'
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_invoices_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_invoices_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── invoice_items ───────────────────────────────────
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          amount: number
          item_type: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          amount: number
          item_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          amount?: number
          item_type?: string
        }
        Relationships: []
      }

      // ── payments ──────────────────────────────────────────
      payments: {
        Row: {
          id: string
          receipt_number: string
          pg_id: string
          tenant_id: string
          invoice_id: string | null
          amount: number
          payment_mode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
          transaction_ref: string | null
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          pg_id: string
          tenant_id: string
          invoice_id?: string | null
          amount: number
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
          transaction_ref?: string | null
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          pg_id?: string
          tenant_id?: string
          invoice_id?: string | null
          amount?: number
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE'
          transaction_ref?: string | null
          payment_date?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "rent_invoices"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── deposits ────────────────────────────────────────
      deposits: {
        Row: {
          id: string
          pg_id: string
          tenant_id: string
          total_deposit: number
          deposit_status: 'HELD' | 'ADJUSTED' | 'REFUNDED'
          refund_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          tenant_id: string
          total_deposit: number
          deposit_status?: 'HELD' | 'ADJUSTED' | 'REFUNDED'
          refund_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          tenant_id?: string
          total_deposit?: number
          deposit_status?: 'HELD' | 'ADJUSTED' | 'REFUNDED'
          refund_amount?: number | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }

      // ── deposit_transactions ──────────────────────────────
      deposit_transactions: {
        Row: {
          id: string
          deposit_id: string
          amount: number
          transaction_type: 'COLLECTION' | 'DEDUCTION' | 'REFUND'
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deposit_id: string
          amount: number
          transaction_type: 'COLLECTION' | 'DEDUCTION' | 'REFUND'
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deposit_id?: string
          amount?: number
          transaction_type?: 'COLLECTION' | 'DEDUCTION' | 'REFUND'
          reason?: string | null
        }
        Relationships: []
      }

      // ── expenses ──────────────────────────────────────────
      expenses: {
        Row: {
          id: string
          pg_id: string
          owner_id: string
          category: string
          title: string
          description: string | null
          amount: number
          expense_date: string
          receipt_url: string | null
          vendor_name: string | null
          vendor_phone: string | null
          is_recurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          owner_id: string
          category: string
          title: string
          description?: string | null
          amount: number
          expense_date?: string
          receipt_url?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          owner_id?: string
          category?: string
          title?: string
          description?: string | null
          amount?: number
          expense_date?: string
          receipt_url?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
          is_recurring?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── utility_bills ─────────────────────────────────────
      utility_bills: {
        Row: {
          id: string
          pg_id: string
          utility_type: 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'GAS' | 'MAINTENANCE' | 'OTHER'
          billing_period: string
          amount: number
          paid_amount: number
          due_date: string
          status: 'PENDING' | 'PAID' | 'OVERDUE'
          bill_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          utility_type: 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'GAS' | 'MAINTENANCE' | 'OTHER'
          billing_period: string
          amount: number
          paid_amount?: number
          due_date: string
          status?: 'PENDING' | 'PAID' | 'OVERDUE'
          bill_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          utility_type?: 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'GAS' | 'MAINTENANCE' | 'OTHER'
          billing_period?: string
          amount?: number
          paid_amount?: number
          due_date?: string
          status?: 'PENDING' | 'PAID' | 'OVERDUE'
          bill_url?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_bills_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── staff ─────────────────────────────────────────────
      staff: {
        Row: {
          id: string
          pg_id: string
          user_id: string | null
          name: string
          phone: string
          email: string | null
          role: 'WARDEN' | 'COOK' | 'CLEANER' | 'SECURITY' | 'MAINTENANCE' | 'MANAGER' | 'OTHER'
          salary: number
          status: 'ACTIVE' | 'INACTIVE'
          joining_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          user_id?: string | null
          name: string
          phone: string
          email?: string | null
          role?: 'WARDEN' | 'COOK' | 'CLEANER' | 'SECURITY' | 'MAINTENANCE' | 'MANAGER' | 'OTHER'
          salary?: number
          status?: 'ACTIVE' | 'INACTIVE'
          joining_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          user_id?: string | null
          name?: string
          phone?: string
          email?: string | null
          role?: 'WARDEN' | 'COOK' | 'CLEANER' | 'SECURITY' | 'MAINTENANCE' | 'MANAGER' | 'OTHER'
          salary?: number
          status?: 'ACTIVE' | 'INACTIVE'
          joining_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── attendance ────────────────────────────────────────
      attendance: {
        Row: {
          id: string
          pg_id: string
          staff_id: string
          date: string
          check_in_time: string | null
          check_out_time: string | null
          status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          staff_id: string
          date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          staff_id?: string
          date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── visitors ──────────────────────────────────────────
      visitors: {
        Row: {
          id: string
          pg_id: string
          tenant_id: string | null
          visitor_name: string
          visitor_phone: string
          purpose: string | null
          check_in_time: string
          check_out_time: string | null
          id_type: string | null
          id_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          tenant_id?: string | null
          visitor_name: string
          visitor_phone: string
          purpose?: string | null
          check_in_time?: string
          check_out_time?: string | null
          id_type?: string | null
          id_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          tenant_id?: string | null
          visitor_name?: string
          visitor_phone?: string
          purpose?: string | null
          check_in_time?: string
          check_out_time?: string | null
          id_type?: string | null
          id_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitors_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── maintenance_requests ──────────────────────────────
      maintenance_requests: {
        Row: {
          id: string
          pg_id: string
          room_id: string | null
          tenant_id: string | null
          assigned_staff_id: string | null
          title: string
          description: string
          category: 'PLUMBING' | 'ELECTRICAL' | 'FURNITURE' | 'CLEANING' | 'AC' | 'WIFI' | 'SECURITY' | 'GENERAL' | 'OTHER'
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'
          resolved_at: string | null
          resolution_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          room_id?: string | null
          tenant_id?: string | null
          assigned_staff_id?: string | null
          title: string
          description: string
          category?: 'PLUMBING' | 'ELECTRICAL' | 'FURNITURE' | 'CLEANING' | 'AC' | 'WIFI' | 'SECURITY' | 'GENERAL' | 'OTHER'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'
          resolved_at?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string
          room_id?: string | null
          tenant_id?: string | null
          assigned_staff_id?: string | null
          title?: string
          description?: string
          category?: 'PLUMBING' | 'ELECTRICAL' | 'FURNITURE' | 'CLEANING' | 'AC' | 'WIFI' | 'SECURITY' | 'GENERAL' | 'OTHER'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'
          resolved_at?: string | null
          resolution_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── notices ───────────────────────────────────────────
      notices: {
        Row: {
          id: string
          pg_id: string | null
          title: string
          content: string
          target_role: 'ALL' | 'TENANTS' | 'STAFF'
          priority: 'NORMAL' | 'IMPORTANT' | 'URGENT'
          is_pinned: boolean
          is_active: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id?: string | null
          title: string
          content: string
          target_role?: 'ALL' | 'TENANTS' | 'STAFF'
          priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT'
          is_pinned?: boolean
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pg_id?: string | null
          title?: string
          content?: string
          target_role?: 'ALL' | 'TENANTS' | 'STAFF'
          priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT'
          is_pinned?: boolean
          is_active?: boolean
          expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── audit_logs ────────────────────────────────────────
      audit_logs: {
        Row: {
          id: string
          pg_id: string | null
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          pg_id?: string | null
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          pg_id?: string | null
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json
        }
        Relationships: []
      }
    }

    Views: Record<string, never>
    Functions: {
      owner_set_pg_status: { Args: { target_pg_id: string; target_status: PgStatus }; Returns: boolean }
      admin_set_pg_status: { Args: { target_pg_id: string; target_status: PgStatus }; Returns: boolean }
      admin_set_pg_verified: { Args: { target_pg_id: string; verified: boolean }; Returns: boolean }
      admin_set_review_status: { Args: { target_review_id: string; target_status: string; note?: string | null }; Returns: boolean }
      admin_set_owner_profile: { Args: { target_user_id: string; approve: boolean }; Returns: boolean }
      admin_set_profile_verified: { Args: { target_user_id: string; verified: boolean }; Returns: boolean }
      allocate_bed_to_tenant: { Args: { p_bed_id: string; p_tenant_id: string }; Returns: boolean }
      checkout_tenant: { Args: { p_tenant_id: string; p_checkout_date: string; p_deductions?: number; p_refund_amount?: number; p_notes?: string | null }; Returns: boolean }
    }
    Enums: {
      user_role: UserRole
      pg_status: PgStatus
      gender_preference: GenderPreference
      food_status: FoodStatus
      room_type_enum: RoomTypeEnum
      booking_status: BookingStatus
      room_availability: RoomAvailability
    }
  }
}

// ── Convenience Row Types ─────────────────────────────────────
// Use these throughout the application for typed records
export type Profile = Database['public']['Tables']['profiles']['Row']
export type City = Database['public']['Tables']['cities']['Row']
export type Locality = Database['public']['Tables']['localities']['Row']
export type PG = Database['public']['Tables']['pgs']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type PGImage = Database['public']['Tables']['pg_images']['Row']
export type Amenity = Database['public']['Tables']['amenities']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type VisitBooking = Database['public']['Tables']['visit_bookings']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Comparison = Database['public']['Tables']['comparisons']['Row']
export type SavedSearch = Database['public']['Tables']['saved_searches']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']

// PG Business Manager Models
export type PropertyMember = Database['public']['Tables']['property_members']['Row']
export type Floor = Database['public']['Tables']['floors']['Row']
export type Bed = Database['public']['Tables']['beds']['Row']
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantDocument = Database['public']['Tables']['tenant_documents']['Row']
export type RentInvoice = Database['public']['Tables']['rent_invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Deposit = Database['public']['Tables']['deposits']['Row']
export type DepositTransaction = Database['public']['Tables']['deposit_transactions']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type UtilityBill = Database['public']['Tables']['utility_bills']['Row']
export type Staff = Database['public']['Tables']['staff']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row']
export type Visitor = Database['public']['Tables']['visitors']['Row']
export type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row']
export type Notice = Database['public']['Tables']['notices']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// ── PG with relations (for detail page and cards) ────────────
export type PGWithRelations = PG & {
  cities: Pick<City, 'id' | 'name' | 'slug'> | null
  localities: Pick<Locality, 'id' | 'name' | 'slug'> | null
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'phone'> | null
  rooms: Room[]
  pg_images: PGImage[]
  amenities: { amenities: Amenity }[]
  reviews: Review[]
  is_favorited?: boolean
}
