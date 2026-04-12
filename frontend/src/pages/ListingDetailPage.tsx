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
                <button
                  onClick={() => {
                    const text = `🌽 *${listing?.product}* for sale on Zamgrow Exchange

` +
                      `📦 Qty: ${listing?.quantity} ${listing?.unit}
` +
                      `💰 Price: K${listing?.priceZmw}/unit
` +
                      `📍 ${listing?.province?.name}, Zambia

` +
                      `View listing: ${window.location.href}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
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
