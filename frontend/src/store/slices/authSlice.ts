import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const DEMO_USER: User = {
  id: 'demo-user',
  name: 'John Nkhoma',
  phone: '+260971234567',
  email: 'john@zamgrow.co.zm',
  role: 'BOTH',
  creditsBalance: 10,
  isVerified: true,
  rating: 4.7,
  reviewCount: 18,
  completedTransactions: 24,
  subscription: { id: 'sub1', userId: 'demo-user', plan: 'MONTHLY', startDate: '2025-04-01', endDate: '2025-05-01', status: 'ACTIVE' },
  createdAt: '2024-10-01T10:00:00Z',
}

const initialState: AuthState = { user: null, token: null, isAuthenticated: false, isLoading: false, error: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) { state.isLoading = true; state.error = null },
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.isLoading = false; state.isAuthenticated = true
      state.user = action.payload.user; state.token = action.payload.token; state.error = null
    },
    loginFailure(state, action: PayloadAction<string>) { state.isLoading = false; state.error = action.payload },
    logout(state) { state.user = null; state.token = null; state.isAuthenticated = false; state.error = null },
    updateUser(state, action: PayloadAction<Partial<User>>) { if (state.user) state.user = { ...state.user, ...action.payload } },
    deductCredit(state) { if (state.user && state.user.creditsBalance > 0) state.user.creditsBalance -= 1 },
    demoLogin(state) { state.isAuthenticated = true; state.user = DEMO_USER; state.token = 'demo-token-xxx'; state.isLoading = false },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, deductCredit, demoLogin } = authSlice.actions
export default authSlice.reducer
