import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Listing {
  id: string
  title: string
  description: string
  type: 'sell' | 'buy'
  price: number
  unit: string
  quantity: number
  category: string
  product: string
  province: string
  district: string
  photos: string[]
  sellerId: string
  sellerName: string
  sellerRating: number
  sellerPhone: string
  verified: boolean
  status: 'active' | 'sold' | 'expired' | 'pending'
  views: number
  offers: number
  createdAt: string
  expiresAt: string
  isFeatured: boolean
}

export interface ListingFilters {
  category: string
  province: string
  district: string
  type: string
  minPrice: number
  maxPrice: number
  search: string
  sortBy: string
}

interface ListingsState {
  listings: Listing[]
  currentListing: Listing | null
  filters: ListingFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  loading: boolean
  error: string | null
}

const initialFilters: ListingFilters = {
  category: '',
  province: '',
  district: '',
  type: '',
  minPrice: 0,
  maxPrice: 0,
  search: '',
  sortBy: 'newest',
}

const initialState: ListingsState = {
  listings: [],
  currentListing: null,
  filters: initialFilters,
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
  loading: false,
  error: null,
}

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setListings: (state, action: PayloadAction<{ listings: Listing[]; total: number; totalPages: number }>) => {
      state.listings = action.payload.listings
      state.pagination.total = action.payload.total
      state.pagination.totalPages = action.payload.totalPages
    },
    setCurrentListing: (state, action: PayloadAction<Listing | null>) => {
      state.currentListing = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<ListingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetFilters: (state) => {
      state.filters = initialFilters
    },
  },
})

export const { setListings, setCurrentListing, setFilters, setPage, setLoading, setError, resetFilters } = listingsSlice.actions
export default listingsSlice.reducer
