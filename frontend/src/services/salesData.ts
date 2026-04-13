/**
 * Zamgrow Exchange — Sales Performance Mock Data
 * Hierarchy: HSD → ZBM (per zone) → TDRs (per territory)
 * Targets: HSD sets zone targets → auto-divided by TDR count per zone
 */

import type { SalesTarget, ZonePerformance, TDRPerformance, ZBMProfile, TDRProfile, ZoneName } from '../types'

export const CURRENT_PERIOD = '2026-04'

// ─── ZONES (maps to Zambia provinces) ───────────────────────────────────────
export const ZONES: { id: string; name: ZoneName; provinces: string[] }[] = [
  { id: 'z1', name: 'Lusaka Zone',       provinces: ['Lusaka'] },
  { id: 'z2', name: 'Copperbelt Zone',   provinces: ['Copperbelt'] },
  { id: 'z3', name: 'Northern Zone',     provinces: ['Northern'] },
  { id: 'z4', name: 'Eastern Zone',      provinces: ['Eastern'] },
  { id: 'z5', name: 'Southern Zone',     provinces: ['Southern'] },
  { id: 'z6', name: 'Western Zone',      provinces: ['Western'] },
  { id: 'z7', name: 'Luapula Zone',      provinces: ['Luapula'] },
  { id: 'z8', name: 'Muchinga Zone',     provinces: ['Muchinga'] },
  { id: 'z9', name: 'North-Western Zone',provinces: ['North-Western'] },
  { id: 'z10',name: 'Central Zone',      provinces: ['Central'] },
]

// ─── HSD (Head of Sales Division) ───────────────────────────────────────────
export const HSD_USER = {
  id: 'hsd-001',
  name: 'Patricia Mumba',
  phone: '+260977000001',
  email: 'patricia.mumba@zamgrow.co.zm',
  role: 'HSD' as const,
  creditsBalance: 999,
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
}

// ─── ZBMs (one per zone) ─────────────────────────────────────────────────────
export const ZBM_PROFILES: ZBMProfile[] = [
  { id: 'zbm-01', name: 'Mwewa Chanda',    phone: '+260977100001', email: 'mwewa@zamgrow.co.zm',   zoneId: 'z1', zoneName: 'Lusaka Zone',        provinces: ['Lusaka'],         tdrCount: 6, joinedAt: '2024-02-01T00:00:00Z' },
  { id: 'zbm-02', name: 'Bwalya Kapasa',   phone: '+260977100002', email: 'bwalya@zamgrow.co.zm',  zoneId: 'z2', zoneName: 'Copperbelt Zone',    provinces: ['Copperbelt'],     tdrCount: 5, joinedAt: '2024-02-01T00:00:00Z' },
  { id: 'zbm-03', name: 'Chiluba Mutale',  phone: '+260977100003', email: 'chiluba@zamgrow.co.zm', zoneId: 'z3', zoneName: 'Northern Zone',      provinces: ['Northern'],       tdrCount: 4, joinedAt: '2024-03-01T00:00:00Z' },
  { id: 'zbm-04', name: 'Grace Phiri',     phone: '+260977100004', email: 'grace@zamgrow.co.zm',   zoneId: 'z4', zoneName: 'Eastern Zone',       provinces: ['Eastern'],        tdrCount: 4, joinedAt: '2024-03-01T00:00:00Z' },
  { id: 'zbm-05', name: 'Sitwala Mwale',   phone: '+260977100005', email: 'sitwala@zamgrow.co.zm', zoneId: 'z5', zoneName: 'Southern Zone',      provinces: ['Southern'],       tdrCount: 5, joinedAt: '2024-02-15T00:00:00Z' },
  { id: 'zbm-06', name: 'Luyando Ngoma',   phone: '+260977100006', email: 'luyando@zamgrow.co.zm', zoneId: 'z6', zoneName: 'Western Zone',       provinces: ['Western'],        tdrCount: 3, joinedAt: '2024-04-01T00:00:00Z' },
  { id: 'zbm-07', name: 'Chipo Musonda',   phone: '+260977100007', email: 'chipo@zamgrow.co.zm',   zoneId: 'z7', zoneName: 'Luapula Zone',       provinces: ['Luapula'],        tdrCount: 3, joinedAt: '2024-04-01T00:00:00Z' },
  { id: 'zbm-08', name: 'Kunda Tembo',     phone: '+260977100008', email: 'kunda@zamgrow.co.zm',   zoneId: 'z8', zoneName: 'Muchinga Zone',      provinces: ['Muchinga'],       tdrCount: 3, joinedAt: '2024-05-01T00:00:00Z' },
  { id: 'zbm-09', name: 'Mubita Sianga',   phone: '+260977100009', email: 'mubita@zamgrow.co.zm',  zoneId: 'z9', zoneName: 'North-Western Zone', provinces: ['North-Western'],  tdrCount: 3, joinedAt: '2024-05-01T00:00:00Z' },
  { id: 'zbm-10', name: 'Fridah Zulu',     phone: '+260977100010', email: 'fridah@zamgrow.co.zm',  zoneId: 'z10',zoneName: 'Central Zone',       provinces: ['Central'],        tdrCount: 4, joinedAt: '2024-03-15T00:00:00Z' },
]

