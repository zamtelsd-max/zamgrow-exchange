import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  modals: {
    mobileMoney: boolean
    offerModal: boolean
    imageViewer: boolean
  }
  globalLoading: boolean
  searchQuery: string
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: false,
  modals: {
    mobileMoney: false,
    offerModal: false,
    imageViewer: false,
  },
  globalLoading: false,
  searchQuery: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      document.documentElement.classList.toggle('dark', state.darkMode)
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
})

export const { toggleDarkMode, setSidebarOpen, openModal, closeModal, setGlobalLoading, setSearchQuery } = uiSlice.actions
export default uiSlice.reducer
