// ============================================================
// Core Types for Zamgrow Exchange
// ============================================================

export type UserRole = 'farmer' | 'buyer' | 'dealer' | 'admin' | 'super_admin';
export type ListingType = 'BUY' | 'SELL';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'PENDING';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
export type PaymentMethod = 'AIRTEL' | 'MTN' | 'ZAMTEL' | 'CARD';
export type SubscriptionPlan = 'FREE' | 'MONTHLY' | 'ANNUAL';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Province {
  id: number;
  name: string;
  capital: string;
  agrozone: string;
  districts: District[];
  color?: string;
}

export interface District {
  id: number;
  name: string;
  provinceId: number;
  latitude?: number;
  longitude?: number;
}

export interface Category {
  id: number;
  name: string;
  emoji: string;
  image?: string;
  parentId?: number;
  items: string[];
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  province?: Province;
  district?: District;
  creditsBalance: number;
  isVerified: boolean;
  profilePhotoUrl?: string;
  rating?: number;
  reviewCount?: number;
  completedTransactions?: number;
  subscription?: Subscription;
  createdAt: string;

}

export interface Listing {
  id: string;
  userId: string;
  user: User;
  type: ListingType;
  product: string;
  category: string;
  categoryEmoji: string;
  quantity: number;
  unit: string;
  priceZmw: number;
  province: Province;
  district: District;
  description: string;
  status: ListingStatus;
  photos: ListingPhoto[];
  dateAvailable?: string;
  deadline?: string;
  expiresAt: string;
  createdAt: string;
  offersCount?: number;
  viewsCount?: number;
  isSaved?: boolean;
}

export interface ListingPhoto {
  id: string;
  listingId: string;
  url: string;
  sortOrder: number;
}

export interface Offer {
  id: string;
  listingId: string;
  listing?: Listing;
  initiator: User;
  receiver: User;
  offeredPrice: number;
  counterPrice?: number;
  quantity?: number;
  message?: string;
  status: OfferStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  offerId: string;
  offer?: Offer;
  finalPrice: number;
  status: 'PENDING' | 'COMPLETED';
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}

export interface Payment {
  id: string;
  userId: string;
  amountZmw: number;
  method: PaymentMethod;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  externalRef?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewer: User;
  revieweeId: string;
  transactionId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'OFFER' | 'MESSAGE' | 'PRICE_ALERT' | 'SUBSCRIPTION' | 'LISTING_EXPIRY' | 'REVIEW';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PriceData {
  productId: string;
  product: string;
  provinceId: number;
  province: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  suggestedPrice?: number;
  confidenceScore?: number;
  dataPoints?: number;
  unit: string;
  currency: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  changePercent: number;
  lastUpdated: string;
}

export interface HeatmapData {
  provinceId: number;
  provinceName: string;
  avgPrice: number;
  listingCount: number;
  intensity: number; // 0-1
}

export interface PriceAlert {
  id: string;
  userId: string;
  product: string;
  province: string;
  thresholdPrice: number;
  direction: 'ABOVE' | 'BELOW';
  isActive: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  monthlyRevenue: number;
  totalTransactions: number;
  pendingKyc: number;
  newUsersToday: number;
  newListingsToday: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  province?: string;
  district?: string;
  priceMin?: number;
  priceMax?: number;
  type?: ListingType;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'relevance' | 'proximity';
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
