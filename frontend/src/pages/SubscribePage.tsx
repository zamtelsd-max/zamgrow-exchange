import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { closeSubscribeModal } from '../store/slices/uiSlice'
import { updateUser } from '../store/slices/authSlice'
import { CheckCircle, Crown, Zap, X, Smartphone, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    period: 'forever',
    badge: null,
    features: [
      'Browse all listings',
      'View basic price averages',
      'Receive inbound messages',
      '10 free credits on signup',
      'No price alerts',
    ],
    unavailable: ['Post listings', 'Make offers', 'Set price alerts'],
    buttonLabel: 'Current Plan',
    color: 'gray',
  },
  {
    id: 'MONTHLY',
    name: 'Monthly',
    price: 20,
    period: 'per month',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Unlimited listings',
      'Unlimited offers & enquiries',
      'Full price heatmaps & trends',
      'Up to 5 price alerts',
      'Priority listing placement',
    ],
    unavailable: [],
    buttonLabel: 'Subscribe Monthly',
    color: 'primary',
  },
  {
    id: 'ANNUAL',
    name: 'Annual',
    price: 300,
    period: 'per year',
    badge: 'Save K60/year',
    features: [
      'Everything in Monthly',
      'Unlimited price alerts',
      'Data export (CSV/Excel)',
      'Priority support',
      'Advanced analytics',
      'First access to new features',
    ],
    unavailable: [],
    buttonLabel: 'Subscribe Annually',
    color: 'amber',
  },
]

const PAYMENT_METHODS = [
  { id: 'AIRTEL', name: 'Airtel Money', ussd: '*778#', color: 'bg-red-600', emoji: '📱', share: '48%' },
  { id: 'MTN', name: 'MTN MoMo', ussd: '*303#', color: 'bg-yellow-500', emoji: '📱', share: '35%' },
  { id: 'ZAMTEL', name: 'Zamtel Money', ussd: '*115#', color: 'bg-blue-600', emoji: '📱', share: '17%' },
  { id: 'CARD', name: 'Visa / Mastercard', ussd: null, color: 'bg-gray-700', emoji: '💳', share: null },
]

