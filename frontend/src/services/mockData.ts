import type { Province, Category, Listing, User, PriceData, HeatmapData, Notification, AdminStats } from '../types'

// ============================================================
// Zambia Provinces & Districts
// ============================================================
export const PROVINCES: Province[] = [
  { id: 1, name: 'Central', capital: 'Kabwe', agrozone: 'Zone IIa', color: '#16a34a', districts: [{ id: 11, name: 'Mkushi', provinceId: 1 }, { id: 12, name: 'Serenje', provinceId: 1 }, { id: 13, name: 'Mumbwa', provinceId: 1 }, { id: 14, name: 'Chibombo', provinceId: 1 }, { id: 15, name: 'Kapiri Mposhi', provinceId: 1 }, { id: 16, name: 'Kabwe', provinceId: 1 }] },
  { id: 2, name: 'Copperbelt', capital: 'Ndola', agrozone: 'Zone III', color: '#b45309', districts: [{ id: 21, name: 'Kitwe', provinceId: 2 }, { id: 22, name: 'Ndola', provinceId: 2 }, { id: 23, name: 'Chingola', provinceId: 2 }, { id: 24, name: 'Mufulira', provinceId: 2 }, { id: 25, name: 'Kalulushi', provinceId: 2 }] },
  { id: 3, name: 'Eastern', capital: 'Chipata', agrozone: 'Zone IIa/IIb', color: '#0891b2', districts: [{ id: 31, name: 'Chipata', provinceId: 3 }, { id: 32, name: 'Petauke', provinceId: 3 }, { id: 33, name: 'Katete', provinceId: 3 }, { id: 34, name: 'Lundazi', provinceId: 3 }, { id: 35, name: 'Chadiza', provinceId: 3 }] },
  { id: 4, name: 'Luapula', capital: 'Mansa', agrozone: 'Zone III', color: '#7c3aed', districts: [{ id: 41, name: 'Mansa', provinceId: 4 }, { id: 42, name: 'Nchelenge', provinceId: 4 }, { id: 43, name: 'Kawambwa', provinceId: 4 }, { id: 44, name: 'Mwense', provinceId: 4 }] },
  { id: 5, name: 'Lusaka', capital: 'Lusaka', agrozone: 'Zone I/IIa', color: '#dc2626', districts: [{ id: 51, name: 'Lusaka City', provinceId: 5 }, { id: 52, name: 'Chongwe', provinceId: 5 }, { id: 53, name: 'Kafue', provinceId: 5 }, { id: 54, name: 'Chilanga', provinceId: 5 }] },
  { id: 6, name: 'Muchinga', capital: 'Chinsali', agrozone: 'Zone IIa/III', color: '#ea580c', districts: [{ id: 61, name: 'Chinsali', provinceId: 6 }, { id: 62, name: 'Mpika', provinceId: 6 }, { id: 63, name: 'Nakonde', provinceId: 6 }, { id: 64, name: 'Isoka', provinceId: 6 }] },
  { id: 7, name: 'Northern', capital: 'Kasama', agrozone: 'Zone III', color: '#0d9488', districts: [{ id: 71, name: 'Kasama', provinceId: 7 }, { id: 72, name: 'Mbala', provinceId: 7 }, { id: 73, name: 'Luwingu', provinceId: 7 }, { id: 74, name: 'Mporokoso', provinceId: 7 }] },
  { id: 8, name: 'North-Western', capital: 'Solwezi', agrozone: 'Zone IIb/III', color: '#9333ea', districts: [{ id: 81, name: 'Solwezi', provinceId: 8 }, { id: 82, name: 'Mwinilunga', provinceId: 8 }, { id: 83, name: 'Zambezi', provinceId: 8 }, { id: 84, name: 'Kabompo', provinceId: 8 }] },
  { id: 9, name: 'Southern', capital: 'Choma', agrozone: 'Zone I/IIa', color: '#ca8a04', districts: [{ id: 91, name: 'Choma', provinceId: 9 }, { id: 92, name: 'Mazabuka', provinceId: 9 }, { id: 93, name: 'Monze', provinceId: 9 }, { id: 94, name: 'Kalomo', provinceId: 9 }, { id: 95, name: 'Gwembe', provinceId: 9 }] },
  { id: 10, name: 'Western', capital: 'Mongu', agrozone: 'Zone I/IIb', color: '#0284c7', districts: [{ id: 101, name: 'Mongu', provinceId: 10 }, { id: 102, name: 'Senanga', provinceId: 10 }, { id: 103, name: 'Sesheke', provinceId: 10 }, { id: 104, name: 'Kaoma', provinceId: 10 }] },
]

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Cereals', emoji: '🌾', image: '/zamgrow-exchange/categories/cereals.jpg', items: ['Maize', 'Wheat', 'Sorghum', 'Millet', 'Rice'] },
  { id: 2, name: 'Legumes', emoji: '🫘', image: '/zamgrow-exchange/categories/legumes.jpg', items: ['Soya Beans', 'Groundnuts', 'Beans', 'Cowpeas'] },
  { id: 3, name: 'Vegetables', emoji: '🥬', image: '/zamgrow-exchange/categories/vegetables.jpg', items: ['Tomatoes', 'Cabbage', 'Onions', 'Rape', 'Okra'] },
  { id: 4, name: 'Fruits', emoji: '🍊', image: '/zamgrow-exchange/categories/fruits.jpg', items: ['Mangoes', 'Bananas', 'Avocados', 'Pineapples'] },
  { id: 5, name: 'Livestock', emoji: '🐄', image: '/zamgrow-exchange/categories/livestock.jpg', items: ['Cattle', 'Goats', 'Sheep', 'Pigs'] },
  { id: 6, name: 'Fisheries', emoji: '🐟', image: '/zamgrow-exchange/categories/fisheries.jpg', items: ['Kapenta', 'Tilapia', 'Bream', 'Catfish'] },
  { id: 7, name: 'Dairy', emoji: '🥛', image: '/zamgrow-exchange/categories/dairy.jpg', items: ['Fresh Milk', 'Yoghurt', 'Cheese'] },
  { id: 8, name: 'Poultry', emoji: '🐔', image: '/zamgrow-exchange/categories/poultry.jpg', items: ['Broilers', 'Layers', 'Eggs', 'Day-old Chicks'] },
  { id: 9, name: 'Root Crops', emoji: '🍠', image: '/zamgrow-exchange/categories/rootcrops.jpg', items: ['Cassava', 'Sweet Potatoes', 'Irish Potatoes'] },
  { id: 10, name: 'Cash Crops', emoji: '🌿', image: '/zamgrow-exchange/categories/cashcrops.jpg', items: ['Tobacco', 'Cotton', 'Sunflower', 'Coffee'] },
  { id: 11, name: 'Honey & Bees', emoji: '🍯', image: '/zamgrow-exchange/categories/honey.jpg', items: ['Raw Honey', 'Beeswax'] },
  { id: 12, name: 'Nuts & Seeds', emoji: '🥜', image: '/zamgrow-exchange/categories/nuts.jpg', items: ['Cashew Nuts', 'Sesame', 'Pumpkin Seeds'] },
]

