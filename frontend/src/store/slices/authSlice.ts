import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  role: 'farmer' | 'buyer' | 'dealer' | 'admin'
  province: string
  district: string
  credits: number
  subscription: 'free' | 'basic' | 'pro' | 'premium'
  avatar?: string
  verified: boolean
  rating: number
  totalReviews: number
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  otpSent: boolean
  otpPhone: string
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  otpSent: false,
  otpPhone: '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('zamgrow_user', JSON.stringify(action.payload.user))
      localStorage.setItem('zamgrow_token', action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('zamgrow_user')
      localStorage.removeItem('zamgrow_token')
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setOtpSent: (state, action: PayloadAction<{ sent: boolean; phone: string }>) => {
      state.otpSent = action.payload.sent
      state.otpPhone = action.payload.phone
    },
    updateCredits: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.credits = action.payload
      }
    },
  },
})

export const { setUser, logout, setLoading, setOtpSent, updateCredits } = authSlice.actions
export default authSlice.reducer
