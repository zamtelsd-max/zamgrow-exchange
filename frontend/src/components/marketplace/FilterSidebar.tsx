import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { setFilters } from '../../store/slices/listingsSlice'
import { PROVINCES, CATEGORIES } from '../../services/mockData'
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react'
import clsx from 'clsx'

export default function FilterSidebar() {
  const dispatch = useDispatch()
  const filters = useSelector((s: RootState) => s.listings.filters)
  const [openSections, setOpenSections] = useState({ type: true, category: true, location: true, price: true })

  const toggle = (key: keyof typeof openSections) => setOpenSections(s => ({ ...s, [key]: !s[key] }))

  const selectedProvince = PROVINCES.find(p => p.name === filters.province)

  const hasFilters = filters.type || filters.category || filters.province || filters.priceMin || filters.priceMax

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-20">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <SlidersHorizontal className="w-4 h-4 text-primary-600" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={() => dispatch(setFilters({ type: undefined, category: undefined, province: undefined, district: undefined, priceMin: undefined, priceMax: undefined }))}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Listing Type */}
      <div className="px-5 py-4 border-b border-gray-100">
        <button
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
          onClick={() => toggle('type')}
        >
          Listing Type {openSections.type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.type && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: undefined, label: 'All' },
              { value: 'SELL', label: '📦 Sell' },
              { value: 'BUY', label: '🛒 Buy' },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => dispatch(setFilters({ type: opt.value as 'BUY' | 'SELL' | undefined }))}
                className={clsx(
                  'py-2 rounded-lg text-xs font-medium transition-colors border',
                  filters.type === opt.value
                    ? 'bg-primary-50 text-primary-700 border-primary-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="px-5 py-4 border-b border-gray-100">
        <button
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
          onClick={() => toggle('category')}
        >
          Category {openSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.category && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <button
              onClick={() => dispatch(setFilters({ category: undefined }))}
              className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', !filters.category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => dispatch(setFilters({ category: cat.name }))}
                className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors', filters.category === cat.name ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Province */}
      <div className="px-5 py-4 border-b border-gray-100">
        <button
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
          onClick={() => toggle('location')}
        >
          Province {openSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.location && (
          <div className="space-y-1">
            <select
              value={filters.province || ''}
              onChange={e => dispatch(setFilters({ province: e.target.value || undefined, district: undefined }))}
              className="select-field text-sm py-2"
            >
              <option value="">All Provinces</option>
              {PROVINCES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            {selectedProvince && (
              <select
                value={filters.district || ''}
                onChange={e => dispatch(setFilters({ district: e.target.value || undefined }))}
                className="select-field text-sm py-2 mt-2"
              >
                <option value="">All Districts</option>
                {selectedProvince.districts.map((d: any) => <option key={d.id || d} value={d.name || d}>{d.name || d}</option>)}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="px-5 py-4">
        <button
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
          onClick={() => toggle('price')}
        >
          Price Range (ZMW) {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.price && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Min (K)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.priceMin || ''}
                onChange={e => dispatch(setFilters({ priceMin: e.target.value ? Number(e.target.value) : undefined }))}
                className="input-field text-sm py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Max (K)</label>
              <input
                type="number"
                placeholder="Any"
                value={filters.priceMax || ''}
                onChange={e => dispatch(setFilters({ priceMax: e.target.value ? Number(e.target.value) : undefined }))}
                className="input-field text-sm py-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
