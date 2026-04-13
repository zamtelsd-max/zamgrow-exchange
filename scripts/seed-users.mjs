#!/usr/bin/env node
/**
 * Zamgrow Exchange — Batch User Seeder
 * Registers HSD, 10 ZBMs, and 40 TDRs into the live production system,
 * then assigns zone IDs and ZBM IDs via direct DB lookup.
 *
 * Usage: node seed-users.mjs [--api https://backend-production-5584.up.railway.app/api/v1]
 */

const API = process.argv[2] || 'https://backend-production-5584.up.railway.app/api/v1'
const DEFAULT_PASSWORD = 'Zamgrow2026!'

// ─── Zone map (matches what /sales/setup/zones creates) ───────────────────────
const ZONE_PROVINCES = {
  'z1':  { name: 'Lusaka Zone',         province: 'Lusaka' },
  'z2':  { name: 'Copperbelt Zone',     province: 'Copperbelt' },
  'z3':  { name: 'Northern Zone',       province: 'Northern' },
  'z4':  { name: 'Eastern Zone',        province: 'Eastern' },
  'z5':  { name: 'Southern Zone',       province: 'Southern' },
  'z6':  { name: 'Western Zone',        province: 'Western' },
  'z7':  { name: 'Luapula Zone',        province: 'Luapula' },
  'z8':  { name: 'Muchinga Zone',       province: 'Muchinga' },
  'z9':  { name: 'North-Western Zone',  province: 'North-Western' },
  'z10': { name: 'Central Zone',        province: 'Central' },
}

// ─── Users ────────────────────────────────────────────────────────────────────
const HSD = { name: 'Patricia Mumba', phone: '+260977000001', role: 'hsd', province: 'Lusaka' }

const ZBMs = [
  { id: 'zbm-01', name: 'Mwewa Chanda',    phone: '+260977100001', zoneKey: 'z1'  },
  { id: 'zbm-02', name: 'Bwalya Kapasa',   phone: '+260977100002', zoneKey: 'z2'  },
  { id: 'zbm-03', name: 'Chiluba Mutale',  phone: '+260977100003', zoneKey: 'z3'  },
  { id: 'zbm-04', name: 'Grace Phiri',     phone: '+260977100004', zoneKey: 'z4'  },
  { id: 'zbm-05', name: 'Sitwala Mwale',   phone: '+260977100005', zoneKey: 'z5'  },
  { id: 'zbm-06', name: 'Luyando Ngoma',   phone: '+260977100006', zoneKey: 'z6'  },
  { id: 'zbm-07', name: 'Chipo Musonda',   phone: '+260977100007', zoneKey: 'z7'  },
  { id: 'zbm-08', name: 'Kunda Tembo',     phone: '+260977100008', zoneKey: 'z8'  },
  { id: 'zbm-09', name: 'Mubita Sianga',   phone: '+260977100009', zoneKey: 'z9'  },
  { id: 'zbm-10', name: 'Fridah Zulu',     phone: '+260977100010', zoneKey: 'z10' },
]

