import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { openAuthModal, openSubscribeModal } from '../store/slices/uiSlice'
import { MOCK_LISTINGS, formatZMW, formatDate } from '../services/mockData'
import {
  Package, MessageSquare, Coins, Crown, TrendingUp, TrendingDown,
  Plus, Eye, Edit, CheckCircle, Clock, AlertCircle, Bell, Heart
} from 'lucide-react'
import clsx from 'clsx'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const { notifications, unreadCount } = useSelector((s: RootState) => s.notifications)

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">Sign In to View Dashboard</h2>
        <p className="text-gray-500 mb-6">Manage your listings, track offers, and monitor your account.</p>
        <button onClick={() => dispatch(openAuthModal('login'))} className="btn-primary">Sign In</button>
      </div>
    )
  }

  const myListings = MOCK_LISTINGS.filter(l => l.userId === user!.id).slice(0, 3)
  const recentOffers = MOCK_LISTINGS.slice(0, 3) // Mock offers on my listings

  const stats = [
    { icon: Package, label: 'Active Listings', value: myListings.length, color: 'text-primary-600 bg-primary-50', change: '+2 this week' },
    { icon: MessageSquare, label: 'Enquiries Today', value: 7, color: 'text-blue-600 bg-blue-50', change: '+3 from yesterday' },
    { icon: Coins, label: 'Credits Remaining', value: user!.creditsBalance, color: 'text-amber-600 bg-amber-50', change: user!.creditsBalance === 0 ? 'Subscribe to continue' : `${user!.creditsBalance} left` },
    { icon: Crown, label: 'Subscription', value: user?.subscription?.status === 'ACTIVE' ? 'Monthly' : 'Free', color: 'text-purple-600 bg-purple-50', change: user?.subscription ? `Expires ${formatDate(user.subscription.endDate)}` : 'Upgrade for more' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name.split(' ')[0]}! 👋</p>
        </div>
        <button onClick={() => navigate('/listings/create')} className="btn-primary">
          <Plus className="w-4 h-4" /> Post Listing
        </button>
      </div>

      {/* Credits Warning */}
      {user!.creditsBalance === 0 && (
        <div className="card p-4 bg-amber-50 border-amber-200 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">You've used all your free credits</p>
              <p className="text-sm text-amber-600">Subscribe for K20/month to continue making offers and posting listings</p>
            </div>
          </div>
          <button onClick={() => dispatch(openSubscribeModal())} className="btn-amber flex-shrink-0">
            Subscribe Now
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1">{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Listings */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">My Listings</h2>
              <Link to="/listings/create" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                + New Listing
              </Link>
            </div>
            {myListings.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-500 mb-4">No listings yet</p>
                <Link to="/listings/create" className="btn-primary text-sm">Post Your First Listing</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {myListings.map(listing => (
                  <div key={listing.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {listing.photos[0] ? (
                        <img src={listing.photos[0].url} alt={listing.product} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">{listing.categoryEmoji}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{listing.product}</p>
                      <p className="text-sm text-gray-500">{listing.quantity} {listing.unit} · {formatZMW(listing.priceZmw)}/unit</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={clsx('badge-active text-xs', listing.status !== 'ACTIVE' && 'bg-gray-100 text-gray-500')}>
                          {listing.status}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" />{listing.viewsCount}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />{listing.offersCount} offers
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/listings/${listing.id}`} className="btn-ghost p-2 text-sm">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="btn-ghost p-2 text-sm">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 border-t border-gray-100 text-center">
              <Link to="/browse" className="text-sm text-primary-600 font-medium hover:text-primary-700">
                View All My Listings →
              </Link>
            </div>
          </div>

          {/* Recent Offers Received */}
          <div className="card overflow-hidden mt-5">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Offers Received</h2>
              <span className="badge-active text-xs">3 pending</span>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOffers.map((listing, i) => (
                <div key={listing.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">Offer on {listing.product}</span>
                    <span className="text-primary-700 font-bold">{formatZMW(listing.priceZmw * 0.95)}/unit</span>
                  </div>
                  <p className="text-sm text-gray-500">From: {['Grace Banda', 'Emmanuel Phiri', 'Charity Tembo'][i]}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending response · {i + 1}h ago</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">Accept</button>
                      <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Counter</button>
                      <button className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Decline</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Profile Card */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{user!.name[0]}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-gray-900">{user!.name}</p>
                  {user!.isVerified && <CheckCircle className="w-4 h-4 text-primary-500" />}
                </div>
                <p className="text-sm text-gray-500">{user!.phone}</p>
                <p className="text-xs text-gray-400">{user!.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              {[
                { label: 'Rating', value: `${user!.rating}⭐` },
                { label: 'Reviews', value: user!.reviewCount },
                { label: 'Trades', value: user!.completedTransactions },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-2">
                  <div className="font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
            <Link to="/profile" className="btn-secondary w-full mt-4 text-sm">View Profile</Link>
          </div>

          {/* Notifications */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-900">Notifications</span>
              </div>
              {unreadCount > 0 && <span className="badge-active text-xs">{unreadCount} new</span>}
            </div>
            <div className="divide-y divide-gray-100">
              {notifications.slice(0, 4).map(n => (
                <div key={n.id} className={clsx('p-3', !n.isRead && 'bg-primary-50/50')}>
                  <div className="flex items-start gap-2">
                    {!n.isRead && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />}
                    <div className={!n.isRead ? '' : 'pl-3.5'}>
                      <p className="text-xs font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Links</p>
            {[
              { icon: Heart, label: 'My Watchlist', href: '/watchlist' },
              { icon: Crown, label: 'Upgrade Plan', href: '/subscribe' },
              { icon: TrendingUp, label: 'Market Prices', href: '/market' },
            ].map(({ icon: Icon, label, href }) => (
              <Link key={label} to={href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                <Icon className="w-4 h-4 text-primary-600" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
