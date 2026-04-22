/**
 * Zamgrow Exchange — Live Price Service (Frontend)
 *
 * Fetches from the backend /api/v1/pricing/ticker endpoint.
 * Backend fetches WFP/HDX data server-side (no CORS issues),
 * caches for 6 hours, and normalises all units to per-kg.
 *
 * Fallback: localStorage cache → mock data (offline resilience).
 */

import type { PriceData } from '../types'
import { MOCK_PRICE_DATA } from './mockData'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'
const TICKER_URL = `${API_BASE}/pricing/ticker`
const CACHE_KEY = 'zamgrow_live_prices_v2'
const CACHE_TTL = 6 * 60 * 60 * 1000   // 6 hours (matches backend cache)

// ─── Adapter — backend ticker → PriceData type used by components ─────────────

interface TickerItem {
  productId: string
  product: string
  emoji: string
  avgPrice: number      // per 50kg
  pricePerKg: number
  unit: string
  trend: 'UP' | 'DOWN' | 'STABLE'
  changePercent: number
  province: string
  provinces: number
  markets: number
  lastUpdated: string
  source: string
  usdRate: number
}

function adaptTickerItem(item: TickerItem, index: number): PriceData {
  return {
    productId: item.productId,
    product: item.product,
    provinceId: index + 1,
    province: item.province,
    avgPrice: item.avgPrice,
    minPrice: Math.round(item.avgPrice * 0.88),
    maxPrice: Math.round(item.avgPrice * 1.15),
    suggestedPrice: Math.round(item.avgPrice * 0.97),
    confidenceScore: Math.min(0.5 + item.markets * 0.03, 0.95),
    dataPoints: item.markets,
    unit: item.unit,
    currency: 'ZMW',
    trend: item.trend,
    changePercent: item.changePercent,
    lastUpdated: item.lastUpdated
      ? new Date(item.lastUpdated).toISOString()
      : new Date().toISOString(),
  }
}

// ─── Fetch from backend ───────────────────────────────────────────────────────

export async function fetchLivePrices(): Promise<PriceData[]> {
  const res = await fetch(TICKER_URL, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(12000),
  })
  if (!res.ok) throw new Error(`Pricing API error: ${res.status}`)
  const json = await res.json()
  if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid pricing response')
  return json.data.map((item: TickerItem, i: number) => adaptTickerItem(item, i))
}

// ─── Public entry point with cache + fallback ─────────────────────────────────

export async function getLivePrices(): Promise<PriceData[]> {
  // 1. Try localStorage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { ts, data } = JSON.parse(cached)
      if (Date.now() - ts < CACHE_TTL && Array.isArray(data) && data.length > 0) {
        // Trigger background refresh if > 3 hours old
        if (Date.now() - ts > 3 * 60 * 60 * 1000) {
          fetchLivePrices()
            .then(fresh => localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: fresh })))
            .catch(() => {/* silent */})
        }
        return data
      }
    }
  } catch { /* ignore */ }

  // 2. Fetch from backend
  try {
    const data = await fetchLivePrices()
    if (data.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
      return data
    }
  } catch (e) {
    console.warn('[Zamgrow] Live price fetch failed, using fallback:', e)
  }

  // 3. Stale cache (any age)
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data } = JSON.parse(cached)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch { /* ignore */ }

  // 4. Mock data
  return MOCK_PRICE_DATA
}

// ─── Metadata source string for ticker badge ─────────────────────────────────

export async function getPriceSource(): Promise<string> {
  try {
    const res = await fetch(TICKER_URL, { signal: AbortSignal.timeout(5000) })
    const json = await res.json()
    if (json.fetchedAt) {
      const date = new Date(json.fetchedAt)
      return `WFP · ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
  } catch { /* */ }
  return 'WFP/HDX'
}
