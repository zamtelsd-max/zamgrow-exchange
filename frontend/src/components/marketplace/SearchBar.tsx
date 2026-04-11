import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setFilters } from '../../store/slices/listingsSlice'
import { Search, MapPin, X } from 'lucide-react'

const SUGGESTIONS = ['Maize', 'Soya Beans', 'Groundnuts', 'Tomatoes', 'Kapenta', 'Cattle', 'Honey', 'Cassava']

interface Props {
  large?: boolean
  placeholder?: string
}

export default function SearchBar({ large = false, placeholder = 'Search crops, livestock, fish...' }: Props) {
  const dispatch = useDispatch()
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()) && query.length > 0)

  const handleSearch = (q: string) => {
    dispatch(setFilters({ query: q }))
    setQuery(q)
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full">
      <div className={`flex items-center gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all ${large ? 'px-5 py-4' : 'px-4 py-3'}`}>
        <Search className={`text-gray-400 flex-shrink-0 ${large ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={`flex-1 outline-none text-gray-900 placeholder-gray-400 bg-transparent ${large ? 'text-base' : 'text-sm'}`}
        />
        {query && (
          <button onClick={() => { setQuery(''); handleSearch('') }} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-1 text-gray-400">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">All Provinces</span>
        </div>
        {large && (
          <button
            onClick={() => handleSearch(query)}
            className="btn-primary text-sm py-2 px-5"
          >
            Search
          </button>
        )}
      </div>

      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-30">
          {filtered.map(s => (
            <button
              key={s}
              onMouseDown={() => handleSearch(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
