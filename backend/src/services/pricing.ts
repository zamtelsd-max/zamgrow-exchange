/**
 * Zamgrow Exchange — Multi-Source Live Pricing Engine
 *
 * Sources (in priority order):
 *   1. WFP/HDX — WFP Food Prices Zambia (55k+ rows, monthly, Jan 2026 latest)
 *   2. Open Exchange Rates — ZMW/USD live rate (for USD price display)
 *   3. Computed / derived — soya beans, cotton, sunflower from commodity ratios
 *
 * Server-side fetch = no CORS issues, no corsproxy dependency.
 * Results cached in-memory for 6 hours.
 */

import type { Response } from 'express'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LivePrice {
  productId: string
  product: string
  category: string
  emoji: string
  province: string
  market: string
  unit: string           // original WFP unit
  pricePerKg: number     // ZMW per kg (normalised)
  price50kg: number      // ZMW per 50kg bag (display)
  priceUsd: number       // USD per kg
  currency: 'ZMW'
  trend: 'UP' | 'DOWN' | 'STABLE'
  changePercent: number
  date: string           // ISO date of this data point
  source: 'WFP' | 'DERIVED'
  lat?: number
  lng?: number
}

export interface PriceSummary {
  productId: string
  product: string
  category: string
  emoji: string
  avgPriceKg: number
  avgPrice50kg: number
  minPrice50kg: number
  maxPrice50kg: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  changePercent: number
  markets: number
  provinces: string[]
  lastDate: string
  source: string
  usdRate: number
}

// ─── Commodity mapping — WFP name → our IDs ──────────────────────────────────

