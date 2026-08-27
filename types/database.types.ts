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
export type FoodStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'INCLUDED'
export type RoomTypeEnum = 'PERSONAL' | '2_SHARING' | '3_SHARING' | '4_SHARING' | '5_SHARING' | '6_SHARING' | '7_SHARING'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
export type RoomAvailability = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'UNAVAILABLE'
export type ContactType = 'WHATSAPP' | 'CALL' | 'CALLBACK'
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED'
export type OwnerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'

export interface Database {
  public: {
    Tables: {
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
          rules: string[] | null
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
          rules?: string[] | null
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
          rules?: string[] | null
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
          security_deposit: number
          total_beds: number
          occupied_beds: number
          available_beds: number  // generated column
          food_available: boolean | null
          availability_status: RoomAvailability | null
          electricity_charges: number | null
          maintenance_charges: number | null
          other_charges: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pg_id: string
          room_type: RoomTypeEnum
          rent: number
          security_deposit: number
          total_beds: number
          occupied_beds?: number
          food_available?: boolean | null
          availability_status?: RoomAvailability | null
          electricity_charges?: number | null
          maintenance_charges?: number | null
          other_charges?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          pg_id?: string
          room_type?: RoomTypeEnum
          rent?: number
          security_deposit?: number
          total_beds?: number
          occupied_beds?: number
          food_available?: boolean | null
          availability_status?: RoomAvailability | null
          electricity_charges?: number | null
          maintenance_charges?: number | null
          other_charges?: number | null
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
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          rating?: number
          title?: string | null
          content?: string | null
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
          phone: string
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
          owner_id: string
          name: string
          phone: string
          contact_type: ContactType
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
          phone?: string
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
    }

    Views: Record<string, never>
    Functions: Record<string, never>
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
