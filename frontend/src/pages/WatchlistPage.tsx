import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../store'
import ListingCard from '../components/marketplace/ListingCard'
import { Heart, ArrowRight } from 'lucide-react'

export default function WatchlistPage() {
  const { listings, savedListings } = useSelector((s: RootState) => s.listings)
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)

  const saved = listings.filter(l => savedListings.includes(l.id))

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign In to View Watchlist</h2>
        <p className="text-gray-500">Save listings you're interested in and track them here.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title mb-1">My Watchlist</h1>
          <p className="text-gray-500">{saved.length} saved listing{saved.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/browse" className="btn-secondary">
          Browse More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved listings</h3>
          <p className="text-gray-500 mb-6">Click the heart icon on any listing to save it here</p>
          <Link to="/browse" className="btn-primary">Browse Listings</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {saved.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  )
}
