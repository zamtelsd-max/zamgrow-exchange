import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../store'
import { MOCK_LISTINGS } from '../services/mockData'
import { Star, CheckCircle, MapPin, Phone, Calendar, Package, Crown } from 'lucide-react'
import ListingCard from '../components/marketplace/ListingCard'

export default function ProfilePage() {
  const { user } = useSelector((s: RootState) => s.auth)

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
        <p className="text-gray-500 mb-6">Please sign in to view your profile.</p>
      </div>
    )
  }

  const myListings = MOCK_LISTINGS.filter(l => l.status === 'ACTIVE').slice(0, 6)

  const MOCK_REVIEWS = [
    { id: 'r1', reviewer: { name: 'Grace Banda' }, rating: 5, comment: 'Excellent quality maize. Delivery was on time and quantity was accurate. Will buy again!', date: '2025-03-15' },
    { id: 'r2', reviewer: { name: 'Emmanuel Phiri' }, rating: 5, comment: 'Very professional farmer. Product matched description perfectly.', date: '2025-02-28' },
    { id: 'r3', reviewer: { name: 'Charity Tembo' }, rating: 4, comment: 'Good soya beans. Slightly delayed but quality was great.', date: '2025-02-01' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="card p-8 mb-8 bg-gradient-to-r from-primary-50 to-emerald-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-4xl font-bold">{user.name[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.isVerified && (
                <div className="badge-verified">
                  <CheckCircle className="w-3.5 h-3.5" /> KYC Verified
                </div>
              )}
              {user.subscription?.status === 'ACTIVE' && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Crown className="w-3.5 h-3.5" /> Premium
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                {user.phone}
              </div>
              {user.province && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {user.district?.name}, {user.province.name}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Member since {new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="flex gap-4">
              {[
                { label: 'Rating', value: `⭐ ${user.rating}` },
                { label: 'Reviews', value: user.reviewCount },
                { label: 'Trades', value: user.completedTransactions },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="text-xl font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/listings/create" className="btn-primary text-sm">
              <Package className="w-4 h-4" />
              Post Listing
            </Link>
            <Link to="/dashboard" className="btn-secondary text-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listings */}
        <div className="lg:col-span-2">
          <h2 className="section-title mb-4">Active Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myListings.map(l => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="section-title mb-4">Reviews</h2>
          <div className="space-y-4">
            {MOCK_REVIEWS.map(review => (
              <div key={review.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">{review.reviewer.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.reviewer.name}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">"{review.comment}"</p>
                <p className="text-xs text-gray-400 mt-2">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
