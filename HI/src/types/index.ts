export type UserRole = 'admin' | 'business_admin' | 'user';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  businessId?: string;
  tempPassword?: string;
  createdAt?: any;
  lastLoginAt?: any;
  isActive: boolean;
}

export type BusinessType = 'hotel' | 'restaurant' | 'hotel_restaurant' | 'lodge' | 'resort';

export interface Business {
  businessId: string;
  businessName: string;
  businessType: BusinessType;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  coverImage: string;
  gallery: string[];
  videoUrl?: string | null;
  audioUrl?: string | null;
  rating: number;
  isActive: boolean;
  timings?: string;
  totalRooms?: number;
  availableRooms?: number;
  totalFoodItems?: number;
  availableFoodItems?: number;
  startingRoomPrice?: number;
  startingFoodPrice?: number;
  createdAt?: any;
  updatedAt?: any;
}

export type RoomAvailabilityStatus = 'Available' | 'Limited' | 'Fully Booked' | 'Unavailable';

export interface Room {
  roomId: string;
  businessId: string;
  roomName: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  availabilityStatus?: RoomAvailabilityStatus;
  createdAt?: any;
  updatedAt?: any;
}

export interface FoodItem {
  foodId: string;
  businessId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isVeg: boolean;
  preparationTime?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type SearchFilter = 'all' | 'food' | 'rooms' | 'both';

export interface RecentSearchItem {
  id: string;
  location: string;
  timestamp: number;
}

export interface CollabInquiry {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  businessType: BusinessType;
  message: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  createdAt?: any;
}