export default function SubscribePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((s: RootState) => s.auth)
  const [selectedPlan, setSelectedPlan] = useState('MONTHLY')
  const [selectedMethod, setSelectedMethod] = useState('AIRTEL')
  const [step, setStep] = useState<'plan' | 'payment' | 'processing' | 'success'>('plan')
  const [phone, setPhone] = useState(user?.phone || '')

  const plan = PLANS.find(p => p.id === selectedPlan)!

  const handlePayment = async () => {
    if (!phone) { toast.error('Enter your mobile money number'); return }
    setStep('processing')
    await new Promise(r => setTimeout(r, 2500))
    setStep('success')
    dispatch(updateUser({
      subscription: {
        id: `sub-${Date.now()}`,
        userId: user!.id,
        plan: selectedPlan as 'MONTHLY' | 'ANNUAL',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (selectedPlan === 'ANNUAL' ? 365 : 30) * 86400000).toISOString(),
        status: 'ACTIVE',
      }
    }))
    toast.success('Subscription activated! Welcome to Zamgrow Premium 🎉')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-amber-700 text-sm font-medium mb-4">
          <Crown className="w-4 h-4" />
          Zamgrow Premium
        </div>
        <h1 className="page-title mb-3">Simple, Affordable Pricing</h1>
        <p className="text-gray-500 text-lg">Start with 10 free credits. Upgrade when you're ready.</p>
      </div>

      {step === 'success' ? (
        <div className="max-w-md mx-auto card p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">
            Your {plan.name} plan is now active. You can now post unlimited listings and make unlimited offers.
          </p>
          <div className="p-4 bg-primary-50 rounded-xl mb-6 text-sm text-primary-700">
            <Zap className="w-5 h-5 mx-auto mb-2" />
            <p>Receipt sent to {phone} via SMS</p>
          </div>
          <button onClick={() => window.location.href = '/dashboard'} className="btn-primary w-full py-3.5">
            Go to Dashboard
          </button>
        </div>
      ) : step === 'processing' ? (
        <div className="max-w-md mx-auto card p-10 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Smartphone className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Processing Payment...</h2>
          <p className="text-gray-500 mb-4">
            A USSD prompt has been sent to <strong>{phone}</strong>. Please enter your PIN to confirm the payment.
          </p>
          <div className="p-4 bg-amber-50 rounded-xl text-sm text-amber-700">
            "Enter PIN to pay <strong>K{plan.price}</strong> to Zamgrow Exchange"
          </div>
        </div>
      ) : step === 'payment' ? (
        <div className="max-w-md mx-auto card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
            <button onClick={() => setStep('plan')} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-primary-50 rounded-xl mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{plan.name} Plan</span>
              <span className="font-bold text-primary-700">K {plan.price}/{plan.period.split(' ')[1]}</span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>
          <div className="space-y-2 mb-5">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={clsx(
                  'w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all text-left',
                  selectedMethod === m.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={`w-9 h-9 ${m.color} rounded-lg flex items-center justify-center text-lg`}>
                  {m.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                  {m.ussd && <p className="text-xs text-gray-500">{m.ussd}</p>}
                </div>
                {m.share && <span className="text-xs text-gray-400">{m.share} users</span>}
                {selectedMethod === m.id && <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />}
              </button>
            ))}
          </div>

          {selectedMethod !== 'CARD' ? (
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mobile Money Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+260 97X XXX XXX"
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">A USSD push will be sent to this number</p>
            </div>
          ) : (
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Card Number</label>
              <input type="text" placeholder="4111 1111 1111 1111" className="input-field" />
            </div>
          )}

          <button onClick={handlePayment} className="btn-primary w-full py-3.5 text-base">
            <Smartphone className="w-5 h-5" />
            Pay K{plan.price} via {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
          </button>
        </div>
      ) : (
        // Plan Selection
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={clsx(
                'card p-6 cursor-pointer transition-all relative',
                selectedPlan === p.id ? 'ring-2 ring-primary-500 border-primary-300' : 'hover:shadow-lg',
                p.color === 'amber' && 'bg-gradient-to-br from-amber-50 to-orange-50'
              )}
            >
              {p.badge && (
                <div className={clsx(
                  'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full text-white',
                  p.color === 'primary' ? 'bg-primary-600' : 'bg-amber-500'
                )}>
                  {p.badge}
                </div>
              )}

              <div className="mb-5">
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                  p.color === 'primary' ? 'bg-primary-100' : p.color === 'amber' ? 'bg-amber-100' : 'bg-gray-100'
                )}>
                  {p.price === 0 ? <Zap className="w-5 h-5 text-gray-500" /> : <Crown className={clsx('w-5 h-5', p.color === 'primary' ? 'text-primary-600' : 'text-amber-600')} />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                <div className="flex items-end gap-1 mt-1">
                  {p.price === 0 ? (
                    <span className="text-3xl font-bold text-gray-900">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900">K{p.price}</span>
                      <span className="text-gray-400 pb-1 text-sm">/{p.period.split(' ')[1]}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {p.unavailable.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                    <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {p.id === 'FREE' ? (
                <button className="btn-secondary w-full" disabled>Current Free Plan</button>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); setSelectedPlan(p.id); setStep('payment') }}
                  className={clsx('w-full py-3', p.color === 'primary' ? 'btn-primary' : 'btn-amber')}
                >
                  {p.buttonLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Methods Display */}
      {step === 'plan' && (
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Accepted payment methods</p>
          <div className="flex items-center justify-center gap-4">
            {PAYMENT_METHODS.map(m => (
              <div key={m.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{m.emoji}</span>
                <span>{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
