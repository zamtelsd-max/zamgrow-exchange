import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { openAuthModal } from '../store/slices/uiSlice'
import { demoLogin } from '../store/slices/authSlice'
import SearchBar from '../components/marketplace/SearchBar'
import { CATEGORIES, MOCK_LISTINGS, MOCK_USERS, formatZMW } from '../services/mockData'
import {
  TrendingUp, Shield, Smartphone, Zap, MapPin, Star,
  ArrowRight, CheckCircle, Users, Package, BarChart2, Award
} from 'lucide-react'

const STATS = [
  { label: 'Active Farmers', value: '14,800+', icon: Users },
  { label: 'Live Listings', value: '3,200+', icon: Package },
  { label: 'Provinces Covered', value: '10 / 10', icon: MapPin },
  { label: 'Transactions', value: '8,900+', icon: TrendingUp },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Pricing',
    desc: 'Get real-time price suggestions powered by machine learning. Know what your crops are worth before you list.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: MapPin,
    title: 'Hyper-Local for Zambia',
    desc: 'All 10 provinces, districts, and agroecological zones. Find buyers and sellers near you.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money Native',
    desc: 'Pay via Airtel Money, MTN MoMo, or Zamtel Money. No bank account needed.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Shield,
    title: 'Verified Traders',
    desc: 'KYC-verified sellers and buyers. Trade with confidence knowing who you are dealing with.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: BarChart2,
    title: 'Market Intelligence',
    desc: 'Province price heatmaps, trends and alerts. Stay ahead of market movements.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Award,
    title: 'Dual Marketplace',
    desc: 'Both buyers AND sellers post listings. The first platform built for both sides of the trade.',
    color: 'bg-indigo-50 text-indigo-600',
  },
]

const TESTIMONIALS = [
  {
    name: 'Joseph Mwale',
    role: 'Maize Farmer, Eastern Province',
    rating: 5,
    text: 'Before Zamgrow, middlemen took 40% of my profit. Now I sell directly to millers in Lusaka at market price. I made K45,000 more last season.',
    avatar: 'J',
  },
  {
    name: 'Grace Banda',
    role: 'Procurement Manager, Lusaka',
    rating: 5,
    text: 'We source all our soya beans through Zamgrow Exchange. The price comparison feature saves our company thousands every month.',
    avatar: 'G',
  },
  {
    name: 'Emmanuel Phiri',
    role: 'Agro-dealer, Central Province',
    rating: 5,
    text: 'The AI pricing tool is incredible. It tells me exactly what price to set and my listings get offers within hours.',
    avatar: 'E',
  },
]

export default function LandingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const featuredListings = MOCK_LISTINGS.filter(l => l.type === 'SELL').slice(0, 4)

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-green-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full filter blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>🇿🇲 Zambia's #1 Agricultural Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Connect. Trade.{' '}
              <span className="bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
                Grow.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Zamgrow Exchange connects Zambian farmers directly to buyers with AI-powered pricing intelligence. 
              No middlemen. Fair prices. All 10 provinces.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar large placeholder="Search maize, soya, livestock, fish..." />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => dispatch(openAuthModal('register'))}
                className="btn-amber text-base py-3.5 px-8 shadow-lg"
              >
                Join Free — 10 Credits
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => { dispatch(demoLogin()); navigate('/browse') }}
                className="flex items-center justify-center gap-2 px-8 py-3.5 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-medium text-base"
              >
                Explore Marketplace
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-green-200">
              {['Free to join', 'K20/month after 10 credits', '100% Zambian farmers', 'Secure payments'].map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1200 50 960 60 720 40C480 20 240 30 0 0L0 60Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(stat => (
            <div key={stat.label} className="card p-5 text-center">
              <stat.icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Browse by Category</h2>
          <p className="text-gray-500">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={`/browse?category=${cat.name}`}
              className="card p-4 text-center hover:border-primary-200 hover:bg-primary-50 transition-all cursor-pointer group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</div>
              <div className="text-xs font-medium text-gray-700">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Latest Listings</h2>
              <p className="text-gray-500 mt-1">Fresh from Zambian farmers</p>
            </div>
            <Link to="/browse" className="btn-secondary text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map(listing => (
              <div key={listing.id} className="card-hover group overflow-hidden">
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {listing.photos[0] ? (
                    <img src={listing.photos[0].url} alt={listing.product} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">{listing.categoryEmoji}</div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="badge-sell">For Sale</span>
                  </div>
                </div>
                <Link to={`/listings/${listing.id}`} className="block p-4">
                  <h3 className="font-semibold text-gray-900">{listing.product}</h3>
                  <p className="text-gray-500 text-sm">{listing.quantity} {listing.unit}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary-700 font-bold">{formatZMW(listing.priceZmw)}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />{listing.province.name}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="page-title mb-4">Why Zamgrow Exchange?</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Built specifically for Zambian agriculture. Every feature designed for the farmer, trader, and agro-dealer.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-6">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Trusted by Zambian Farmers</h2>
            <p className="text-gray-500">Real stories from real traders</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Trade Smarter?</h2>
          <p className="text-green-100 mb-8 text-lg">
            Join 14,800+ Zambian farmers and buyers on Zamgrow Exchange. Start with 10 free credits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => dispatch(openAuthModal('register'))}
              className="btn-amber text-base py-3.5 px-8 shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/browse"
              className="flex items-center justify-center gap-2 px-8 py-3.5 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-medium"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
