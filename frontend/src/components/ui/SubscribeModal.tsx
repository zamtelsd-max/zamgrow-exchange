import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { closeSubscribeModal } from '../../store/slices/uiSlice'
import { X, Crown, CheckCircle, ArrowRight } from 'lucide-react'

export default function SubscribeModal() {
  const dispatch = useDispatch()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => dispatch(closeSubscribeModal())} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <button onClick={() => dispatch(closeSubscribeModal())} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white text-center">
          <Crown className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-1">Upgrade Your Account</h2>
          <p className="text-amber-100 text-sm">You've used all your free credits</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm text-center mb-5">
            Subscribe to continue posting listings, making offers, and accessing full market intelligence.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { plan: 'Monthly', price: 'K20', period: '/month', features: ['Unlimited listings', 'Unlimited offers', '5 price alerts', 'Full market data'] },
              { plan: 'Annual', price: 'K300', period: '/year', features: ['Everything in Monthly', 'Unlimited alerts', 'Data exports', 'Save K60/year'], highlight: true },
            ].map(p => (
              <div key={p.plan} className={`rounded-xl border-2 p-4 ${p.highlight ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                <div className={`text-xs font-bold mb-2 ${p.highlight ? 'text-amber-600' : 'text-primary-600'}`}>{p.plan.toUpperCase()}</div>
                <div className="flex items-end gap-0.5 mb-3">
                  <span className="text-2xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-gray-400 text-xs pb-1">{p.period}</span>
                </div>
                <ul className="space-y-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            to="/subscribe"
            onClick={() => dispatch(closeSubscribeModal())}
            className="btn-primary w-full py-3.5 text-base"
          >
            Choose a Plan
            <ArrowRight className="w-5 h-5" />
          </Link>

          <button onClick={() => dispatch(closeSubscribeModal())} className="text-sm text-gray-400 hover:text-gray-600 w-full text-center mt-3">
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
