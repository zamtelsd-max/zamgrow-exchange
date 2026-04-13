/**
 * useSalesData — fetches live sales data from API
 * Falls back gracefully if API is unreachable (shows stale/mock data + banner)
 */
import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import {
  buildTDRPerformance, buildZonePerformance, DEMO_USERS,
  ZBM_PROFILES, TDR_PROFILES
} from '../services/salesData'

export type DataStatus = 'loading' | 'live' | 'offline' | 'error'

// ── HSD: all zones ─────────────────────────────────────────────────────────
export function useAllZones() {
  const [data, setData]     = useState<any[]>([])
  const [period, setPeriod] = useState('')
  const [status, setStatus] = useState<DataStatus>('loading')
  const [error, setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await api.sales.allZones()
      setData(res.data)
      setPeriod(res.period)
      setStatus('live')
    } catch (e: any) {
      // Fallback to mock
      const mock = buildZonePerformance()
      setData(mock)
      setPeriod(mock[0]?.period ?? '')
      setStatus('offline')
      setError(e.message)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { data, period, status, error, reload: load }
}

// ── ZBM: their zone ────────────────────────────────────────────────────────
export function useMyZone(zoneId?: string) {
  const [data, setData]     = useState<any>(null)
  const [status, setStatus] = useState<DataStatus>('loading')
  const [error, setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!zoneId) { setStatus('error'); return }
    setStatus('loading')
    try {
      const res = await api.sales.zone(zoneId)
      setData(res.data)
      setStatus('live')
    } catch (e: any) {
      // Fallback: find matching mock zone
      const mock = buildZonePerformance().find(z => z.zoneId === zoneId)
        ?? buildZonePerformance()[0]
      setData(mock)
      setStatus('offline')
      setError(e.message)
    }
  }, [zoneId])

  useEffect(() => { load() }, [load])
  return { data, status, error, reload: load }
}

// ── TDR: own performance ───────────────────────────────────────────────────
export function useMyPerf(userId?: string) {
  const [data, setData]     = useState<any>(null)
  const [status, setStatus] = useState<DataStatus>('loading')
  const [error, setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await api.sales.myPerf()
      setData(res.data)
      setStatus('live')
    } catch (e: any) {
      // Fallback: find matching mock TDR
      const all = buildTDRPerformance()
      const mock = all.find(t => t.tdrId === userId) ?? all[0]
      setData(mock)
      setStatus('offline')
      setError(e.message)
    }
  }, [userId])

  useEffect(() => { load() }, [load])
  return { data, status, error, reload: load }
}

// ── TDR: log activity ──────────────────────────────────────────────────────
export async function logSalesActivity(
  type: 'listing_posted' | 'farmer_onboarded' | 'transaction_completed' | 'revenue_recorded',
  amount?: number,
  description?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.sales.logActivity({ type, amount, description })
    return { success: true, message: 'Activity logged' }
  } catch (e: any) {
    return { success: false, message: e.message ?? 'Failed to log activity' }
  }
}

// ── HSD: set targets ───────────────────────────────────────────────────────
export async function saveZoneTargets(data: {
  zoneId: string; period: string
  targetRevenue: number; targetListings: number
  targetNewFarmers: number; targetTransactions: number
}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const res = await api.sales.setTargets(data)
    return { success: true, message: res.message, data: res.data }
  } catch (e: any) {
    return { success: false, message: e.message ?? 'Failed to save targets' }
  }
}
