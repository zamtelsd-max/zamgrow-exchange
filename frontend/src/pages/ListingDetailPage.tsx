import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { toggleSaved } from '../store/slices/listingsSlice'
import { openAuthModal, openSubscribeModal } from '../store/slices/uiSlice'
import { deductCredit } from '../store/slices/authSlice'
import { formatZMW, timeAgo, formatDate } from '../services/mockData'
import {
  MapPin, Heart, Star, CheckCircle, Eye, MessageSquare,
  Calendar, Package, Phone, ChevronLeft, Share2, Flag,
  TrendingUp, ArrowRight, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { listings, savedListings } = useSelector((s: RootState) => s.listings)
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)

  const listing = listings.find(l => l.id === id)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerSubmitted, setOfferSubmitted] = useState(false)

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
        <p className="text-gray-500 mb-6">This listing may have been removed or expired.</p>
        <Link to="/browse" className="btn-primary">Browse Listings</Link>
      </div>
    )
  }

  const isSaved = savedListings.includes(listing.id)
  const isOwnListing = user?.id === listing.userId

  const handleMakeOffer = () => {
    if (!isAuthenticated) { dispatch(openAuthModal('login')); return }
    if (user!.creditsBalance === 0) { dispatch(openSubscribeModal()); return }
    setShowOfferForm(true)
  }

  const handleSubmitOffer = () => {
    if (!offerPrice) { toast.error('Please enter an offer price'); return }
    dispatch(deductCredit())
    setOfferSubmitted(true)
    setShowOfferForm(false)
    toast.success('Offer sent! 1 credit deducted. Seller will be notified.')
  }

  const photos = listing.photos.length > 0 ? listing.photos : [{ id: 'default', listingId: listing.id, url: '', sortOrder: 1 }]
  const currentPhoto = photos[photoIdx]

  // Related listings
  const related = listings.filter(l => l.id !== id && l.category === listing.category && l.status === 'ACTIVE').slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-gray-700">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <span>/</span>
        <Link to="/browse" className="hover:text-gray-700">Browse</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{listing.product}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Photos + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <div className="card overflow-hidden">
            <div className="aspect-[16/9] bg-gray-100 relative">
              {currentPhoto.url ? (
                <img src={currentPhoto.url} alt={listing.product} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">{listing.categoryEmoji}</span>
                </div>
              )}
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <span className={listing.type === 'SELL' ? 'badge-sell' : 'badge-buy'}>
                  {listing.type === 'SELL' ? '📦 For Sale' : '🛒 Wanted'}
                </span>
              </div>
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => { dispatch(toggleSaved(listing.id)); toast.success(isSaved ? 'Removed from watchlist' : 'Added to watchlist') }}
                  className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                >
                  <Heart className={clsx('w-5 h-5', isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600')} />
                </button>
                <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setPhotoIdx(i)}
                    className={clsx('flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all', i === photoIdx ? 'border-primary-500' : 'border-transparent')}
                  >
                    {p.url ? <img src={p.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">{listing.categoryEmoji}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Info */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{listing.product}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{listing.categoryEmoji} {listing.category}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-700">{formatZMW(listing.priceZmw)}</div>
                <div className="text-sm text-gray-500">per {listing.unit}</div>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              {[
                { icon: Package, label: 'Quantity', value: `${listing.quantity} ${listing.unit}` },
                { icon: MapPin, label: 'Location', value: `${listing.district.name}, ${listing.province.name}` },
                { icon: Calendar, label: listing.type === 'SELL' ? 'Available' : 'Deadline', value: formatDate(listing.dateAvailable || listing.deadline || listing.createdAt) },
                { icon: Eye, label: 'Views', value: `${listing.viewsCount} views` },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{listing.description}</p>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Posted {timeAgo(listing.createdAt)}</span>
              <span>•</span>
              <span>Expires {formatDate(listing.expiresAt)}</span>
              <span>•</span>
              <span>{listing.offersCount} offers received</span>
            </div>
          </div>
        </div>

        {/* Right: Seller + Offer */}
        <div className="space-y-5">
          {/* Seller Card */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">
              {listing.type === 'SELL' ? 'Seller' : 'Buyer'} Details
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{listing.user.name[0]}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900">{listing.user.name}</span>
                  {listing.user.isVerified && (
                    <CheckCircle className="w-4 h-4 text-primary-500" />
                  )}
                </div>
                {listing.user.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm text-gray-600">{listing.user.rating} ({listing.user.reviewCount} reviews)</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">{listing.user.completedTransactions} completed trades</p>
              </div>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl text-sm text-primary-700 flex items-start gap-2">
              <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Member since {new Date(listing.user.createdAt).getFullYear()}
            </div>
          </div>

          {/* Offer Section */}
          <div className="card p-5">
            {!isOwnListing ? (
              <>
                {offerSubmitted ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Offer Sent!</h3>
                    <p className="text-sm text-gray-500">The seller will be notified and can accept, reject, or counter your offer.</p>
                  </div>
                ) : showOfferForm ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Make an Offer</h3>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Your Offer Price (K per {listing.unit})</label>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={e => setOfferPrice(e.target.value)}
                        placeholder={String(listing.priceZmw)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Message (optional)</label>
                      <textarea
                        value={offerMessage}
                        onChange={e => setOfferMessage(e.target.value)}
                        placeholder="Tell the seller about your requirements..."
                        rows={3}
                        className="input-field resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Sending this offer will deduct 1 credit from your balance ({user?.creditsBalance} remaining)
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setShowOfferForm(false)} className="btn-secondary">Cancel</button>
                      <button onClick={handleSubmitOffer} className="btn-primary">Send Offer</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button onClick={handleMakeOffer} className="btn-primary w-full py-3.5 text-base">
                      <MessageSquare className="w-5 h-5" />
                      Make an Offer
                    </button>
                    <p className="text-xs text-center text-gray-400">Costs 1 credit. You have {user?.creditsBalance ?? 0} credits.</p>
                    {isAuthenticated && user && user.creditsBalance === 0 && (
                      <button onClick={() => dispatch(openSubscribeModal())} className="btn-amber w-full py-3">
                        Subscribe to Continue
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">This is your listing</p>
                <Link to="/dashboard" className="btn-primary w-full text-sm">
                  Manage in Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Safety Tips */}
          <div className="card p-4 bg-amber-50 border-amber-100">
            <h4 className="font-medium text-amber-800 text-sm mb-2">🛡️ Safety Tips</h4>
            <ul className="space-y-1">
              {['Never pay upfront before inspection', 'Meet in a public/safe location', 'Verify the seller\'s identity', 'Use platform messaging only'].map(tip => (
                <li key={tip} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>{tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Report */}
          <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors mx-auto">
            <Flag className="w-4 h-4" /> Report this listing
          </button>
        </div>
      </div>

      {/* Related Listings */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="section-title mb-6">Similar Listings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {related.map(l => (
              <div key={l.id} className="card-hover overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  {l.photos[0] ? (
                    <img src={l.photos[0].url} alt={l.product} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">{l.categoryEmoji}</div>
                  )}
                </div>
                <Link to={`/listings/${l.id}`} className="block p-3">
                  <p className="font-medium text-sm text-gray-900">{l.product}</p>
                  <p className="text-primary-700 font-bold text-sm mt-1">{formatZMW(l.priceZmw)}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />{l.province.name}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