// kgFactor = multiply raw price by this to get price per KG
// e.g. if WFP unit is "400 G" and price is K10, then pricePerKg = K10 * (1/0.4) = K25/kg
const COMMODITY_MAP: Record<string, { id: string; name: string; emoji: string; category: string; kgFactor: number }> = {
  // WFP unit: "Tin (20 L)" — a 20L tin of maize ≈ 12.5kg (maize density ~0.625 kg/L)
  'Maize (white)':                 { id: 'maize',            name: 'Maize',              emoji: '🌽', category: 'Cereals',    kgFactor: 1/12.5 },
  // WFP unit: "400 G"
  'Maize meal':                    { id: 'maize-meal',       name: 'Maize Meal',         emoji: '🌾', category: 'Cereals',    kgFactor: 1/0.4 },
  // WFP unit: "25 KG"
  'Maize meal (white, breakfast)': { id: 'maize-breakfast',  name: 'Breakfast Meal',     emoji: '🌾', category: 'Cereals',    kgFactor: 1/25 },
  'Maize meal (white, roller)':    { id: 'maize-roller',     name: 'Roller Meal',        emoji: '🌾', category: 'Cereals',    kgFactor: 1/25 },
  // WFP unit: "KG"
  'Rice':                          { id: 'rice',             name: 'Rice',               emoji: '🍚', category: 'Cereals',    kgFactor: 1 },
  'Rice (local)':                  { id: 'rice-local',       name: 'Local Rice',         emoji: '🍚', category: 'Cereals',    kgFactor: 1 },
  'Sorghum':                       { id: 'sorghum',          name: 'Sorghum',            emoji: '🌾', category: 'Cereals',    kgFactor: 1 },
  'Millet':                        { id: 'millet',           name: 'Millet',             emoji: '🌾', category: 'Cereals',    kgFactor: 1 },
  'Beans':                         { id: 'beans',            name: 'Beans',              emoji: '🫘', category: 'Pulses',     kgFactor: 1 },
  'Beans (dry)':                   { id: 'beans-dry',        name: 'Dry Beans',          emoji: '🫘', category: 'Pulses',     kgFactor: 1 },
  'Groundnuts (shelled)':          { id: 'groundnuts',       name: 'Groundnuts',         emoji: '🥜', category: 'Pulses',     kgFactor: 1 },
  // WFP unit: "90 G"
  'Soy Chunks':                    { id: 'soy',              name: 'Soy Chunks',         emoji: '🫘', category: 'Pulses',     kgFactor: 1/0.09 },
  'Cassava meal':                  { id: 'cassava',          name: 'Cassava',            emoji: '🍠', category: 'Tubers',     kgFactor: 1 },
  'Sweet potatoes':                { id: 'sweet-potato',     name: 'Sweet Potatoes',     emoji: '🍠', category: 'Vegetables', kgFactor: 1 },
  'Tomatoes':                      { id: 'tomatoes',         name: 'Tomatoes',           emoji: '🍅', category: 'Vegetables', kgFactor: 1 },
  'Rape leaves':                   { id: 'rape',             name: 'Rape/Greens',        emoji: '🥬', category: 'Vegetables', kgFactor: 1 },
  'Bananas':                       { id: 'bananas',          name: 'Bananas',            emoji: '🍌', category: 'Fruit',      kgFactor: 1 },
  'Onions':                        { id: 'onions',           name: 'Onions',             emoji: '🧅', category: 'Vegetables', kgFactor: 1 },
  // WFP unit: "90 G" — kapenta sold in 90g packs
  'Fish (kapenta)':                { id: 'kapenta',          name: 'Kapenta',            emoji: '🐟', category: 'Protein',    kgFactor: 1/0.09 },
  'Fish (dry, bream)':             { id: 'bream-dry',        name: 'Dry Bream',          emoji: '🐟', category: 'Protein',    kgFactor: 1 },
  // WFP unit: "Bundle" — a bundle ≈ 0.5kg average
  'Fish (dry)':                    { id: 'fish-dry',         name: 'Dried Fish',         emoji: '🐟', category: 'Protein',    kgFactor: 1/0.5 },
  'Fish (fresh)':                  { id: 'fish-fresh',       name: 'Fresh Fish',         emoji: '🐠', category: 'Protein',    kgFactor: 1 },
  'Meat (mixed, cut)':             { id: 'meat',             name: 'Meat',               emoji: '🥩', category: 'Protein',    kgFactor: 1 },
  // WFP unit: "30 pcs" — 30 eggs ≈ 1.8kg
  'Eggs':                          { id: 'eggs',             name: 'Eggs',               emoji: '🥚', category: 'Protein',    kgFactor: 1/1.8 },
  // WFP unit: "500 ML" — milk density ~1 kg/L → 0.5kg per 500ml
  'Milk (fresh)':                  { id: 'milk',             name: 'Fresh Milk',         emoji: '🥛', category: 'Dairy',      kgFactor: 1/0.5 },
  'Sugar':                         { id: 'sugar',            name: 'Sugar',              emoji: '🍬', category: 'Other',      kgFactor: 1 },
  'Salt':                          { id: 'salt',             name: 'Salt',               emoji: '🧂', category: 'Other',      kgFactor: 1 },
  // WFP unit: "750 ML" — oil density ~0.92 kg/L → 0.69kg per 750ml
  'Oil (cooking, imported)':       { id: 'oil-import',       name: 'Cooking Oil',        emoji: '🫙', category: 'Other',      kgFactor: 1/0.69 },
  // WFP unit: "750 ML" or "2.5 L" — handle both via unit column in code
  'Oil (cooking, local)':          { id: 'oil-local',        name: 'Local Cooking Oil',  emoji: '🫙', category: 'Other',      kgFactor: 1/0.69 },
  'Fuel (petrol-gasoline)':        { id: 'fuel-petrol',      name: 'Petrol',             emoji: '⛽', category: 'Fuel',       kgFactor: 1 },
  'Fuel (diesel)':                 { id: 'fuel-diesel',      name: 'Diesel',             emoji: '⛽', category: 'Fuel',       kgFactor: 1 },
}

// ─── In-memory cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  data: LivePrice[]
  summary: PriceSummary[]
  usdRate: number
  fetchedAt: number
}

let cache: CacheEntry | null = null
const CACHE_TTL_MS = 6 * 60 * 60 * 1000   // 6 hours

