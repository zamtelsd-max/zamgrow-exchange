import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Listing, SearchFilters } from '../../types'
import { MOCK_LISTINGS } from '../../services/mockData'

interface ListingsState {
  listings: Listing[]
  currentListing: Listing | null
  savedListings: string[]
  filters: SearchFilters
  isLoading: boolean
  total: number
  page: number
}

const initialState: ListingsState = {
  listings: MOCK_LISTINGS,
  currentListing: null,
  savedListings: ['l2', 'l5', 'l10'],
  filters: { sortBy: 'date_desc', limit: 12, page: 1 },
  isLoading: false,
  total: MOCK_LISTINGS.length,
  page: 1,
}

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setListings(state, action: PayloadAction<Listing[]>) {
      state.listings = action.payload
      state.total = action.payload.length
    },
    setCurrentListing(state, action: PayloadAction<Listing | null>) {
      state.currentListing = action.payload
    },
    setFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    toggleSaved(state, action: PayloadAction<string>) {
      const id = action.payload
      const idx = state.savedListings.indexOf(id)
      if (idx >= 0) {
        state.savedListings.splice(idx, 1)
      } else {
        state.savedListings.push(id)
      }
      const listing = state.listings.find(l => l.id === id)
      if (listing) listing.isSaved = !listing.isSaved
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    addListing(state, action: PayloadAction<Listing>) {
      state.listings.unshift(action.payload)
      state.total += 1
    },
    updateListing(state, action: PayloadAction<Partial<Listing> & { id: string }>) {
      const idx = state.listings.findIndex(l => l.id === action.payload.id)
      if (idx >= 0) {
        state.listings[idx] = { ...state.listings[idx], ...action.payload }
      }
    },
  },
})

export const {
  setListings, setCurrentListing, setFilters,
  toggleSaved, setLoading, addListing, updateListing,
} = listingsSlice.actions
export default listingsSlice.reducer
