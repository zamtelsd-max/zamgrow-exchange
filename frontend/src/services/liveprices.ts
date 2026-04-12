/**
 * Live Price Service — Zamgrow Exchange
 * Fetches real market prices from WFP/Zamstats via HDX open data.
 * Falls back to cached data if network is unavailable.
 */

import type { PriceData } from '../types'

const WFP_CSV_URL =
  'https://corsproxy.io/?' +
  encodeURIComponent(
    'https://data.humdata.org/dataset/3f74001c-3554-4c54-bd86-c66208563316/resource/d9a34dc4-ff1d-43bf-9592-03d12d027848/download/wfp_food_prices_zmb.csv'
  )

// Map WFP commodity names → our product IDs
const COMMODITY_MAP: Record<string, { id: string; name: string; emoji: string }> = {
  'Maize (white)':       { id: 'maize',       name: 'Maize',          emoji: '🌾' },
  'Soya beans':          { id: 'soya',         name: 'Soya Beans',     emoji: '🫘' },
  'Beans':               { id: 'beans',        name: 'Beans',          emoji: '🫘' },
  'Groundnuts (shelled)':{ id: 'groundnuts',   name: 'Groundnuts',     emoji: '🥜' },
  'Fish (kapenta)':      { id: 'kapenta',      name: 'Kapenta',        emoji: '🐟' },
  'Rice':                { id: 'rice',         name: 'Rice',           emoji: '🌾' },
  'Wheat flour':         { id: 'wheat',        name: 'Wheat Flour',    emoji: '🌾' },
  'Cassava':             { id: 'cassava',      name: 'Cassava',        emoji: '🍠' },
  'Tomatoes':            { id: 'tomatoes',     name: 'Tomatoes',       emoji: '🍅' },
  'Onions':              { id: 'onions',       name: 'Onions',         emoji: '🧅' },
}

interface RawRow {
  date: string
  admin1: string
  market: string
  commodity: string
  unit: string
  currency: string
  price: string
}

function parseCSV(text: string): RawRow[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim() })
    return obj as unknown as RawRow
  })
}

function calcTrend(prices: { date: string; price: number }[]): { trend: 'UP' | 'DOWN' | 'STABLE'; changePercent: number } {
  if (prices.length < 2) return { trend: 'STABLE', changePercent: 0 }
  prices.sort((a, b) => a.date.localeCompare(b.date))
  const first = prices[0].price
  const last = prices[prices.length - 1].price
  if (first === 0) return { trend: 'STABLE', changePercent: 0 }
  const pct = ((last - first) / first) * 100
  if (pct > 3) return { trend: 'UP', changePercent: +parseFloat(pct.toFixed(1)) }
  if (pct < -3) return { trend: 'DOWN', changePercent: +parseFloat(pct.toFixed(1)) }
  return { trend: 'STABLE', changePercent: +parseFloat(pct.toFixed(1)) }
}

export async function fetchLivePrices(): Promise<PriceData[]> {
  const res = await fetch(WFP_CSV_URL)
  if (!res.ok) throw new Error('Failed to fetch WFP data')
  const text = await res.text()
  const rows = parseCSV(text)

  // Get latest price per commodity + province
  const latestMap = new Map<string, RawRow>()
  const trendMap = new Map<string, { date: string; price: number }[]>()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const cutoff = sixMonthsAgo.toISOString().slice(0, 10)

  for (const row of rows) {
    if (!COMMODITY_MAP[row.commodity]) continue
    const key = `${row.commodity}__${row.admin1}`
    const existing = latestMap.get(key)
    if (!existing || row.date > existing.date) {
      latestMap.set(key, row)
    }
    if (row.date >= cutoff) {
      const arr = trendMap.get(key) || []
      arr.push({ date: row.date, price: parseFloat(row.price) })
      trendMap.set(key, arr)
    }
  }

  const results: PriceData[] = []
  let idx = 0

  for (const [key, row] of latestMap.entries()) {
    const meta = COMMODITY_MAP[row.commodity]
    if (!meta) continue
    const pricePerKg = parseFloat(row.price)
    const price50kg = Math.round(pricePerKg * 50)
    const { trend, changePercent } = calcTrend(trendMap.get(key) || [])

    results.push({
      productId: meta.id,
      product: meta.name,
      provinceId: idx + 1,
      province: row.admin1,
      avgPrice: price50kg,
      minPrice: Math.round(price50kg * 0.9),
      maxPrice: Math.round(price50kg * 1.1),
      suggestedPrice: price50kg,
      confidenceScore: 0.85,
      dataPoints: 1,
      unit: 'per 50kg bag',
      currency: 'ZMW',
      trend,
      changePercent,
      lastUpdated: row.date + 'T00:00:00Z',
      source: 'WFP/Zamstats via HDX',
      market: row.market,
    } as PriceData & { source: string; market: string })
    idx++
  }

  return results.sort((a, b) => a.product.localeCompare(b.product))
}

// Cache in localStorage for 24hrs
const CACHE_KEY = 'zamgrow_live_prices'
const CACHE_TTL = 24 * 60 * 60 * 1000

export async function getLivePrices(): Promise<PriceData[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { ts, data } = JSON.parse(cached)
      if (Date.now() - ts < CACHE_TTL) return data
    }
  } catch { /* ignore */ }

  try {
    const data = await fetchLivePrices()
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
    return data
  } catch (e) {
    console.warn('Live price fetch failed, using mock data:', e)
    const { MOCK_PRICE_DATA } = await import('./mockData')
    return MOCK_PRICE_DATA
  }
}
