// ============================================================
// PGBook — Sample / Demo PG Listings for MVP
// Fictional sample data for testing and demo display
// ============================================================

import type { SupabasePGListing } from "@/components/pg/PGCard";

export interface SamplePGDetail extends SupabasePGListing {
  description: string;
  contact_phone: string;
  available_from?: string;
  rules?: string[];
  owner_id?: string;
  monthly_rent_from?: number;
  monthly_rent_to?: number;
}

export const SAMPLE_PGS: SamplePGDetail[] = [
  {
    id: "sample-pg-1",
    slug: "sunrise-pg-sola",
    name: "Sunrise PG",
    address: "Near Science City Road, Sola, Ahmedabad, Gujarat 380060",
    gender: "BOYS",
    status: "APPROVED",
    is_verified: true,
    rating: 4.5,
    review_count: 14,
    description: "Comfortable PG accommodation with basic facilities for students and working professionals. Clean rooms, high-speed internet, and home-style cooked food.",
    contact_phone: "9876543210",
    cities: { name: "Ahmedabad" },
    localities: { name: "Sola" },
    rooms: [
      { rent: 6000, room_type: "3_SHARING" },
      { rent: 7500, room_type: "2_SHARING" }
    ],
    pg_images: [
      {
        url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
        is_primary: true
      },
      {
        url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80",
        is_primary: false
      }
    ],
    pg_amenities: [
      { amenities: { name: "WiFi", icon: "wifi", category: "Basic" } },
      { amenities: { name: "CCTV", icon: "cctv", category: "Security" } },
      { amenities: { name: "Parking", icon: "car", category: "Facilities" } },
      { amenities: { name: "Washing Machine", icon: "washing-machine", category: "Services" } },
      { amenities: { name: "Food Available", icon: "utensils", category: "Meals" } },
      { amenities: { name: "Power Backup", icon: "battery-charging", category: "Facilities" } }
    ]
  },
  {
    id: "sample-pg-2",
    slug: "shivam-executive-pg-navrangpura",
    name: "Shivam Executive PG",
    address: "Opposite Commerce College, Navrangpura, Ahmedabad, Gujarat 380009",
    gender: "BOYS",
    status: "APPROVED",
    is_verified: true,
    rating: 4.8,
    review_count: 22,
    description: "Modern, fully-furnished PG located close to major colleges and corporate offices in Navrangpura. Includes daily housekeeping and nutritious meals.",
    contact_phone: "9876543211",
    cities: { name: "Ahmedabad" },
    localities: { name: "Navrangpura" },
    rooms: [
      { rent: 7500, room_type: "2_SHARING" },
      { rent: 11000, room_type: "PERSONAL" }
    ],
    pg_images: [
      {
        url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80",
        is_primary: true
      },
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
        is_primary: false
      }
    ],
    pg_amenities: [
      { amenities: { name: "WiFi", icon: "wifi", category: "Basic" } },
      { amenities: { name: "AC", icon: "snowflake", category: "Comfort" } },
      { amenities: { name: "Attached Bathroom", icon: "bath", category: "Room" } },
      { amenities: { name: "Laundry", icon: "washing-machine", category: "Services" } },
      { amenities: { name: "Food Available", icon: "utensils", category: "Meals" } },
      { amenities: { name: "CCTV", icon: "cctv", category: "Security" } }
    ]
  },
  {
    id: "sample-pg-3",
    slug: "shanti-girls-living-satellite",
    name: "Shanti Girls Living PG",
    address: "Near ISRO Colony, Satellite Road, Ahmedabad, Gujarat 380015",
    gender: "GIRLS",
    status: "APPROVED",
    is_verified: true,
    rating: 4.7,
    review_count: 19,
    description: "Safe, secure and peaceful girls PG in the heart of Satellite. 24/7 security guard, biometric access, home-cooked food and spacious rooms.",
    contact_phone: "9876543212",
    cities: { name: "Ahmedabad" },
    localities: { name: "Satellite" },
    rooms: [
      { rent: 8500, room_type: "PERSONAL" },
      { rent: 6500, room_type: "2_SHARING" }
    ],
    pg_images: [
      {
        url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
        is_primary: true
      },
      {
        url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
        is_primary: false
      }
    ],
    pg_amenities: [
      { amenities: { name: "WiFi", icon: "wifi", category: "Basic" } },
      { amenities: { name: "AC", icon: "snowflake", category: "Comfort" } },
      { amenities: { name: "Security Guard", icon: "shield", category: "Security" } },
      { amenities: { name: "CCTV", icon: "cctv", category: "Security" } },
      { amenities: { name: "Food Available", icon: "utensils", category: "Meals" } },
      { amenities: { name: "Attached Bathroom", icon: "bath", category: "Room" } }
    ]
  },
  {
    id: "sample-pg-4",
    slug: "green-valley-coliving-vastrapur",
    name: "Green Valley Co-Living PG",
    address: "Behind Vastrapur Lake Garden, Vastrapur, Ahmedabad, Gujarat 380015",
    gender: "CO_LIVING",
    status: "APPROVED",
    is_verified: false,
    rating: 4.3,
    review_count: 8,
    description: "Budget-friendly shared accommodation right next to Vastrapur Lake. Ideal for students and interns looking for quality stay at affordable rates.",
    contact_phone: "9876543213",
    cities: { name: "Ahmedabad" },
    localities: { name: "Vastrapur" },
    rooms: [
      { rent: 5500, room_type: "4_SHARING" },
      { rent: 6500, room_type: "3_SHARING" }
    ],
    pg_images: [
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
        is_primary: true
      },
      {
        url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80",
        is_primary: false
      }
    ],
    pg_amenities: [
      { amenities: { name: "WiFi", icon: "wifi", category: "Basic" } },
      { amenities: { name: "Parking", icon: "car", category: "Facilities" } },
      { amenities: { name: "CCTV", icon: "cctv", category: "Security" } },
      { amenities: { name: "Washing Machine", icon: "washing-machine", category: "Services" } },
      { amenities: { name: "Power Backup", icon: "battery-charging", category: "Facilities" } },
      { amenities: { name: "Food Available", icon: "utensils", category: "Meals" } }
    ]
  }
];

export function getSamplePGBySlug(slug: string): SamplePGDetail | null {
  return SAMPLE_PGS.find(pg => pg.slug === slug) || null;
}