export const UNITS = ['50kg Bag', '90kg Bag', 'Tonne (MT)', 'Kg', 'Litre', 'Head', 'Crate', 'Bundle', 'Piece', 'Dozen']

// ============================================================
// Mock Users
// ============================================================
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Joseph Mwale', phone: '+260971234567', email: 'joseph@example.com', role: 'SELLER', province: PROVINCES[2], district: PROVINCES[2].districts[0], creditsBalance: 8, isVerified: true, rating: 4.8, reviewCount: 23, completedTransactions: 31, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'u2', name: 'Grace Banda', phone: '+260961234567', email: 'grace@example.com', role: 'BUYER', province: PROVINCES[4], district: PROVINCES[4].districts[0], creditsBalance: 10, isVerified: true, rating: 4.5, reviewCount: 12, completedTransactions: 15, createdAt: '2024-02-10T10:00:00Z' },
  { id: 'u3', name: 'Emmanuel Phiri', phone: '+260951234567', role: 'BOTH', province: PROVINCES[0], district: PROVINCES[0].districts[0], creditsBalance: 5, isVerified: false, rating: 4.2, reviewCount: 7, completedTransactions: 9, createdAt: '2024-03-01T10:00:00Z' },
  { id: 'u4', name: 'Charity Tembo', phone: '+260941234567', role: 'SELLER', province: PROVINCES[8], district: PROVINCES[8].districts[1], creditsBalance: 0, isVerified: true, rating: 4.9, reviewCount: 45, completedTransactions: 52, createdAt: '2023-11-05T10:00:00Z' },
  { id: 'admin1', name: 'Admin User', phone: '+260911111111', email: 'admin@zamgrow.co.zm', role: 'ADMIN', creditsBalance: 999, isVerified: true, createdAt: '2023-10-01T10:00:00Z' },
]

