import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { addListing } from '../store/slices/listingsSlice'
import { openAuthModal } from '../store/slices/uiSlice'
import { CATEGORIES, UNITS, PROVINCES, MOCK_PRICE_DATA, formatZMW } from '../services/mockData'
import PriceSuggestionWidget from '../components/marketplace/PriceSuggestionWidget'
import { Listing, PriceData } from '../types'
import { Upload, X, Sparkles, Package, ShoppingCart, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function CreateListingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)

  const [type, setType] = useState<'SELL' | 'BUY'>('SELL')
  const [form, setForm] = useState({
    product: '', category: '', unit: '50kg Bag', quantity: '',
    price: '', province: '', district: '', description: '',
    dateAvailable: '', deadline: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPrice, setAiPrice] = useState<PriceData | null>(null)

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to post a listing.</p>
        <button onClick={() => dispatch(openAuthModal('login'))} className="btn-primary">Sign In</button>
      </div>
    )
  }

  const selectedProvince = PROVINCES.find(p => p.name === form.province)

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    // Fetch AI price suggestion when product + province are set
    if ((field === 'product' || field === 'province') && form.product && form.province) {
      const productKey = (field === 'product' ? value : form.product).toLowerCase()
      const provinceName = field === 'province' ? value : form.province
      const match = MOCK_PRICE_DATA.find(p =>
        p.product.toLowerCase().includes(productKey) &&
        p.province === provinceName
      ) || MOCK_PRICE_DATA.find(p => p.product.toLowerCase().includes(productKey))
      setAiPrice(match || null)
    }
  }

  const handlePhotoAdd = () => {
    // Mock adding photos with Unsplash images
    const mockPhotos = [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
      'https://images.unsplash.com/photo-1508504509543-5a56bc7fdc5a?w=400',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    ]
    if (photos.length < 5) {
      setPhotos(p => [...p, mockPhotos[p.length % mockPhotos.length]])
      toast.success('Photo added (mock)')
    }
  }

  const handleSubmit = async () => {
    if (!form.product || !form.province || !form.price || !form.quantity) {
      toast.error('Please fill all required fields')
      return
    }
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))

    const cat = CATEGORIES.find(c => c.name === form.category)
    const prov = PROVINCES.find(p => p.name === form.province)!
    const dist = prov?.districts.find(d => d.name === form.district) || prov?.districts[0]

    const newListing: Listing = {
      id: `l-${Date.now()}`,
      userId: user!.id,
      user: user!,
      type,
      product: form.product,
      category: form.category || 'Cereals',
      categoryEmoji: cat?.emoji || '🌾',
      quantity: Number(form.quantity),
      unit: form.unit,
      priceZmw: Number(form.price),
      province: prov,
      district: dist,
      description: form.description,
      status: 'ACTIVE',
      photos: photos.map((url, i) => ({ id: `p-${i}`, listingId: 'new', url, sortOrder: i })),
      dateAvailable: form.dateAvailable || undefined,
      deadline: form.deadline || undefined,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
      createdAt: new Date().toISOString(),
      offersCount: 0,
      viewsCount: 0,
    }

    dispatch(addListing(newListing))
    toast.success('Listing posted successfully! 🎉')
    navigate(`/listings/${newListing.id}`)
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="page-title mb-2">Post a Listing</h1>
        <p className="text-gray-500">Reach buyers across all 10 Zambian provinces</p>
      </div>

      {/* Listing Type Toggle */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { t: 'SELL', icon: Package, label: 'I\'m Selling', desc: 'List crops, livestock, or produce for sale', color: 'primary' },
          { t: 'BUY', icon: ShoppingCart, label: 'I\'m Buying', desc: 'Post a procurement request for suppliers', color: 'amber' },
        ].map(({ t, icon: Icon, label, desc, color }) => (
          <button
            key={t}
            onClick={() => setType(t as 'SELL' | 'BUY')}
            className={clsx(
              'p-5 rounded-2xl border-2 text-left transition-all',
              type === t
                ? color === 'primary'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-amber-500 bg-amber-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <Icon className={clsx('w-7 h-7 mb-3', type === t ? (color === 'primary' ? 'text-primary-600' : 'text-amber-600') : 'text-gray-400')} />
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Product Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category *</label>
                  <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="select-field">
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product / Crop *</label>
                  <input
                    type="text"
                    value={form.product}
                    onChange={e => handleChange('product', e.target.value)}
                    placeholder="e.g., Maize, Soya Beans"
                    className="input-field"
                    list="product-suggestions"
                  />
                  <datalist id="product-suggestions">
                    {CATEGORIES.flatMap(c => c.items).map(item => <option key={item} value={item} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Quantity *</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={e => handleChange('quantity', e.target.value)}
                    placeholder="500"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Unit *</label>
                  <select value={form.unit} onChange={e => handleChange('unit', e.target.value)} className="select-field">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {type === 'SELL' ? 'Asking Price' : 'Max Offer Price'} (ZMW per unit) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">K</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => handleChange('price', e.target.value)}
                    placeholder="310"
                    className="input-field pl-8"
                  />
                </div>
                {aiPrice && (
                  <p className="text-xs text-primary-600 mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI suggests: {formatZMW(aiPrice.suggestedPrice!)} — Market avg: {formatZMW(aiPrice.avgPrice)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Describe your product: quality, grade, storage, access road, minimum order..."
                  rows={4}
                  className="input-field resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
              </div>
            </div>
          </div>

          {/* Location & Dates */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Location & Availability
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Province *</label>
                  <select
                    value={form.province}
                    onChange={e => { handleChange('province', e.target.value); handleChange('district', '') }}
                    className="select-field"
                  >
                    <option value="">Select Province</option>
                    {PROVINCES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">District</label>
                  <select
                    value={form.district}
                    onChange={e => handleChange('district', e.target.value)}
                    className="select-field"
                    disabled={!selectedProvince}
                  >
                    <option value="">{selectedProvince ? 'Select District' : 'Select Province first'}</option>
                    {selectedProvince?.districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    {type === 'SELL' ? 'Date Available' : 'Required By (Deadline)'}
                  </label>
                  <input
                    type="date"
                    value={type === 'SELL' ? form.dateAvailable : form.deadline}
                    onChange={e => handleChange(type === 'SELL' ? 'dateAvailable' : 'deadline', e.target.value)}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Photos <span className="text-gray-400 font-normal text-sm">(up to 5)</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">Listings with photos get 3× more enquiries</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  onClick={handlePhotoAdd}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex-1 py-3.5 text-base"
            >
              {isSubmitting ? 'Posting...' : `Post ${type === 'SELL' ? 'Listing' : 'Buy Request'} 🚀`}
            </button>
          </div>
        </div>

        {/* AI Price Widget */}
        <div className="space-y-4">
          <PriceSuggestionWidget priceData={aiPrice} />
          <div className="card p-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Listing Tips</p>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li>• Add 3-5 clear photos</li>
                  <li>• Mention grade/quality</li>
                  <li>• Include moisture content</li>
                  <li>• State minimum order</li>
                  <li>• Mention transport access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
