import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import listingsReducer from './slices/listingsSlice'
import marketReducer from './slices/marketSlice'
import notificationsReducer from './slices/notificationsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingsReducer,
    market: marketReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
