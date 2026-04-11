import axios from 'axios'
import { store } from '../store'
import toast from 'react-hot-toast'
import { MOCK_LISTINGS, MOCK_USERS, MOCK_PRICE_DATA, MOCK_HEATMAP_DATA, MOCK_NOTIFICATIONS, MOCK_PRICE_SUGGESTIONS } from './mockData'
import { Listing } from '../store/slices/listingsSlice'

const USE_MOCK = true // Set to false when backend is running

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.message || 'An error occurred'
    if (error.response?.status !== 401) toast.error(msg)
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  sendOtp: async (phone: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 800))
      return { success: true, message: 'OTP sent to ' + phone }
    }
    return apiClient.post('/auth/otp/send', { phone })
  },
  verifyOtp: async (phone: string, otp: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 600))
      if (otp === '123456' || otp.length === 6) {
        const user = MOCK_USERS[0]
        return { user, token: 'mock_token_' + Date.now() }
      }
      throw new Error('Invalid OTP')
    }
    return apiClient.post('/auth/otp/verify', { phone, otp })
  },
  login: async (phone: string, password: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 700))
      const user = MOCK_USERS.find(u => u.phone === phone) || MOCK_USERS[0]
      return { user, token: 'mock_token_' + Date.now() }
    }
    return apiClient.post('/auth/login', { phone, password })
  },
  register: async (data: { name: string; phone: string; role: string; province: string }) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000))
      const newUser = { ...MOCK_USERS[0], ...data, id: 'u_' + Date.now() }
      return { user: newUser, token: 'mock_token_' + Date.now() }
    }
    return apiClient.post('/auth/register', data)
  },
}

// Listings API
export const listingsAPI = {
  getAll: async (params: Record<string, string | number>) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      let filtered = [...MOCK_LISTINGS]
      if (params.category) filtered = filtered.filter(l => l.category === params.category)
      if (params.province) filtered = filtered.filter(l => l.province === params.province)
      if (params.type) filtered = filtered.filter(l => l.type === params.type)
      if (params.search) {
        const q = String(params.search).toLowerCase()
        filtered = filtered.filter(l => l.title.toLowerCase().includes(q) || l.product.toLowerCase().includes(q))
      }
      if (params.price_min) filtered = filtered.filter(l => l.price >= Number(params.price_min))
      if (params.price_max) filtered = filtered.filter(l => l.price <= Number(params.price_max))
      const page = Number(params.page) || 1
      const limit = Number(params.limit) || 12
      const start = (page - 1) * limit
      return {
        listings: filtered.slice(start, start + limit),
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      }
    }
    return apiClient.get('/listings', { params })
  },
  getById: async (id: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      const listing = MOCK_LISTINGS.find(l => l.id === id) || MOCK_LISTINGS[0]
      return listing
    }
    return apiClient.get(`/listings/${id}`)
  },
  create: async (data: Partial<Listing>) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000))
      const listing: Listing = {
        ...data as Listing,
        id: 'l_' + Date.now(),
        views: 0,
        offers: 0,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        isFeatured: false,
        status: 'active',
      }
      return listing
    }
    return apiClient.post('/listings', data)
  },
  makeOffer: async (listingId: string, price: number, message: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 600))
      return { id: 'offer_' + Date.now(), listingId, price, message, status: 'pending' }
    }
    return apiClient.post(`/listings/${listingId}/offers`, { price, message })
  },
  addToWatchlist: async (listingId: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      return { success: true }
    }
    return apiClient.post(`/users/watchlist/${listingId}`)
  },
}

// Market API
export const marketAPI = {
  getPrices: async (product: string, province?: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      return MOCK_PRICE_DATA[product] || MOCK_PRICE_DATA.Maize
    }
    return apiClient.get('/market/prices', { params: { product, province } })
  },
  getHeatmap: async (product?: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      return MOCK_HEATMAP_DATA
    }
    return apiClient.get('/market/heatmap', { params: { product } })
  },
  getPriceSuggestion: async (product: string, province: string, quantity: number) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 800))
      return MOCK_PRICE_SUGGESTIONS[product] || MOCK_PRICE_SUGGESTIONS.Maize
    }
    return apiClient.get('/pricing/suggest', { params: { product, province, quantity } })
  },
}

// User API
export const userAPI = {
  getProfile: async (userId?: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      return userId ? MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0] : MOCK_USERS[0]
    }
    return userId ? apiClient.get(`/users/${userId}/profile`) : apiClient.get('/users/me')
  },
  getWatchlist: async () => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      return MOCK_LISTINGS.slice(0, 4)
    }
    return apiClient.get('/users/watchlist')
  },
  getNotifications: async () => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 200))
      return MOCK_NOTIFICATIONS
    }
    return apiClient.get('/notifications')
  },
}

// Admin API
export const adminAPI = {
  getStats: async () => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      return {
        totalUsers: 1247,
        activeListings: 892,
        totalTransactions: 3456,
        revenue: 145680,
        newUsersThisWeek: 87,
        listingsThisWeek: 134,
        pendingModeration: 23,
        recentTransactions: [],
      }
    }
    return apiClient.get('/admin/stats')
  },
  getUsers: async (params?: Record<string, string | number>) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      return { users: MOCK_USERS, total: MOCK_USERS.length }
    }
    return apiClient.get('/admin/users', { params })
  },
  banUser: async (userId: string) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      return { success: true }
    }
    return apiClient.post(`/admin/users/${userId}/ban`)
  },
  getModerationQueue: async () => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      return MOCK_LISTINGS.slice(0, 5).map(l => ({ ...l, status: 'pending' }))
    }
    return apiClient.get('/admin/moderation')
  },
}

export default apiClient