// ============================================================
// Mock Listings
// ============================================================
export const MOCK_LISTINGS: Listing[] = [
  { id: 'l1', userId: 'u1', user: MOCK_USERS[0], type: 'SELL', product: 'Maize', category: 'Cereals', categoryEmoji: '🌾', quantity: 500, unit: '50kg Bag', priceZmw: 310, province: PROVINCES[2], district: PROVINCES[2].districts[0], description: 'Premium grade maize from Eastern Province. Well-dried, no aflatoxin. Available from Chipata depot.', status: 'ACTIVE', photos: [{ id: 'p1', listingId: 'l1', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800', sortOrder: 1 }], dateAvailable: '2025-04-20', expiresAt: '2025-05-11', createdAt: '2025-04-11T08:00:00Z', offersCount: 7, viewsCount: 143, isSaved: false },
  { id: 'l2', userId: 'u4', user: MOCK_USERS[3], type: 'SELL', product: 'Soya Beans', category: 'Legumes', categoryEmoji: '🫘', quantity: 200, unit: '50kg Bag', priceZmw: 420, province: PROVINCES[8], district: PROVINCES[8].districts[1], description: 'Grade A Soya Beans, high protein content 38%+. Ideal for millers and processors.', status: 'ACTIVE', photos: [{ id: 'p3', listingId: 'l2', url: 'https://images.unsplash.com/photo-1508504509543-5a56bc7fdc5a?w=800', sortOrder: 1 }], dateAvailable: '2025-04-15', expiresAt: '2025-05-11', createdAt: '2025-04-10T09:30:00Z', offersCount: 12, viewsCount: 287, isSaved: true },
  { id: 'l3', userId: 'u2', user: MOCK_USERS[1], type: 'BUY', product: 'Maize', category: 'Cereals', categoryEmoji: '🌾', quantity: 1000, unit: '50kg Bag', priceZmw: 300, province: PROVINCES[4], district: PROVINCES[4].districts[2], description: 'Looking for bulk maize supply for flour milling. Contract available.', status: 'ACTIVE', photos: [], deadline: '2025-04-30', expiresAt: '2025-05-11', createdAt: '2025-04-09T11:00:00Z', offersCount: 5, viewsCount: 198, isSaved: false },
  { id: 'l4', userId: 'u3', user: MOCK_USERS[2], type: 'SELL', product: 'Irish Potatoes', category: 'Root Crops', categoryEmoji: '🍠', quantity: 150, unit: '50kg Bag', priceZmw: 180, province: PROVINCES[0], district: PROVINCES[0].districts[0], description: 'Fresh Irish potatoes from Mkushi. Excellent size and quality.', status: 'ACTIVE', photos: [{ id: 'p4', listingId: 'l4', url: 'https://images.unsplash.com/photo-1518977676405-d21e58ae77ea?w=800', sortOrder: 1 }], dateAvailable: '2025-04-12', expiresAt: '2025-05-11', createdAt: '2025-04-08T14:00:00Z', offersCount: 3, viewsCount: 89, isSaved: false },
  { id: 'l5', userId: 'u1', user: MOCK_USERS[0], type: 'SELL', product: 'Groundnuts', category: 'Legumes', categoryEmoji: '🫘', quantity: 80, unit: '50kg Bag', priceZmw: 550, province: PROVINCES[2], district: PROVINCES[2].districts[1], description: 'High quality shelled groundnuts. Great for oil pressing or direct consumption.', status: 'ACTIVE', photos: [{ id: 'p5', listingId: 'l5', url: 'https://images.unsplash.com/photo-1567632338614-5c3a5f45c157?w=800', sortOrder: 1 }], dateAvailable: '2025-04-18', expiresAt: '2025-05-11', createdAt: '2025-04-07T10:00:00Z', offersCount: 2, viewsCount: 67, isSaved: true },
  { id: 'l6', userId: 'u4', user: MOCK_USERS[3], type: 'SELL', product: 'Sunflower', category: 'Cash Crops', categoryEmoji: '🌿', quantity: 300, unit: '50kg Bag', priceZmw: 290, province: PROVINCES[8], district: PROVINCES[8].districts[2], description: 'Premium sunflower seeds, high oil content 42%.', status: 'ACTIVE', photos: [{ id: 'p6', listingId: 'l6', url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc36?w=800', sortOrder: 1 }], dateAvailable: '2025-04-16', expiresAt: '2025-05-11', createdAt: '2025-04-06T09:00:00Z', offersCount: 9, viewsCount: 201, isSaved: false },
  { id: 'l7', userId: 'u3', user: MOCK_USERS[2], type: 'SELL', product: 'Kapenta', category: 'Fisheries', categoryEmoji: '🐟', quantity: 50, unit: '50kg Bag', priceZmw: 1200, province: PROVINCES[3], district: PROVINCES[3].districts[2], description: 'Dried Kapenta from Lake Mweru. High quality, well-dried.', status: 'ACTIVE', photos: [], dateAvailable: '2025-04-14', expiresAt: '2025-05-11', createdAt: '2025-04-05T12:00:00Z', offersCount: 4, viewsCount: 112, isSaved: false },
  { id: 'l8', userId: 'u2', user: MOCK_USERS[1], type: 'BUY', product: 'Tomatoes', category: 'Vegetables', categoryEmoji: '🥬', quantity: 500, unit: 'Crate', priceZmw: 45, province: PROVINCES[4], district: PROVINCES[4].districts[0], description: 'Supermarket supply contract. Need fresh tomatoes weekly, minimum 100 crates.', status: 'ACTIVE', photos: [], deadline: '2025-05-01', expiresAt: '2025-05-11', createdAt: '2025-04-04T11:00:00Z', offersCount: 8, viewsCount: 156, isSaved: false },
  { id: 'l9', userId: 'u1', user: MOCK_USERS[0], type: 'SELL', product: 'Wheat', category: 'Cereals', categoryEmoji: '🌾', quantity: 400, unit: '50kg Bag', priceZmw: 380, province: PROVINCES[0], district: PROVINCES[0].districts[2], description: 'Commercial wheat variety, suitable for milling. Moisture 12.5%.', status: 'ACTIVE', photos: [{ id: 'p8', listingId: 'l9', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800', sortOrder: 1 }], dateAvailable: '2025-04-22', expiresAt: '2025-05-11', createdAt: '2025-04-03T08:00:00Z', offersCount: 6, viewsCount: 178, isSaved: false },
  { id: 'l10', userId: 'u4', user: MOCK_USERS[3], type: 'SELL', product: 'Cattle', category: 'Livestock', categoryEmoji: '🐄', quantity: 25, unit: 'Head', priceZmw: 8500, province: PROVINCES[8], district: PROVINCES[8].districts[3], description: 'Beef cattle, various breeds. Ages 2-4 years. Disease free certificate available.', status: 'ACTIVE', photos: [{ id: 'p9', listingId: 'l10', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800', sortOrder: 1 }], dateAvailable: '2025-04-20', expiresAt: '2025-05-11', createdAt: '2025-04-02T10:00:00Z', offersCount: 3, viewsCount: 94, isSaved: true },
  { id: 'l11', userId: 'u3', user: MOCK_USERS[2], type: 'SELL', product: 'Honey', category: 'Honey & Bees', categoryEmoji: '🍯', quantity: 200, unit: 'Litre', priceZmw: 120, province: PROVINCES[6], district: PROVINCES[6].districts[2], description: 'Pure organic honey from Northern Province forests. ZABS certified.', status: 'ACTIVE', photos: [{ id: 'p10', listingId: 'l11', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800', sortOrder: 1 }], dateAvailable: '2025-04-15', expiresAt: '2025-05-11', createdAt: '2025-04-01T09:00:00Z', offersCount: 11, viewsCount: 234, isSaved: false },
  { id: 'l12', userId: 'u2', user: MOCK_USERS[1], type: 'BUY', product: 'Soya Beans', category: 'Legumes', categoryEmoji: '🫘', quantity: 500, unit: '50kg Bag', priceZmw: 400, province: PROVINCES[4], district: PROVINCES[4].districts[1], description: 'Animal feed manufacturer seeking soya beans. Long-term contract available.', status: 'ACTIVE', photos: [], deadline: '2025-04-28', expiresAt: '2025-05-11', createdAt: '2025-03-31T11:00:00Z', offersCount: 14, viewsCount: 312, isSaved: false },
]

// ============================================================
// Market Data
// ============================================================
export const MOCK_PRICE_DATA: PriceData[] = [
  { productId: 'maize', product: 'Maize', provinceId: 3, province: 'Eastern', avgPrice: 315, minPrice: 280, maxPrice: 360, suggestedPrice: 310, confidenceScore: 0.87, dataPoints: 142, unit: 'per 50kg bag', currency: 'ZMW', trend: 'UP', changePercent: 3.2, lastUpdated: new Date().toISOString() },
  { productId: 'maize', product: 'Maize', provinceId: 1, province: 'Central', avgPrice: 300, minPrice: 270, maxPrice: 340, suggestedPrice: 298, confidenceScore: 0.91, dataPoints: 189, unit: 'per 50kg bag', currency: 'ZMW', trend: 'STABLE', changePercent: 0.5, lastUpdated: new Date().toISOString() },
  { productId: 'maize', product: 'Maize', provinceId: 9, province: 'Southern', avgPrice: 295, minPrice: 260, maxPrice: 330, suggestedPrice: 292, confidenceScore: 0.84, dataPoints: 98, unit: 'per 50kg bag', currency: 'ZMW', trend: 'DOWN', changePercent: -1.8, lastUpdated: new Date().toISOString() },
  { productId: 'soya', product: 'Soya Beans', provinceId: 3, province: 'Eastern', avgPrice: 430, minPrice: 390, maxPrice: 490, suggestedPrice: 425, confidenceScore: 0.82, dataPoints: 76, unit: 'per 50kg bag', currency: 'ZMW', trend: 'UP', changePercent: 5.1, lastUpdated: new Date().toISOString() },
  { productId: 'wheat', product: 'Wheat', provinceId: 1, province: 'Central', avgPrice: 375, minPrice: 340, maxPrice: 420, suggestedPrice: 372, confidenceScore: 0.79, dataPoints: 54, unit: 'per 50kg bag', currency: 'ZMW', trend: 'STABLE', changePercent: 0.8, lastUpdated: new Date().toISOString() },
  { productId: 'groundnuts', product: 'Groundnuts', provinceId: 3, province: 'Eastern', avgPrice: 560, minPrice: 490, maxPrice: 640, suggestedPrice: 552, confidenceScore: 0.75, dataPoints: 42, unit: 'per 50kg bag', currency: 'ZMW', trend: 'UP', changePercent: 2.9, lastUpdated: new Date().toISOString() },
  { productId: 'kapenta', product: 'Kapenta', provinceId: 4, province: 'Luapula', avgPrice: 1150, minPrice: 980, maxPrice: 1350, suggestedPrice: 1120, confidenceScore: 0.71, dataPoints: 31, unit: 'per 50kg bag', currency: 'ZMW', trend: 'DOWN', changePercent: -2.1, lastUpdated: new Date().toISOString() },
  { productId: 'tomatoes', product: 'Tomatoes', provinceId: 5, province: 'Lusaka', avgPrice: 48, minPrice: 35, maxPrice: 65, suggestedPrice: 46, confidenceScore: 0.68, dataPoints: 215, unit: 'per crate', currency: 'ZMW', trend: 'UP', changePercent: 12.4, lastUpdated: new Date().toISOString() },
]

export const MOCK_HEATMAP_DATA: HeatmapData[] = [
  { provinceId: 1, provinceName: 'Central', avgPrice: 300, listingCount: 47, intensity: 0.65 },
  { provinceId: 2, provinceName: 'Copperbelt', avgPrice: 340, listingCount: 31, intensity: 0.55 },
  { provinceId: 3, provinceName: 'Eastern', avgPrice: 315, listingCount: 89, intensity: 0.92 },
  { provinceId: 4, provinceName: 'Luapula', avgPrice: 280, listingCount: 23, intensity: 0.40 },
  { provinceId: 5, provinceName: 'Lusaka', avgPrice: 360, listingCount: 112, intensity: 1.0 },
  { provinceId: 6, provinceName: 'Muchinga', avgPrice: 270, listingCount: 18, intensity: 0.30 },
  { provinceId: 7, provinceName: 'Northern', avgPrice: 285, listingCount: 27, intensity: 0.45 },
  { provinceId: 8, provinceName: 'North-Western', avgPrice: 295, listingCount: 19, intensity: 0.35 },
  { provinceId: 9, provinceName: 'Southern', avgPrice: 295, listingCount: 58, intensity: 0.75 },
  { provinceId: 10, provinceName: 'Western', avgPrice: 275, listingCount: 21, intensity: 0.37 },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', type: 'OFFER', title: 'New Offer Received', message: 'Grace Banda made an offer on your Maize listing', isRead: false, createdAt: '2025-04-11T07:30:00Z' },
  { id: 'n2', userId: 'u1', type: 'PRICE_ALERT', title: 'Price Alert Triggered', message: 'Maize prices in Eastern Province rose above K320/bag', isRead: false, createdAt: '2025-04-11T06:00:00Z' },
  { id: 'n3', userId: 'u1', type: 'LISTING_EXPIRY', title: 'Listing Expiring Soon', message: 'Your Groundnuts listing expires in 3 days.', isRead: true, createdAt: '2025-04-10T09:00:00Z' },
  { id: 'n4', userId: 'u1', type: 'REVIEW', title: 'New Review', message: 'Emmanuel Phiri left a 5-star review', isRead: true, createdAt: '2025-04-09T15:00:00Z' },
  { id: 'n5', userId: 'u1', type: 'SUBSCRIPTION', title: 'Subscription Renewing', message: 'Your monthly subscription renews in 7 days (K20)', isRead: true, createdAt: '2025-04-08T08:00:00Z' },
]

export const MOCK_ADMIN_STATS: AdminStats = {
  totalUsers: 14823,
  totalListings: 3241,
  activeListings: 2187,
  monthlyRevenue: 148420,
  totalTransactions: 8934,
  pendingKyc: 47,
  newUsersToday: 23,
  newListingsToday: 61,
}

export const PRICE_HISTORY_MAIZE = [
  { month: 'Oct', avgPrice: 265, minPrice: 240, maxPrice: 300 },
  { month: 'Nov', avgPrice: 278, minPrice: 250, maxPrice: 310 },
  { month: 'Dec', avgPrice: 290, minPrice: 260, maxPrice: 325 },
  { month: 'Jan', avgPrice: 305, minPrice: 275, maxPrice: 345 },
  { month: 'Feb', avgPrice: 298, minPrice: 268, maxPrice: 335 },
  { month: 'Mar', avgPrice: 310, minPrice: 278, maxPrice: 355 },
  { month: 'Apr', avgPrice: 315, minPrice: 280, maxPrice: 360 },
]

export const PRICE_HISTORY_SOYA = [
  { month: 'Oct', avgPrice: 385, minPrice: 350, maxPrice: 430 },
  { month: 'Nov', avgPrice: 398, minPrice: 362, maxPrice: 445 },
  { month: 'Dec', avgPrice: 405, minPrice: 368, maxPrice: 455 },
  { month: 'Jan', avgPrice: 412, minPrice: 375, maxPrice: 462 },
  { month: 'Feb', avgPrice: 418, minPrice: 380, maxPrice: 470 },
  { month: 'Mar', avgPrice: 425, minPrice: 388, maxPrice: 478 },
  { month: 'Apr', avgPrice: 430, minPrice: 390, maxPrice: 490 },
]

// ── Utility helpers ───────────────────────────────────────────────────────────
export const formatZMW = (amount: number): string =>
  'K ' + amount.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const timeAgo = (dateStr: string): string => {
  const hours = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return hours + 'h ago'
  const days = Math.floor(hours / 24)
  return days < 7 ? days + 'd ago' : formatDate(dateStr)
}