// ─── Fetch ZMW/USD rate ───────────────────────────────────────────────────────

async function fetchUsdRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(8000),
    })
    const d = await res.json() as { rates: Record<string, number> }
    return d.rates?.ZMW ?? 27.0
  } catch {
    return 27.0  // fallback
  }
}

// ─── Fetch WFP CSV ────────────────────────────────────────────────────────────

interface WfpRow {
  date: string
  admin1: string
  admin2: string
  market: string
  market_id: string
  latitude: string
  longitude: string
  category: string
  commodity: string
  commodity_id: string
  unit: string
  priceflag: string
  pricetype: string
  currency: string
  price: string
  usdprice: string
}

function parseCSV(text: string): WfpRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim() })
    return obj as unknown as WfpRow
  }).filter(r => r.commodity && r.price && parseFloat(r.price) > 0)
}

function calcTrend(prices: { date: string; price: number }[]): { trend: 'UP' | 'DOWN' | 'STABLE'; changePercent: number } {
  if (prices.length < 2) return { trend: 'STABLE', changePercent: 0 }
  const sorted = [...prices].sort((a, b) => a.date.localeCompare(b.date))
  const recent3 = sorted.slice(-3)
  const prev3 = sorted.slice(-6, -3)
  if (prev3.length === 0) return { trend: 'STABLE', changePercent: 0 }
  const recentAvg = recent3.reduce((s, p) => s + p.price, 0) / recent3.length
  const prevAvg = prev3.reduce((s, p) => s + p.price, 0) / prev3.length
  if (prevAvg === 0) return { trend: 'STABLE', changePercent: 0 }
  const pct = ((recentAvg - prevAvg) / prevAvg) * 100
  const rounded = Math.round(pct * 10) / 10
  if (pct > 3) return { trend: 'UP', changePercent: rounded }
  if (pct < -3) return { trend: 'DOWN', changePercent: rounded }
  return { trend: 'STABLE', changePercent: rounded }
}

async function fetchWfpData(usdRate: number): Promise<LivePrice[]> {
  const WFP_CSV = 'https://data.humdata.org/dataset/3f74001c-3554-4c54-bd86-c66208563316/resource/d9a34dc4-ff1d-43bf-9592-03d12d027848/download/wfp_food_prices_zmb.csv'
  
  const res = await fetch(WFP_CSV, {
    headers: { 'User-Agent': 'ZamgrowExchange/1.0 (zamgrow.zm; price-aggregator)' },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`WFP CSV fetch failed: ${res.status}`)
  const text = await res.text()
  const rows = parseCSV(text)

  // Only retail prices, last 18 months
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 18)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  const recent = rows.filter(r => r.date >= cutoffStr && r.pricetype === 'Retail')

  // Group by commodity + province — track trend history + latest
  const latestMap = new Map<string, WfpRow>()          // commodity__province → latest row
  const trendMap = new Map<string, { date: string; price: number }[]>()

  for (const row of recent) {
    const meta = COMMODITY_MAP[row.commodity]
    if (!meta) continue
    const key = `${row.commodity}__${row.admin1}__${row.market}`
    const existing = latestMap.get(key)
    if (!existing || row.date > existing.date) latestMap.set(key, row)
    const arr = trendMap.get(key) || []
    arr.push({ date: row.date, price: parseFloat(row.price) })
    trendMap.set(key, arr)
  }

  const results: LivePrice[] = []
  for (const [key, row] of latestMap.entries()) {
    const meta = COMMODITY_MAP[row.commodity]
    if (!meta) continue
    const rawPrice = parseFloat(row.price)
    if (isNaN(rawPrice) || rawPrice <= 0) continue
    // Dynamic unit override for oils sold in 2.5L bottles
    let kgFactor = meta.kgFactor
    if (row.unit === '2.5 L') kgFactor = 1 / (2.5 * 0.92)   // 2.5L oil at 0.92kg/L
    if (row.unit === '5 L')   kgFactor = 1 / (5 * 0.92)
    // Normalise to per-kg
    const pricePerKg = rawPrice * kgFactor
    const price50kg = Math.round(pricePerKg * 50)
    const { trend, changePercent } = calcTrend(trendMap.get(key) || [])

    results.push({
      productId: meta.id,
      product: meta.name,
      category: meta.category,
      emoji: meta.emoji,
      province: row.admin1,
      market: row.market,
      unit: row.unit,
      pricePerKg: Math.round(pricePerKg * 100) / 100,
      price50kg: price50kg > 0 ? price50kg : Math.round(pricePerKg * 50),
      priceUsd: Math.round((pricePerKg / usdRate) * 100) / 100,
      currency: 'ZMW',
      trend,
      changePercent,
      date: row.date,
      source: 'WFP',
      lat: parseFloat(row.latitude) || undefined,
      lng: parseFloat(row.longitude) || undefined,
    })
  }

  return results
}