// ─── ZONE TARGETS (set by HSD) ────────────────────────────────────────────────
export const ZONE_TARGETS: SalesTarget[] = [
  { id: 'tgt-z1', zoneId: 'z1', zoneName: 'Lusaka Zone',        setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 600000, targetListings: 120, targetNewFarmers: 60, targetTransactions: 90, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z2', zoneId: 'z2', zoneName: 'Copperbelt Zone',    setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 500000, targetListings: 100, targetNewFarmers: 50, targetTransactions: 75, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z3', zoneId: 'z3', zoneName: 'Northern Zone',      setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 320000, targetListings: 80,  targetNewFarmers: 40, targetTransactions: 56, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z4', zoneId: 'z4', zoneName: 'Eastern Zone',       setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 320000, targetListings: 80,  targetNewFarmers: 40, targetTransactions: 56, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z5', zoneId: 'z5', zoneName: 'Southern Zone',      setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 400000, targetListings: 90,  targetNewFarmers: 45, targetTransactions: 68, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z6', zoneId: 'z6', zoneName: 'Western Zone',       setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 180000, targetListings: 45,  targetNewFarmers: 22, targetTransactions: 34, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z7', zoneId: 'z7', zoneName: 'Luapula Zone',       setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 180000, targetListings: 45,  targetNewFarmers: 22, targetTransactions: 34, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z8', zoneId: 'z8', zoneName: 'Muchinga Zone',      setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 180000, targetListings: 45,  targetNewFarmers: 22, targetTransactions: 34, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z9', zoneId: 'z9', zoneName: 'North-Western Zone', setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 180000, targetListings: 45,  targetNewFarmers: 22, targetTransactions: 34, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'tgt-z10',zoneId: 'z10',zoneName: 'Central Zone',       setByHsdId: 'hsd-001', setByHsdName: 'Patricia Mumba', period: CURRENT_PERIOD, targetRevenue: 280000, targetListings: 70,  targetNewFarmers: 35, targetTransactions: 50, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
]

// ─── TDR PROFILES ─────────────────────────────────────────────────────────────
export const TDR_PROFILES: TDRProfile[] = [
  // Lusaka Zone (6 TDRs)
  { id: 'tdr-l1', name: 'Joseph Mwila',    phone: '+260971201001', email: 'j.mwila@zamgrow.co.zm',    zoneId: 'z1', zoneName: 'Lusaka Zone', zbmId: 'zbm-01', territory: 'Lusaka Central',   joinedAt: '2024-06-01T00:00:00Z' },
  { id: 'tdr-l2', name: 'Mary Banda',      phone: '+260971201002', email: 'm.banda@zamgrow.co.zm',    zoneId: 'z1', zoneName: 'Lusaka Zone', zbmId: 'zbm-01', territory: 'Kafue',            joinedAt: '2024-06-01T00:00:00Z' },
  { id: 'tdr-l3', name: 'Peter Chama',     phone: '+260971201003', email: 'p.chama@zamgrow.co.zm',    zoneId: 'z1', zoneName: 'Lusaka Zone', zbmId: 'zbm-01', territory: 'Chongwe',         joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-l4', name: 'Alice Mumba',     phone: '+260971201004', email: 'a.mumba@zamgrow.co.zm',    zoneId: 'z1', zoneName: 'Lusaka Zone', zbmId: 'zbm-01', territory: 'Luangwa',         joinedAt: '2024-07-15T00:00:00Z' },
  { id: 'tdr-l5', name: 'Frank Mutale',    phone: '+260971201005', email: 'f.mutale@zamgrow.co.zm',   zoneId: 'z1', zoneName: 'Lusaka Zone', zbmId: 'zbm-01', territory: 'Rufunsa',         joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-l6', name: 'Diana Phiri',     phone: '+260971201006', email: 'd.phiri@zamgrow.co.zm',    zoneId: 'z1', zoneName: 'Lusaka Zone', zbmId: 'zbm-01', territory: 'Chirundu',        joinedAt: '2024-08-15T00:00:00Z' },
  // Copperbelt Zone (5 TDRs)
  { id: 'tdr-c1', name: 'Benson Mwansa',   phone: '+260971202001', email: 'b.mwansa@zamgrow.co.zm',   zoneId: 'z2', zoneName: 'Copperbelt Zone', zbmId: 'zbm-02', territory: 'Kitwe',           joinedAt: '2024-06-01T00:00:00Z' },
  { id: 'tdr-c2', name: 'Susan Musonda',   phone: '+260971202002', email: 's.musonda@zamgrow.co.zm',  zoneId: 'z2', zoneName: 'Copperbelt Zone', zbmId: 'zbm-02', territory: 'Ndola',           joinedAt: '2024-06-15T00:00:00Z' },
  { id: 'tdr-c3', name: 'Charles Tembo',   phone: '+260971202003', email: 'c.tembo@zamgrow.co.zm',    zoneId: 'z2', zoneName: 'Copperbelt Zone', zbmId: 'zbm-02', territory: 'Mufulira',        joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-c4', name: 'Nsansa Kalaba',   phone: '+260971202004', email: 'n.kalaba@zamgrow.co.zm',   zoneId: 'z2', zoneName: 'Copperbelt Zone', zbmId: 'zbm-02', territory: 'Luanshya',        joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-c5', name: 'Victor Chipeta',  phone: '+260971202005', email: 'v.chipeta@zamgrow.co.zm',  zoneId: 'z2', zoneName: 'Copperbelt Zone', zbmId: 'zbm-02', territory: 'Chingola',        joinedAt: '2024-08-01T00:00:00Z' },
  // Northern Zone (4 TDRs)
  { id: 'tdr-n1', name: 'Isaac Mulenga',   phone: '+260971203001', email: 'i.mulenga@zamgrow.co.zm',  zoneId: 'z3', zoneName: 'Northern Zone', zbmId: 'zbm-03', territory: 'Kasama',          joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-n2', name: 'Rose Mwamba',     phone: '+260971203002', email: 'r.mwamba@zamgrow.co.zm',   zoneId: 'z3', zoneName: 'Northern Zone', zbmId: 'zbm-03', territory: 'Mbala',           joinedAt: '2024-07-15T00:00:00Z' },
  { id: 'tdr-n3', name: 'Daniel Chilufya', phone: '+260971203003', email: 'd.chilufya@zamgrow.co.zm', zoneId: 'z3', zoneName: 'Northern Zone', zbmId: 'zbm-03', territory: 'Mporokoso',       joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-n4', name: 'Janet Sichone',   phone: '+260971203004', email: 'j.sichone@zamgrow.co.zm',  zoneId: 'z3', zoneName: 'Northern Zone', zbmId: 'zbm-03', territory: 'Luwingu',         joinedAt: '2024-09-01T00:00:00Z' },
  // Eastern Zone (4 TDRs)
  { id: 'tdr-e1', name: 'Patrick Zulu',    phone: '+260971204001', email: 'p.zulu@zamgrow.co.zm',     zoneId: 'z4', zoneName: 'Eastern Zone', zbmId: 'zbm-04', territory: 'Chipata',         joinedAt: '2024-06-01T00:00:00Z' },
  { id: 'tdr-e2', name: 'Lilian Phiri',    phone: '+260971204002', email: 'l.phiri@zamgrow.co.zm',    zoneId: 'z4', zoneName: 'Eastern Zone', zbmId: 'zbm-04', territory: 'Lundazi',         joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-e3', name: 'Samuel Banda',    phone: '+260971204003', email: 's.banda@zamgrow.co.zm',    zoneId: 'z4', zoneName: 'Eastern Zone', zbmId: 'zbm-04', territory: 'Petauke',         joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-e4', name: 'Vivian Mwale',    phone: '+260971204004', email: 'v.mwale@zamgrow.co.zm',    zoneId: 'z4', zoneName: 'Eastern Zone', zbmId: 'zbm-04', territory: 'Katete',          joinedAt: '2024-09-01T00:00:00Z' },
  // Southern Zone (5 TDRs)
  { id: 'tdr-s1', name: 'George Hamusonde',phone: '+260971205001', email: 'g.hamusonde@zamgrow.co.zm',zoneId: 'z5', zoneName: 'Southern Zone', zbmId: 'zbm-05', territory: 'Livingstone',     joinedAt: '2024-06-01T00:00:00Z' },
  { id: 'tdr-s2', name: 'Martha Sikazwe',  phone: '+260971205002', email: 'm.sikazwe@zamgrow.co.zm',  zoneId: 'z5', zoneName: 'Southern Zone', zbmId: 'zbm-05', territory: 'Mazabuka',        joinedAt: '2024-06-15T00:00:00Z' },
  { id: 'tdr-s3', name: 'Edwin Mwanangombe',phone:'+260971205003', email: 'e.mwanangombe@zamgrow.co.zm',zoneId:'z5',zoneName: 'Southern Zone', zbmId: 'zbm-05', territory: 'Monze',          joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-s4', name: 'Caroline Muyaba', phone: '+260971205004', email: 'c.muyaba@zamgrow.co.zm',   zoneId: 'z5', zoneName: 'Southern Zone', zbmId: 'zbm-05', territory: 'Choma',          joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-s5', name: 'Andrew Siame',    phone: '+260971205005', email: 'a.siame@zamgrow.co.zm',    zoneId: 'z5', zoneName: 'Southern Zone', zbmId: 'zbm-05', territory: 'Namwala',         joinedAt: '2024-09-01T00:00:00Z' },
  // Western Zone (3 TDRs)
  { id: 'tdr-w1', name: 'Moses Mwangala',  phone: '+260971206001', email: 'm.mwangala@zamgrow.co.zm', zoneId: 'z6', zoneName: 'Western Zone', zbmId: 'zbm-06', territory: 'Mongu',           joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-w2', name: 'Elizabeth Ngenda',phone: '+260971206002', email: 'e.ngenda@zamgrow.co.zm',   zoneId: 'z6', zoneName: 'Western Zone', zbmId: 'zbm-06', territory: 'Kaoma',           joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-w3', name: 'Nathan Mulonga',  phone: '+260971206003', email: 'n.mulonga@zamgrow.co.zm',  zoneId: 'z6', zoneName: 'Western Zone', zbmId: 'zbm-06', territory: 'Senanga',         joinedAt: '2024-09-01T00:00:00Z' },
  // Luapula Zone (3 TDRs)
  { id: 'tdr-lp1',name: 'Christopher Muleba',phone:'+260971207001',email:'c.muleba@zamgrow.co.zm',    zoneId: 'z7', zoneName: 'Luapula Zone', zbmId: 'zbm-07', territory: 'Mansa',           joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-lp2',name: 'Priscilla Kabinga',phone:'+260971207002',email:'p.kabinga@zamgrow.co.zm',    zoneId: 'z7', zoneName: 'Luapula Zone', zbmId: 'zbm-07', territory: 'Kawambwa',        joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-lp3',name: 'Godwin Chisanga', phone: '+260971207003', email: 'g.chisanga@zamgrow.co.zm', zoneId: 'z7', zoneName: 'Luapula Zone', zbmId: 'zbm-07', territory: 'Nchelenge',       joinedAt: '2024-09-01T00:00:00Z' },
  // Muchinga Zone (3 TDRs)
  { id: 'tdr-m1', name: 'Aaron Kampamba',  phone: '+260971208001', email: 'a.kampamba@zamgrow.co.zm', zoneId: 'z8', zoneName: 'Muchinga Zone', zbmId: 'zbm-08', territory: 'Chinsali',        joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-m2', name: 'Beatrice Sinyangwe',phone:'+260971208002',email:'b.sinyangwe@zamgrow.co.zm', zoneId: 'z8', zoneName: 'Muchinga Zone', zbmId: 'zbm-08', territory: 'Mpika',           joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-m3', name: 'Richard Chanda',  phone: '+260971208003', email: 'r.chanda@zamgrow.co.zm',   zoneId: 'z8', zoneName: 'Muchinga Zone', zbmId: 'zbm-08', territory: 'Nakonde',         joinedAt: '2024-09-01T00:00:00Z' },
  // North-Western Zone (3 TDRs)
  { id: 'tdr-nw1',name: 'Simon Kakoma',    phone: '+260971209001', email: 's.kakoma@zamgrow.co.zm',   zoneId: 'z9', zoneName: 'North-Western Zone', zbmId: 'zbm-09', territory: 'Solwezi',         joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-nw2',name: 'Florence Inonge', phone: '+260971209002', email: 'f.inonge@zamgrow.co.zm',   zoneId: 'z9', zoneName: 'North-Western Zone', zbmId: 'zbm-09', territory: 'Mwinilunga',      joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-nw3',name: 'Justine Musenge', phone: '+260971209003', email: 'j.musenge@zamgrow.co.zm',  zoneId: 'z9', zoneName: 'North-Western Zone', zbmId: 'zbm-09', territory: 'Kasempa',         joinedAt: '2024-09-01T00:00:00Z' },
  // Central Zone (4 TDRs)
  { id: 'tdr-ct1',name: 'Bernard Mwale',   phone: '+260971210001', email: 'b.mwale@zamgrow.co.zm',    zoneId: 'z10',zoneName: 'Central Zone', zbmId: 'zbm-10', territory: 'Kabwe',           joinedAt: '2024-06-01T00:00:00Z' },
  { id: 'tdr-ct2',name: 'Esther Mwale',    phone: '+260971210002', email: 'e.mwale@zamgrow.co.zm',    zoneId: 'z10',zoneName: 'Central Zone', zbmId: 'zbm-10', territory: 'Mkushi',          joinedAt: '2024-07-01T00:00:00Z' },
  { id: 'tdr-ct3',name: 'Stanley Banda',   phone: '+260971210003', email: 's.banda2@zamgrow.co.zm',   zoneId: 'z10',zoneName: 'Central Zone', zbmId: 'zbm-10', territory: 'Kapiri Mposhi',   joinedAt: '2024-08-01T00:00:00Z' },
  { id: 'tdr-ct4',name: 'Nelly Phiri',     phone: '+260971210004', email: 'n.phiri@zamgrow.co.zm',    zoneId: 'z10',zoneName: 'Central Zone', zbmId: 'zbm-10', territory: 'Serenje',         joinedAt: '2024-09-01T00:00:00Z' },
]

// ─── HELPER: compute per-TDR target (zone target ÷ TDR count) ────────────────
function tdrTarget(zoneId: string, field: keyof SalesTarget): number {
  const zone = ZONES.find(z => z.id === zoneId)!
  const zbm = ZBM_PROFILES.find(z => z.zoneId === zoneId)!
  const target = ZONE_TARGETS.find(t => t.zoneId === zoneId)!
  const count = zbm.tdrCount
  return Math.round((target[field] as number) / count)
}

// ─── TDR ACTUALS (realistic varied performance) ───────────────────────────────
interface TDRActual { revenue: number; listings: number; farmers: number; txns: number }
const TDR_ACTUALS: Record<string, TDRActual> = {
  // Lusaka Zone TDRs
  'tdr-l1': { revenue: 92000, listings: 19, farmers: 9, txns: 14 },
  'tdr-l2': { revenue: 75000, listings: 15, farmers: 7, txns: 11 },
  'tdr-l3': { revenue: 88000, listings: 17, farmers: 8, txns: 13 },
  'tdr-l4': { revenue: 55000, listings: 10, farmers: 5, txns:  8 },
  'tdr-l5': { revenue: 70000, listings: 14, farmers: 7, txns: 10 },
  'tdr-l6': { revenue: 80000, listings: 16, farmers: 8, txns: 12 },
  // Copperbelt
  'tdr-c1': { revenue: 98000, listings: 20, farmers: 10, txns: 15 },
  'tdr-c2': { revenue: 82000, listings: 17, farmers: 8, txns: 12 },
  'tdr-c3': { revenue: 60000, listings: 12, farmers: 6, txns:  9 },
  'tdr-c4': { revenue: 73000, listings: 15, farmers: 7, txns: 11 },
  'tdr-c5': { revenue: 65000, listings: 13, farmers: 6, txns: 10 },
  // Northern
  'tdr-n1': { revenue: 79000, listings: 19, farmers: 9, txns: 13 },
  'tdr-n2': { revenue: 68000, listings: 17, farmers: 8, txns: 11 },
  'tdr-n3': { revenue: 45000, listings: 11, farmers: 5, txns:  7 },
  'tdr-n4': { revenue: 52000, listings: 13, farmers: 6, txns:  9 },
  // Eastern
  'tdr-e1': { revenue: 85000, listings: 21, farmers: 10, txns: 14 },
  'tdr-e2': { revenue: 72000, listings: 18, farmers: 8, txns: 12 },
  'tdr-e3': { revenue: 58000, listings: 14, farmers: 6, txns: 9 },
  'tdr-e4': { revenue: 40000, listings: 10, farmers: 5, txns: 7 },
  // Southern
  'tdr-s1': { revenue: 90000, listings: 19, farmers: 9, txns: 14 },
  'tdr-s2': { revenue: 78000, listings: 16, farmers: 8, txns: 12 },
  'tdr-s3': { revenue: 62000, listings: 13, farmers: 6, txns: 9 },
  'tdr-s4': { revenue: 55000, listings: 11, farmers: 5, txns: 8 },
  'tdr-s5': { revenue: 48000, listings: 10, farmers: 5, txns: 7 },
  // Western
  'tdr-w1': { revenue: 58000, listings: 14, farmers: 7, txns: 10 },
  'tdr-w2': { revenue: 42000, listings: 11, farmers: 5, txns:  8 },
  'tdr-w3': { revenue: 35000, listings: 9,  farmers: 4, txns:  6 },
  // Luapula
  'tdr-lp1':{ revenue: 65000, listings: 15, farmers: 7, txns: 11 },
  'tdr-lp2':{ revenue: 50000, listings: 12, farmers: 5, txns:  8 },
  'tdr-lp3':{ revenue: 38000, listings: 9,  farmers: 4, txns:  6 },
  // Muchinga
  'tdr-m1': { revenue: 62000, listings: 15, farmers: 7, txns: 10 },
  'tdr-m2': { revenue: 48000, listings: 12, farmers: 5, txns:  8 },
  'tdr-m3': { revenue: 35000, listings: 8,  farmers: 4, txns:  6 },
  // North-Western
  'tdr-nw1':{ revenue: 60000, listings: 15, farmers: 7, txns: 10 },
  'tdr-nw2':{ revenue: 45000, listings: 11, farmers: 5, txns:  8 },
  'tdr-nw3':{ revenue: 32000, listings: 8,  farmers: 4, txns:  5 },
  // Central
  'tdr-ct1':{ revenue: 72000, listings: 17, farmers: 8, txns: 12 },
  'tdr-ct2':{ revenue: 60000, listings: 15, farmers: 7, txns: 10 },
  'tdr-ct3':{ revenue: 50000, listings: 12, farmers: 5, txns:  8 },
  'tdr-ct4':{ revenue: 38000, listings: 9,  farmers: 4, txns:  6 },
}

// ─── BUILD TDR PERFORMANCE OBJECTS ─────────────────────────────────────────────
export function buildTDRPerformance(period = CURRENT_PERIOD): TDRPerformance[] {
  return TDR_PROFILES.map((tdr, idx) => {
    const actuals = TDR_ACTUALS[tdr.id] || { revenue: 40000, listings: 10, farmers: 5, txns: 7 }
    const tgtRevenue   = tdrTarget(tdr.zoneId, 'targetRevenue')
    const tgtListings  = tdrTarget(tdr.zoneId, 'targetListings')
    const tgtFarmers   = tdrTarget(tdr.zoneId, 'targetNewFarmers')
    const tgtTxns      = tdrTarget(tdr.zoneId, 'targetTransactions')
    const revPct = Math.round((actuals.revenue / tgtRevenue) * 100)
    const listPct = Math.round((actuals.listings / tgtListings) * 100)
    const overallScore = Math.round((revPct * 0.5) + (listPct * 0.25) +
      (Math.round((actuals.farmers / tgtFarmers) * 100) * 0.15) +
      (Math.round((actuals.txns / tgtTxns) * 100) * 0.10))
    return {
      tdrId: tdr.id,
      tdrName: tdr.name,
      tdrPhone: tdr.phone,
      zoneId: tdr.zoneId,
      zoneName: tdr.zoneName,
      zbmId: tdr.zbmId,
      period,
      actualRevenue:      actuals.revenue,
      actualListings:     actuals.listings,
      actualNewFarmers:   actuals.farmers,
      actualTransactions: actuals.txns,
      assignedTargetRevenue:      tgtRevenue,
      assignedTargetListings:     tgtListings,
      assignedTargetNewFarmers:   tgtFarmers,
      assignedTargetTransactions: tgtTxns,
      revenueAchievementPct: revPct,
      listingsAchievementPct: listPct,
      overallScore,
      rank: 0, // will be set after sort
      trend: (revPct >= 90 ? 'UP' : revPct >= 70 ? 'STABLE' : 'DOWN') as 'UP' | 'DOWN' | 'STABLE',
      lastActivity: '2026-04-12T08:30:00Z',
    }
  }).map((p, _, arr) => {
    const sorted = [...arr].sort((a, b) => b.overallScore - a.overallScore)
    return { ...p, rank: sorted.findIndex(s => s.tdrId === p.tdrId) + 1 }
  })
}

// ─── BUILD ZONE PERFORMANCE OBJECTS ─────────────────────────────────────────────
export function buildZonePerformance(period = CURRENT_PERIOD): ZonePerformance[] {
  const tdrs = buildTDRPerformance(period)
  return ZONES.map(zone => {
    const zbm = ZBM_PROFILES.find(z => z.zoneId === zone.id)!
    const target = ZONE_TARGETS.find(t => t.zoneId === zone.id)!
    const zoneTDRs = tdrs.filter(t => t.zoneId === zone.id)
    const actualRevenue      = zoneTDRs.reduce((s, t) => s + t.actualRevenue, 0)
    const actualListings     = zoneTDRs.reduce((s, t) => s + t.actualListings, 0)
    const actualFarmers      = zoneTDRs.reduce((s, t) => s + t.actualNewFarmers, 0)
    const actualTxns         = zoneTDRs.reduce((s, t) => s + t.actualTransactions, 0)
    const revPct = Math.round((actualRevenue / target.targetRevenue) * 100)
    const overallScore = Math.round(
      (revPct * 0.5) +
      (Math.round((actualListings  / target.targetListings)     * 100) * 0.25) +
      (Math.round((actualFarmers   / target.targetNewFarmers)   * 100) * 0.15) +
      (Math.round((actualTxns      / target.targetTransactions) * 100) * 0.10)
    )
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      zbmId: zbm.id,
      zbmName: zbm.name,
      zbmPhone: zbm.phone,
      period,
      tdrCount: zbm.tdrCount,
      targetRevenue:      target.targetRevenue,
      targetListings:     target.targetListings,
      targetNewFarmers:   target.targetNewFarmers,
      targetTransactions: target.targetTransactions,
      actualRevenue,
      actualListings,
      actualNewFarmers:   actualFarmers,
      actualTransactions: actualTxns,
      revenueAchievementPct: revPct,
      overallScore,
      rank: 0,
      tdrs: zoneTDRs,
    }
  }).map((z, _, arr) => {
    const sorted = [...arr].sort((a, b) => b.overallScore - a.overallScore)
    return { ...z, rank: sorted.findIndex(s => s.zoneId === z.zoneId) + 1 }
  })
}

// ─── DEMO USERS for role-based login ─────────────────────────────────────────
export const DEMO_USERS = {
  hsd: {
    id: 'hsd-001', name: 'Patricia Mumba', phone: '+260977000001',
    email: 'patricia.mumba@zamgrow.co.zm', role: 'HSD' as const,
    creditsBalance: 999, isVerified: true, createdAt: '2024-01-01T00:00:00Z',
  },
  zbm: {
    id: 'zbm-01', name: 'Mwewa Chanda', phone: '+260977100001',
    email: 'mwewa@zamgrow.co.zm', role: 'ZBM' as const,
    zoneId: 'z1', zoneName: 'Lusaka Zone',
    creditsBalance: 50, isVerified: true, createdAt: '2024-02-01T00:00:00Z',
  },
  tdr: {
    id: 'tdr-l1', name: 'Joseph Mwila', phone: '+260971201001',
    email: 'j.mwila@zamgrow.co.zm', role: 'TDR' as const,
    zoneId: 'z1', zoneName: 'Lusaka Zone', zbmId: 'zbm-01',
    territory: 'Lusaka Central',
    creditsBalance: 10, isVerified: true, createdAt: '2024-06-01T00:00:00Z',
  },
}