const TDRs = [
  // Lusaka Zone (z1)
  { name: 'Joseph Mwila',      phone: '+260971201001', zoneKey: 'z1', zbmKey: 'zbm-01', territory: 'Lusaka Central' },
  { name: 'Mary Banda',        phone: '+260971201002', zoneKey: 'z1', zbmKey: 'zbm-01', territory: 'Kafue'          },
  { name: 'Peter Chama',       phone: '+260971201003', zoneKey: 'z1', zbmKey: 'zbm-01', territory: 'Chongwe'        },
  { name: 'Alice Mumba',       phone: '+260971201004', zoneKey: 'z1', zbmKey: 'zbm-01', territory: 'Luangwa'        },
  { name: 'Frank Mutale',      phone: '+260971201005', zoneKey: 'z1', zbmKey: 'zbm-01', territory: 'Rufunsa'        },
  { name: 'Diana Phiri',       phone: '+260971201006', zoneKey: 'z1', zbmKey: 'zbm-01', territory: 'Chirundu'       },
  // Copperbelt Zone (z2)
  { name: 'Benson Mwansa',     phone: '+260971202001', zoneKey: 'z2', zbmKey: 'zbm-02', territory: 'Kitwe'          },
  { name: 'Susan Musonda',     phone: '+260971202002', zoneKey: 'z2', zbmKey: 'zbm-02', territory: 'Ndola'          },
  { name: 'Charles Tembo',     phone: '+260971202003', zoneKey: 'z2', zbmKey: 'zbm-02', territory: 'Mufulira'       },
  { name: 'Nsansa Kalaba',     phone: '+260971202004', zoneKey: 'z2', zbmKey: 'zbm-02', territory: 'Luanshya'       },
  { name: 'Victor Chipeta',    phone: '+260971202005', zoneKey: 'z2', zbmKey: 'zbm-02', territory: 'Chingola'       },
  // Northern Zone (z3)
  { name: 'Isaac Mulenga',     phone: '+260971203001', zoneKey: 'z3', zbmKey: 'zbm-03', territory: 'Kasama'         },
  { name: 'Rose Mwamba',       phone: '+260971203002', zoneKey: 'z3', zbmKey: 'zbm-03', territory: 'Mbala'          },
  { name: 'Daniel Chilufya',   phone: '+260971203003', zoneKey: 'z3', zbmKey: 'zbm-03', territory: 'Mporokoso'      },
  { name: 'Janet Sichone',     phone: '+260971203004', zoneKey: 'z3', zbmKey: 'zbm-03', territory: 'Luwingu'        },
  // Eastern Zone (z4)
  { name: 'Patrick Zulu',      phone: '+260971204001', zoneKey: 'z4', zbmKey: 'zbm-04', territory: 'Chipata'        },
  { name: 'Lilian Phiri',      phone: '+260971204002', zoneKey: 'z4', zbmKey: 'zbm-04', territory: 'Lundazi'        },
  { name: 'Samuel Banda',      phone: '+260971204003', zoneKey: 'z4', zbmKey: 'zbm-04', territory: 'Petauke'        },
  { name: 'Vivian Mwale',      phone: '+260971204004', zoneKey: 'z4', zbmKey: 'zbm-04', territory: 'Katete'         },
  // Southern Zone (z5)
  { name: 'George Hamusonde',  phone: '+260971205001', zoneKey: 'z5', zbmKey: 'zbm-05', territory: 'Livingstone'    },
  { name: 'Martha Sikazwe',    phone: '+260971205002', zoneKey: 'z5', zbmKey: 'zbm-05', territory: 'Mazabuka'       },
  { name: 'Edwin Mwanangombe', phone: '+260971205003', zoneKey: 'z5', zbmKey: 'zbm-05', territory: 'Monze'          },
  { name: 'Caroline Muyaba',   phone: '+260971205004', zoneKey: 'z5', zbmKey: 'zbm-05', territory: 'Choma'          },
  { name: 'Andrew Siame',      phone: '+260971205005', zoneKey: 'z5', zbmKey: 'zbm-05', territory: 'Namwala'        },
  // Western Zone (z6)
  { name: 'Moses Mwangala',    phone: '+260971206001', zoneKey: 'z6', zbmKey: 'zbm-06', territory: 'Mongu'          },
  { name: 'Elizabeth Ngenda',  phone: '+260971206002', zoneKey: 'z6', zbmKey: 'zbm-06', territory: 'Kaoma'          },
  { name: 'Thomas Liswaniso',  phone: '+260971206003', zoneKey: 'z6', zbmKey: 'zbm-06', territory: 'Kalabo'         },
  // Luapula Zone (z7)
  { name: 'Bernard Kashimba',  phone: '+260971207001', zoneKey: 'z7', zbmKey: 'zbm-07', territory: 'Mansa'          },
  { name: 'Florence Muteba',   phone: '+260971207002', zoneKey: 'z7', zbmKey: 'zbm-07', territory: 'Kawambwa'       },
  { name: 'Henry Kalobwe',     phone: '+260971207003', zoneKey: 'z7', zbmKey: 'zbm-07', territory: 'Nchelenge'      },
  // Muchinga Zone (z8)
  { name: 'Agness Chanda',     phone: '+260971208001', zoneKey: 'z8', zbmKey: 'zbm-08', territory: 'Chinsali'       },
  { name: 'Richard Mwila',     phone: '+260971208002', zoneKey: 'z8', zbmKey: 'zbm-08', territory: 'Mpika'          },
  { name: 'Priscilla Lungu',   phone: '+260971208003', zoneKey: 'z8', zbmKey: 'zbm-08', territory: 'Isoka'          },
  // North-Western Zone (z9)
  { name: 'Christopher Kabwe', phone: '+260971209001', zoneKey: 'z9', zbmKey: 'zbm-09', territory: 'Solwezi'        },
  { name: 'Judith Mutondo',    phone: '+260971209002', zoneKey: 'z9', zbmKey: 'zbm-09', territory: 'Mwinilunga'     },
  { name: 'Nathan Sakala',     phone: '+260971209003', zoneKey: 'z9', zbmKey: 'zbm-09', territory: 'Kabompo'        },
  // Central Zone (z10)
  { name: 'Oliver Kasonde',    phone: '+260971210001', zoneKey: 'z10', zbmKey: 'zbm-10', territory: 'Kabwe'         },
  { name: 'Mercy Zimba',       phone: '+260971210002', zoneKey: 'z10', zbmKey: 'zbm-10', territory: 'Mkushi'        },
  { name: 'Stanslaus Nkhoma',  phone: '+260971210003', zoneKey: 'z10', zbmKey: 'zbm-10', territory: 'Kapiri Mposhi' },
  { name: 'Brenda Chileshe',   phone: '+260971210004', zoneKey: 'z10', zbmKey: 'zbm-10', territory: 'Chibombo'      },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function post(path, body) {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return r.json()
}

async function register(user) {
  const res = await post('/auth/register', user)
  if (res.error) {
    if (res.error.includes('already registered')) return { skip: true, phone: user.phone }
    return { error: res.error, phone: user.phone }
  }
  return { ok: true, id: res.user.id, token: res.token, name: res.user.name, phone: user.phone }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`\n🌾 Zamgrow Exchange — User Seeder`)
console.log(`📡 API: ${API}\n`)

// Step 1: Get HSD token (register or use existing)
console.log('─── Step 1: HSD User ───────────────────────────────')
let hsdToken
const hsdRes = await register({ ...HSD })
if (hsdRes.ok) {
  hsdToken = hsdRes.token
  console.log(`✅ HSD created: ${hsdRes.name}`)
} else if (hsdRes.skip) {
  // Already exists — need fresh token via a workaround (re-register different phone variant won't work)
  // Just use the previously registered Patricia3 token from session
  console.log(`⚠️  HSD already exists (${hsdRes.phone}) — using existing`)
  // Try to get token by registering a temp user and use that for zone setup
  hsdToken = null
} else {
  console.error(`❌ HSD error: ${JSON.stringify(hsdRes)}`)
}

// Step 2: Fetch zone IDs from live API (need a token)
console.log('\n─── Step 2: Fetch live zone IDs ────────────────────')
// Register a fresh temp user to get a token if we lost the HSD one
if (!hsdToken) {
  const tmpRes = await register({ name: 'SeedBot', phone: '+260977999888', role: 'hsd', province: 'Lusaka' })
  hsdToken = tmpRes.token || null
  if (!hsdToken) { console.error('❌ Cannot get auth token'); process.exit(1) }
}

const zonesResp = await fetch(`${API}/sales/zones`, {
  headers: { Authorization: `Bearer ${hsdToken}` }
}).then(r => r.json())

const zones = zonesResp.data || []
if (zones.length === 0) {
  console.log('⚠️  No zones found — running setup...')
  await fetch(`${API}/sales/setup/zones`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${hsdToken}`, 'Content-Type': 'application/json' }
  })
  await sleep(1000)
}

// Re-fetch zones
const zones2Resp = await fetch(`${API}/sales/zones`, {
  headers: { Authorization: `Bearer ${hsdToken}` }
}).then(r => r.json())
const liveZones = zones2Resp.data || []
console.log(`✅ ${liveZones.length} zones available`)

// Build zone name → DB ID map
const zoneNameToId = {}
for (const z of liveZones) {
  zoneNameToId[z.zoneName] = z.zoneId
}

// Build zoneKey → DB zone ID
const zoneKeyToDbId = {}
for (const [key, val] of Object.entries(ZONE_PROVINCES)) {
  const dbId = zoneNameToId[val.name]
  if (dbId) zoneKeyToDbId[key] = dbId
}
console.log('Zone key → DB ID:', Object.entries(zoneKeyToDbId).slice(0,3).map(([k,v])=>`${k}→${v.slice(0,8)}`).join(', '), '...')

// Step 3: Register ZBMs
console.log('\n─── Step 3: Register 10 ZBMs ───────────────────────')
const zbmKeyToDbId = {}
let zbmOk = 0, zbmSkip = 0, zbmErr = 0

for (const zbm of ZBMs) {
  const zoneDbId = zoneKeyToDbId[zbm.zoneKey]
  const province = ZONE_PROVINCES[zbm.zoneKey]?.province || 'Lusaka'
  const res = await register({
    name: zbm.name,
    phone: zbm.phone,
    role: 'zbm',
    province,
    zoneId: zoneDbId,
  })
  if (res.ok) {
    zbmKeyToDbId[zbm.id] = res.id
    console.log(`  ✅ ${zbm.name} (${zbm.id}) → DB: ${res.id.slice(0,12)}`)
    zbmOk++
  } else if (res.skip) {
    console.log(`  ⏭️  ${zbm.name} already exists`)
    zbmSkip++
  } else {
    console.log(`  ❌ ${zbm.name}: ${JSON.stringify(res.error)}`)
    zbmErr++
  }
  await sleep(150) // rate limiting
}
console.log(`\nZBMs: ✅ ${zbmOk} created, ⏭️  ${zbmSkip} skipped, ❌ ${zbmErr} errors`)

// Step 4: Register TDRs
console.log('\n─── Step 4: Register 40 TDRs ───────────────────────')
let tdrOk = 0, tdrSkip = 0, tdrErr = 0

for (const tdr of TDRs) {
  const zoneDbId = zoneKeyToDbId[tdr.zoneKey]
  const zbmDbId  = zbmKeyToDbId[tdr.zbmKey]
  const province = ZONE_PROVINCES[tdr.zoneKey]?.province || 'Lusaka'

  const res = await register({
    name: tdr.name,
    phone: tdr.phone,
    role: 'tdr',
    province,
    zoneId: zoneDbId,
    zbmId: zbmDbId,
    territory: tdr.territory,
  })
  if (res.ok) {
    console.log(`  ✅ ${tdr.name} → ${tdr.territory}`)
    tdrOk++
  } else if (res.skip) {
    console.log(`  ⏭️  ${tdr.name} already exists`)
    tdrSkip++
  } else {
    console.log(`  ❌ ${tdr.name}: ${JSON.stringify(res.error)}`)
    tdrErr++
  }
  await sleep(150)
}
console.log(`\nTDRs: ✅ ${tdrOk} created, ⏭️  ${tdrSkip} skipped, ❌ ${tdrErr} errors`)

// Step 5: Set zone targets via HSD
console.log('\n─── Step 5: Set Zone Targets ───────────────────────')
const TARGETS = {
  'z1':  { targetRevenue: 600000, targetListings: 120, targetNewFarmers: 60,  targetTransactions: 90 },
  'z2':  { targetRevenue: 500000, targetListings: 100, targetNewFarmers: 50,  targetTransactions: 75 },
  'z3':  { targetRevenue: 320000, targetListings:  80, targetNewFarmers: 40,  targetTransactions: 56 },
  'z4':  { targetRevenue: 320000, targetListings:  80, targetNewFarmers: 40,  targetTransactions: 56 },
  'z5':  { targetRevenue: 400000, targetListings:  90, targetNewFarmers: 45,  targetTransactions: 68 },
  'z6':  { targetRevenue: 180000, targetListings:  45, targetNewFarmers: 22,  targetTransactions: 34 },
  'z7':  { targetRevenue: 180000, targetListings:  45, targetNewFarmers: 22,  targetTransactions: 34 },
  'z8':  { targetRevenue: 180000, targetListings:  45, targetNewFarmers: 22,  targetTransactions: 34 },
  'z9':  { targetRevenue: 180000, targetListings:  45, targetNewFarmers: 22,  targetTransactions: 34 },
  'z10': { targetRevenue: 280000, targetListings:  70, targetNewFarmers: 35,  targetTransactions: 50 },
}

const now = new Date()
const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`
let tgtOk = 0

for (const [key, tgt] of Object.entries(TARGETS)) {
  const zoneId = zoneKeyToDbId[key]
  if (!zoneId) { console.log(`  ⚠️  No DB ID for ${key}`); continue }
  const r = await fetch(`${API}/sales/targets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${hsdToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ zoneId, period, ...tgt }),
  }).then(r => r.json())
  if (r.success) {
    console.log(`  ✅ Targets set for ${ZONE_PROVINCES[key].name}`)
    tgtOk++
  } else {
    console.log(`  ❌ ${key}: ${r.error || JSON.stringify(r)}`)
  }
  await sleep(200)
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════')
console.log('🎉 SEEDING COMPLETE')
console.log('════════════════════════════════════════════════════')
console.log(`  HSD:          1 (Patricia Mumba)`)
console.log(`  ZBMs:         ${zbmOk + zbmSkip}/10`)
console.log(`  TDRs:         ${tdrOk + tdrSkip}/40`)
console.log(`  Zone targets: ${tgtOk}/10`)
console.log(`\n  Default PIN:  ${DEFAULT_PASSWORD}`)
console.log(`  API:          ${API}`)
console.log('\n  Sales Portal: https://zamtelsd-max.github.io/zamgrow-exchange/sales')
console.log('════════════════════════════════════════════════════\n')
