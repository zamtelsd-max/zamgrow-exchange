/**
 * Zamgrow Exchange — Live API Client
 * All frontend data calls go through here.
 * Set VITE_API_URL in .env.production to your Railway backend URL.
 */

const BASE = import.meta.env.VITE_API_URL || 'https://zamgrow-api.up.railway.app/api/v1'

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('zamgrow_token')
export const setToken = (t: string) => localStorage.setItem('zamgrow_token', t)
export const clearToken = () => localStorage.removeItem('zamgrow_token')

// ── Base fetch wrapper ────────────────────────────────────────────────────────
async function req<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options: { auth?: boolean; blob?: boolean } = { auth: true }
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.auth !== false) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (options.blob) return res.blob() as unknown as T

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`)
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    requestOtp:  (phone: string) =>
      req<{ message: string }>('POST', '/auth/otp/request', { phone }, { auth: false }),

    verifyOtp:   (phone: string, code: string) =>
      req<{ token: string; user: any }>('POST', '/auth/otp/verify', { phone, code }, { auth: false }),

    register:    (data: { name: string; phone: string; role: string; province: string; district?: string }) =>
      req<{ token: string; user: any }>('POST', '/auth/register', data, { auth: false }),

    me:          () => req<{ data: any }>('GET', '/users/me'),
  },

  // ── Listings ────────────────────────────────────────────────────────────────
  listings: {
    list:    (params?: Record<string, string | number>) => {
      const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
      return req<{ data: any[]; meta: any }>('GET', `/listings${qs}`, undefined, { auth: false })
    },
    get:     (id: string) =>
      req<{ data: any }>('GET', `/listings/${id}`, undefined, { auth: false }),
    create:  (data: any) => req<{ data: any }>('POST', '/listings', data),
    update:  (id: string, data: any) => req<{ data: any }>('PATCH', `/listings/${id}`, data),
    delete:  (id: string) => req<{ message: string }>('DELETE', `/listings/${id}`),
    myListings: () => req<{ data: any[] }>('GET', '/listings/my'),
  },

  // ── Market prices ───────────────────────────────────────────────────────────
  market: {
    prices:    (province?: string) =>
      req<{ data: any[] }>('GET', `/market/prices${province ? `?province=${province}` : ''}`, undefined, { auth: false }),
    heatmap:   () =>
      req<{ data: any[] }>('GET', '/market/heatmap', undefined, { auth: false }),
    history:   (productId: string) =>
      req<{ data: any[] }>('GET', `/market/history/${productId}`, undefined, { auth: false }),
  },

  // ── Offers ──────────────────────────────────────────────────────────────────
  offers: {
    make:    (listingId: string, price: number, message?: string) =>
      req<{ data: any }>('POST', '/offers', { listingId, price, message }),
    respond: (offerId: string, status: 'accepted' | 'rejected' | 'countered', counterPrice?: number) =>
      req<{ data: any }>('PATCH', `/offers/${offerId}`, { status, counterPrice }),
    myOffers: () => req<{ data: any[] }>('GET', '/offers/my'),
  },

  // ── Payments ────────────────────────────────────────────────────────────────
  payments: {
    initiate: (data: { method: string; amount: number; phone?: string; purpose: string }) =>
      req<{ data: any; paymentUrl?: string }>('POST', '/payments/initiate', data),
    verify:   (ref: string) =>
      req<{ data: any; status: string }>('GET', `/payments/verify/${ref}`),
    history:  () => req<{ data: any[] }>('GET', '/payments/history'),
  },

  // ── Notifications ───────────────────────────────────────────────────────────
  notifications: {
    list:     () => req<{ data: any[] }>('GET', '/notifications'),
    markRead: (id: string) => req<{}>('PATCH', `/notifications/${id}/read`),
    markAll:  () => req<{}>('POST', '/notifications/read-all'),
  },

  // ── Users ───────────────────────────────────────────────────────────────────
  users: {
    profile:    (id: string) =>
      req<{ data: any }>('GET', `/users/${id}`, undefined, { auth: false }),
    update:     (data: any) => req<{ data: any }>('PATCH', '/users/me', data),
    watchlist:  () => req<{ data: any[] }>('GET', '/users/watchlist'),
    addWatch:   (listingId: string) => req<{}>('POST', '/users/watchlist', { listingId }),
    removeWatch:(listingId: string) => req<{}>('DELETE', `/users/watchlist/${listingId}`),
  },

  // ── Sales Performance (TDR / ZBM / HSD) ────────────────────────────────────
  sales: {
    // HSD: all zones national view
    allZones:   () =>
      req<{ data: any[]; period: string }>('GET', '/sales/zones'),

    // ZBM: their zone only  |  HSD: any zone
    zone:       (zoneId: string) =>
      req<{ data: any }>('GET', `/sales/zones/${zoneId}`),

    // TDR: own performance vs target
    myPerf:     () =>
      req<{ data: any }>('GET', '/sales/my'),

    // HSD: set/update zone targets
    setTargets: (data: {
      zoneId: string; period: string
      targetRevenue: number; targetListings: number
      targetNewFarmers: number; targetTransactions: number
    }) => req<{ data: any; message: string }>('POST', '/sales/targets', data),

    // TDR: log an activity
    logActivity: (data: {
      type: 'listing_posted' | 'farmer_onboarded' | 'transaction_completed' | 'revenue_recorded'
      amount?: number; description?: string
    }) => req<{ data: any }>('POST', '/sales/activity', data),

    // ZBM/HSD: ranked TDR leaderboard
    leaderboard: (zoneId?: string) =>
      req<{ data: any[] }>('GET', `/sales/leaderboard${zoneId ? `?zoneId=${zoneId}` : ''}`),

    // Monthly history for a TDR
    history:    (tdrId: string) =>
      req<{ data: any }>('GET', `/sales/history/${tdrId}`),

    // HSD: CSV export
    exportCsv:  () =>
      req<Blob>('GET', '/sales/export', undefined, { auth: true, blob: true }),

    // Admin: seed zones
    setupZones: () =>
      req<{ message: string }>('POST', '/sales/setup/zones'),
  },
}

export default api
