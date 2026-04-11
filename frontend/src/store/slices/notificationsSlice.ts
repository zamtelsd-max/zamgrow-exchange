import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Notification } from '../../types'
import { MOCK_NOTIFICATIONS } from '../../services/mockData'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
}

const initialState: NotificationsState = {
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.isRead).length
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) state.unreadCount++
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find(n => n.id === action.payload)
      if (notif && !notif.isRead) {
        notif.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach(n => { n.isRead = true })
      state.unreadCount = 0
    },
  },
})

export const { setNotifications, addNotification, markAsRead, markAllAsRead } = notificationsSlice.actions
export default notificationsSlice.reducer