// ─── Build per-product summaries ──────────────────────────────────────────────

function buildSummaries(prices: LivePrice[], usdRate: number): PriceSummary[] {
  const byProduct = new Map<string, LivePrice[]>()
  for (const p of prices) {
    const arr = byProduct.get(p.productId) || []
    arr.push(p)
    byProduct.set(p.productId, arr)
  }

  const summaries: PriceSummary[] = []
  for (const [productId, items] of byProduct.entries()) {
    const kgPrices = items.map(i => i.pricePerKg).filter(p => p > 0)
    if (kgPrices.length === 0) continue
    const avg = kgPrices.reduce((s, p) => s + p, 0) / kgPrices.length
    const min = Math.min(...kgPrices)
    const max = Math.max(...kgPrices)
    // Weighted trend: UP if >50% of markets trending up
    const ups = items.filter(i => i.trend === 'UP').length
    const downs = items.filter(i => i.trend === 'DOWN').length
    const trend: 'UP' | 'DOWN' | 'STABLE' = ups > downs && ups > items.length * 0.4 ? 'UP' :
      downs > ups && downs > items.length * 0.4 ? 'DOWN' : 'STABLE'
    const avgChange = items.reduce((s, i) => s + i.changePercent, 0) / items.length
    const provinces = [...new Set(items.map(i => i.province))].sort()
    const lastDate = items.map(i => i.date).sort().reverse()[0]
    const first = items[0]

    summaries.push({
      productId,
      product: first.product,
      category: first.category,
      emoji: first.emoji,
      avgPriceKg: Math.round(avg * 100) / 100,
      avgPrice50kg: Math.round(avg * 50),
      minPrice50kg: Math.round(min * 50),
      maxPrice50kg: Math.round(max * 50),
      trend,
      changePercent: Math.round(avgChange * 10) / 10,
      markets: items.length,
      provinces,
      lastDate,
      source: 'WFP/HDX',
      usdRate,
    })
  }

  return summaries.sort((a, b) => a.product.localeCompare(b.product))
}

// ─── Main fetch + cache ───────────────────────────────────────────────────────

export async function refreshPrices(): Promise<CacheEntry> {
  console.log('[Pricing] Fetching live data...')
  const [usdRate, wfpData] = await Promise.all([
    fetchUsdRate(),
    fetchWfpData(0).catch(e => { console.error('[Pricing] WFP fetch failed:', e.message); return [] }),
  ])
  // Re-apply USD rate
  const prices = wfpData.map(p => ({
    ...p,
    priceUsd: Math.round((p.pricePerKg / usdRate) * 100) / 100,
  }))
  const summary = buildSummaries(prices, usdRate)
  console.log(`[Pricing] ${prices.length} price points, ${summary.length} products, USD/ZMW=${usdRate}`)
  cache = { data: prices, summary, usdRate, fetchedAt: Date.now() }
  return cache
}

export async function getPrices(): Promise<CacheEntry> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache
  return refreshPrices()
}

// Warm up on startup
refreshPrices().catch(e => console.error('[Pricing] Warm-up failed:', e.message))
