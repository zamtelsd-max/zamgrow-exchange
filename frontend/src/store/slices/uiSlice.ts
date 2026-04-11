import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UIState {
  isMenuOpen: boolean
  isNotificationsOpen: boolean
  isAuthModalOpen: boolean
  authModalTab: 'login' | 'register'
  isSubscribeModalOpen: boolean
  isOfferModalOpen: boolean
  isPaymentModalOpen: boolean
  currentModal: string | null
  globalLoading: boolean
}

const initialState: UIState = {
  isMenuOpen: false,
  isNotificationsOpen: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  isSubscribeModalOpen: false,
  isOfferModalOpen: false,
  isPaymentModalOpen: false,
  currentModal: null,
  globalLoading: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMenu(state) { state.isMenuOpen = !state.isMenuOpen },
    closeMenu(state) { state.isMenuOpen = false },
    toggleNotifications(state) { state.isNotificationsOpen = !state.isNotificationsOpen },
    closeNotifications(state) { state.isNotificationsOpen = false },
    openAuthModal(state, action: PayloadAction<'login' | 'register'>) {
      state.isAuthModalOpen = true
      state.authModalTab = action.payload
    },
    closeAuthModal(state) { state.isAuthModalOpen = false },
    setAuthTab(state, action: PayloadAction<'login' | 'register'>) {
      state.authModalTab = action.payload
    },
    openSubscribeModal(state) { state.isSubscribeModalOpen = true },
    closeSubscribeModal(state) { state.isSubscribeModalOpen = false },
    openOfferModal(state) { state.isOfferModalOpen = true },
    closeOfferModal(state) { state.isOfferModalOpen = false },
    openPaymentModal(state) { state.isPaymentModalOpen = true },
    closePaymentModal(state) { state.isPaymentModalOpen = false },
    setCurrentModal(state, action: PayloadAction<string | null>) {
      state.currentModal = action.payload
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload
    },
    // alias for backward compat
    openModal(state, action: PayloadAction<string>) {
      state.currentModal = action.payload
    },
    closeModal(state) {
      state.currentModal = null
    },
  },
})

export const {
  toggleMenu, closeMenu,
  toggleNotifications, closeNotifications,
  openAuthModal, closeAuthModal, setAuthTab,
  openSubscribeModal, closeSubscribeModal,
  openOfferModal, closeOfferModal,
  openPaymentModal, closePaymentModal,
  setCurrentModal, setGlobalLoading,
  openModal, closeModal,
} = uiSlice.actions
export default uiSlice.reducer
