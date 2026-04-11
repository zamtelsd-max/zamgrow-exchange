import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { toggleSaved } from '../../store/slices/listingsSlice'
import { Listing } from '../../types'
import { MapPin, Heart, Star, Eye, MessageSquare, CheckCircle, Clock } from 'lucide-react'
import { formatZMW, timeAgo } from '../../services/mockData'
import clsx from 'clsx'

interface Props {
  listing: Listing
}

export default function ListingCard({ listing }: Props) {
  const dispatch = useDispatch()
  const { savedListings } = useSelector((s: RootState) => s.listings)
  const isSaved = savedListings.includes(listing.id)

  const mainPhoto = listing.photos[0]?.url

  return (
    <div className="card-hover group overflow-hidden">
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={listing.product}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">{listing.categoryEmoji}</span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={listing.type === 'SELL' ? 'badge-sell' : 'badge-buy'}>
            {listing.type === 'SELL' ? '📦 For Sale' : '🛒 Wanted'}
          </span>
        </div>

        {/* Save Button */}
        <button
          onClick={(e) => { e.preventDefault(); dispatch(toggleSaved(listing.id)) }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            className={clsx('w-4 h-4 transition-colors', isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500')}
          />
        </button>

        {/* Photos count */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            +{listing.photos.length - 1} photos
          </div>
        )}
      </div>

      {/* Content */}
      <Link to={`/listings/${listing.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">
            {listing.product}
            <span className="text-gray-400 font-normal text-sm"> — {listing.quantity} {listing.unit}</span>
          </h3>
          <div className="text-right flex-shrink-0">
            <div className="text-primary-700 font-bold text-base leading-tight">
              {formatZMW(listing.priceZmw)}
            </div>
            <div className="text-gray-400 text-xs">per {listing.unit}</div>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm">{listing.categoryEmoji}</span>
          <span className="text-xs text-gray-500">{listing.category}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mb-3 text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs truncate">{listing.district.name}, {listing.province.name}</span>
        </div>

        {/* Seller */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-emerald-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{listing.user.name[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{listing.user.name.split(' ')[0]}</span>
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

          <div className="flex items-center gap-3 text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-xs">{listing.viewsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs">{listing.offersCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{timeAgo(listing.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
