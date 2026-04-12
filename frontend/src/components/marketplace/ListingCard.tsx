import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { toggleSaved } from '../../store/slices/listingsSlice'
import { Listing } from '../../types'
import { MapPin, Heart, Star, Eye, MessageSquare, CheckCircle, Clock, Share2 } from 'lucide-react'
import { formatZMW, timeAgo } from '../../services/mockData'
import clsx from 'clsx'

interface Props { listing: Listing }

const WhatsAppIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function ListingCard({ listing }: Props) {
  const dispatch = useDispatch()
  const { savedListings } = useSelector((s: RootState) => s.listings)
  const isSaved = savedListings.includes(listing.id)
  const mainPhoto = listing.photos[0]?.url

  const shareOnWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    const text = `🌽 *${listing.product}* on Zamgrow Exchange\n\n` +
      `📦 ${listing.quantity} ${listing.unit}\n` +
      `💰 ${formatZMW(listing.priceZmw)}/unit\n` +
      `📍 ${listing.district?.name}, ${listing.province?.name}\n` +
      `👤 Seller: ${listing.user.name}\n\n` +
      `🔗 zamgrow-exchange.com/listings/${listing.id}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="card-hover group overflow-hidden flex flex-col">
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden flex-shrink-0">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={listing.product}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
            <span className="text-6xl">{listing.categoryEmoji}</span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={listing.type === 'SELL' ? 'badge-sell' : 'badge-buy'}>
            {listing.type === 'SELL' ? '📦 For Sale' : '🛒 Wanted'}
          </span>
        </div>

        {/* Action buttons top-right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {/* Save */}
          <button
            onClick={(e) => { e.preventDefault(); dispatch(toggleSaved(listing.id)) }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            title={isSaved ? 'Remove from watchlist' : 'Save to watchlist'}
          >
            <Heart className={clsx('w-4 h-4', isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500')} />
          </button>
          {/* WhatsApp share */}
          <button
            onClick={shareOnWhatsApp}
            className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow hover:bg-green-600 transition-colors"
            title="Share on WhatsApp"
          >
            <span className="text-white"><WhatsAppIcon /></span>
          </button>
        </div>

        {/* Photos count */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            +{listing.photos.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <Link to={`/listings/${listing.id}`} className="flex flex-col flex-1 p-4">
        {/* Price — prominent */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight">
            {listing.product}
          </h3>
          <div className="text-right flex-shrink-0">
            <div className="text-primary-700 font-extrabold text-lg leading-tight">
              {formatZMW(listing.priceZmw)}
            </div>
            <div className="text-gray-400 text-xs">/{listing.unit}</div>
          </div>
        </div>

        {/* Quantity + category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">{listing.categoryEmoji}</span>
          <span className="text-xs text-gray-500">{listing.quantity} {listing.unit} · {listing.category}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mb-3 text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-400" />
          <span className="text-xs truncate font-medium">{listing.district?.name}, {listing.province?.name}</span>
        </div>

        {/* Seller + stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{listing.user.name[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-gray-700">{listing.user.name.split(' ')[0]}</span>
                {listing.user.isVerified && <CheckCircle className="w-3.5 h-3.5 text-primary-500" />}
              </div>
              {listing.user.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-500">{listing.user.rating}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-gray-400">
            <div className="flex items-center gap-0.5">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-xs">{listing.viewsCount}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs">{listing.offersCount}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{timeAgo(listing.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
