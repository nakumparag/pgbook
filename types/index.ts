// Central type definitions for PGBook

export type UserRole = "USER" | "OWNER" | "ADMIN";
export type PGStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type PGType = "PG" | "HOSTEL" | "CO_LIVING";
export type GenderType = "MALE" | "FEMALE" | "UNISEX";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface User {
  id: string;
  email?: string; // Stored in auth.users, optional here since profile might not duplicate it
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: "BASIC" | "FOOD" | "SECURITY" | "CONNECTIVITY" | "RECREATION";
}

export interface PGImage {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface Room {
  id: string;
  type: string;
  capacity: number;
  rent: number;
  available: boolean;
}

export interface PGOwner {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email: string;
}

export interface Review {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  user: Pick<User, "id" | "full_name" | "avatar_url">;
}

export interface PGListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  address: string;
  city: string;
  area: string;
  lat?: number;
  lng?: number;
  rentMin: number;
  rentMax: number;
  type: PGType;
  gender: GenderType;
  status: PGStatus;
  totalBeds: number;
  availableBeds: number;
  rating: number;
  reviewCount: number;
  images: PGImage[];
  amenities: Amenity[];
  rules: string[];
  rooms: Room[];
  owner: PGOwner;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
}

export interface SearchFilters {
  city?: string;
  area?: string;
  gender?: GenderType;
  type?: PGType;
  rentMin?: number;
  rentMax?: number;
  amenities?: string[];
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Booking {
  id: string;
  visitDate: string;
  status: BookingStatus;
  pg: Pick<PGListing, "id" | "slug" | "title" | "city" | "images">;
  createdAt: string;
}

export interface City {
  name: string;
  slug: string;
  state: string;
  image: string;
  pgCount: number;
}

export const POPULAR_CITIES: City[] = [
  { name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat", image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80", pgCount: 1240 },
  { name: "Surat", slug: "surat", state: "Gujarat", image: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=400&q=80", pgCount: 890 },
  { name: "Vadodara", slug: "vadodara", state: "Gujarat", image: "https://images.unsplash.com/photo-1609340700698-e5f1f5b11a3e?w=400&q=80", pgCount: 620 },
  { name: "Rajkot", slug: "rajkot", state: "Gujarat", image: "https://images.unsplash.com/photo-1582407947304-fd86f28f3e5a?w=400&q=80", pgCount: 450 },
  { name: "Gandhinagar", slug: "gandhinagar", state: "Gujarat", image: "https://images.unsplash.com/photo-1599690925058-90e1a0b56154?w=400&q=80", pgCount: 310 },
  { name: "Anand", slug: "anand", state: "Gujarat", image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&q=80", pgCount: 180 },
  { name: "Bhavnagar", slug: "bhavnagar", state: "Gujarat", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", pgCount: 140 },
  { name: "Jamnagar", slug: "jamnagar", state: "Gujarat", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80", pgCount: 120 },
];

export const AMENITY_ICONS: Record<string, string> = {
  "WiFi": "Wifi",
  "AC": "Wind",
  "Meals": "UtensilsCrossed",
  "Parking": "Car",
  "Laundry": "WashingMachine",
  "Security": "Shield",
  "Power Backup": "Zap",
  "Hot Water": "Droplets",
  "Gym": "Dumbbell",
  "TV": "Tv",
  "Refrigerator": "Package",
  "Housekeeping": "Sparkles",
};
