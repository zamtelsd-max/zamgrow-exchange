import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setFilters } from '../store/slices/listingsSlice'
import ListingCard from '../components/marketplace/ListingCard'
import FilterSidebar from '../components/marketplace/FilterSidebar'
import SearchBar from '../components/marketplace/SearchBar'
import { LayoutGrid, List, SlidersHorizontal, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'relevance', label: 'Most Relevant' },
]

export default function BrowsePage() {
  const dispatch = useDispatch()
  const { listings, filters } = useSelector((s: RootState) => s.listings)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = [...listings]

    if (filters.query) {
      const q = filters.query.toLowerCase()
      result = result.filter(l =>
        l.product.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
      )
    }
    if (filters.type) result = result.filter(l => l.type === filters.type)
    if (filters.category) result = result.filter(l => l.category === filters.category)
    if (filters.province) result = result.filter(l => l.province.name === filters.province)
    if (filters.district) result = result.filter(l => l.district.name === filters.district)
    if (filters.priceMin) result = result.filter(l => l.priceZmw >= filters.priceMin!)
    if (filters.priceMax) result = result.filter(l => l.priceZmw <= filters.priceMax!)

    // Sort
    switch (filters.sortBy) {
      case 'price_asc': result.sort((a, b) => a.priceZmw - b.priceZmw); break
      case 'price_desc': result.sort((a, b) => b.priceZmw - a.priceZmw); break
      case 'date_asc': result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [listings, filters])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title mb-2">Browse Listings</h1>
        <p className="text-gray-500">Discover fresh produce, crops and livestock from across Zambia</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">
                {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
              </span>
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn-secondary text-sm py-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sortBy || 'date_desc'}
                  onChange={e => dispatch(setFilters({ sortBy: e.target.value as typeof filters.sortBy }))}
                  className="select-field text-sm py-2 pr-8 pl-3 w-44"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                {[
                  { mode: 'grid', icon: LayoutGrid },
                  { mode: 'list', icon: List },
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'grid' | 'list')}
                    className={clsx(
                      'p-2 transition-colors',
                      viewMode === mode ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mb-6">
              <FilterSidebar />
            </div>
          )}

          {/* Listings Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
              <button
                onClick={() => dispatch(setFilters({ query: undefined, type: undefined, category: undefined, province: undefined }))}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={clsx(
              'gap-5',
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col'
            )}>
              {filtered.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Load More */}
          {filtered.length > 0 && (
            <div className="mt-8 text-center">
              <button className="btn-secondary px-8">
                Load More Listings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
