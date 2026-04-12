import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  Smartphone, CreditCard, Building2, CheckCircle, Loader2,
  ArrowLeft, Shield, Lock, ChevronRight, AlertCircle, Phone
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

type PaymentMethod = 'airtel' | 'mtn' | 'zamtel' | 'card' | 'bank'
type PaymentStep = 'select' | 'details' | 'otp' | 'success'

const MOBILE_MONEY = [
  {
    id: 'airtel' as PaymentMethod,
    name: 'Airtel Money',
    ussd: '*778#',
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    borderColor: 'border-red-500',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    logo: '📱',
    logoText: 'A',
    logoColor: 'bg-red-600',
    description: 'Pay with Airtel Money wallet',
    fee: 'Free',
    time: 'Instant',
  },
  {
    id: 'mtn' as PaymentMethod,
    name: 'MTN MoMo',
    ussd: '*303#',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    borderColor: 'border-yellow-500',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    logo: '📱',
    logoText: 'M',
    logoColor: 'bg-yellow-500',
    description: 'Pay with MTN Mobile Money',
    fee: '1.5%',
    time: 'Instant',
  },
  {
    id: 'zamtel' as PaymentMethod,
    name: 'Zamtel Kwacha',
    ussd: '*115#',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    borderColor: 'border-blue-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    logo: '📱',
    logoText: 'Z',
    logoColor: 'bg-blue-600',
    description: 'Pay with Zamtel mobile wallet',
    fee: '1%',
    time: 'Instant',
  },
]

const OTHER_METHODS = [
  {
    id: 'card' as PaymentMethod,
    name: 'Visa / Mastercard',
    description: 'Pay with debit or credit card',
    icon: CreditCard,
    fee: '2.5%',
    time: '1–3 mins',
    available: true,
  },
  {
    id: 'bank' as PaymentMethod,
    name: 'Bank Transfer (EFT)',
    description: 'Direct bank transfer or ZECHL',
    icon: Building2,
    fee: 'Free',
    time: '1–24 hrs',
    available: true,
  },
]

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)

  // Get payment context from navigation state
  const paymentContext = (location.state as any) || {}
  const amount = paymentContext.amount || 500
  const purpose = paymentContext.purpose || 'Listing Credit Top-up'
  const credits = paymentContext.credits || 50

  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [step, setStep] = useState<PaymentStep>('select')
  const [phone, setPhone] = useState(user?.phone || '')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [txRef] = useState('ZGX-' + Date.now().toString(36).toUpperCase())

  const selectedMobile = MOBILE_MONEY.find(m => m.id === method)
  const selectedOther = OTHER_METHODS.find(m => m.id === method)

  const handleInitiatePayment = async () => {
    if (!method) { toast.error('Please select a payment method'); return }
    if ((method === 'airtel' || method === 'mtn' || method === 'zamtel') && (!phone || phone.length < 10)) {
      toast.error('Enter a valid Zambian phone number')
      return
    }
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsLoading(false)
    if (method === 'card') {
      setStep('details')
    } else if (method === 'bank') {
      setStep('details')
    } else {
      setStep('otp')
      toast.success(`OTP sent to ${phone} via ${selectedMobile?.name}`)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { toast.error('Enter the OTP sent to your phone'); return }
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsLoading(false)
    setStep('success')
  }

  const handleCardPay = async () => {
    if (cardNumber.replace(/\s/g,'').length < 16) { toast.error('Enter valid card number'); return }
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 2500))
    setIsLoading(false)
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">
            Your payment of <span className="font-bold text-gray-900">K{amount.toLocaleString()}</span> has been received.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction Ref</span>
              <span className="font-mono font-bold text-gray-800">{txRef}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-green-700">K{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Credits Added</span>
              <span className="font-bold text-primary-700">+{credits} credits 🎉</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-semibold">{selectedMobile?.name || selectedOther?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Confirmed</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn-primary"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="flex-1 btn-secondary"
            >
              Browse Listings
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Order Summary */}
          <div className="gradient-hero text-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-green-300" />
              <span className="text-green-200 text-xs font-medium">Secure Payment</span>
            </div>
            <h1 className="text-xl font-bold mb-4">Complete Payment</h1>
            <div className="bg-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-100">Purpose</span>
                <span className="font-semibold">{purpose}</span>
              </div>
              {credits > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-100">Credits</span>
                  <span className="font-semibold text-yellow-300">+{credits} credits</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
                <span className="font-bold text-lg">Total</span>
                <span className="font-black text-2xl text-yellow-300">K{amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-6">

            {/* STEP: Select Method */}
            {step === 'select' && (
              <>
                <h2 className="font-bold text-gray-900 mb-4">Choose Payment Method</h2>

                {/* Mobile Money */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📱 Mobile Money</p>
                <div className="space-y-3 mb-5">
                  {MOBILE_MONEY.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={clsx(
                        'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                        method === m.id
                          ? `${m.borderColor} ${m.bgLight}`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0', m.logoColor)}>
                        {m.logoText}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.description} · USSD: {m.ussd}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={clsx('text-xs font-bold', method === m.id ? m.textColor : 'text-gray-400')}>
                          Fee: {m.fee}
                        </div>
                        <div className="text-xs text-gray-400">{m.time}</div>
                      </div>
                      {method === m.id && <CheckCircle className={clsx('w-5 h-5 flex-shrink-0', m.textColor)} />}
                    </button>
                  ))}
                </div>

                {/* Other Methods */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">💳 Other Methods</p>
                <div className="space-y-3 mb-6">
                  {OTHER_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={clsx(
                        'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                        method === m.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <m.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.description}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={clsx('text-xs font-bold', method === m.id ? 'text-primary-700' : 'text-gray-400')}>
                          Fee: {m.fee}
                        </div>
                        <div className="text-xs text-gray-400">{m.time}</div>
                      </div>
                      {method === m.id && <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Phone input for mobile money */}
                {(method === 'airtel' || method === 'mtn' || method === 'zamtel') && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {selectedMobile?.name} Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 text-sm">+260</span>
                      </div>
                      <input
                        type="tel"
                        value={phone.replace('+260', '').replace('260', '')}
                        onChange={e => setPhone('+260' + e.target.value.replace(/\D/g, ''))}
                        placeholder="97 123 4567"
                        className="input pl-20 w-full"
                        maxLength={9}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">You'll receive an OTP to confirm this payment</p>
                  </div>
                )}

                <button
                  onClick={handleInitiatePayment}
                  disabled={!method || isLoading}
                  className="w-full btn-primary py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isLoading ? 'Processing...' : `Pay K${amount.toLocaleString()}`}
                  {!isLoading && <ChevronRight className="w-5 h-5" />}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-bit SSL encrypted · PCI DSS compliant</span>
                </div>
              </>
            )}

            {/* STEP: Card Details */}
            {step === 'details' && method === 'card' && (
              <>
                <button onClick={() => setStep('select')} className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-bold text-gray-900 mb-4">Card Details</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g,'').slice(0,16)
                        setCardNumber(v.replace(/(.{4})/g,'$1 ').trim())
                      }}
                      placeholder="0000 0000 0000 0000"
                      className="input w-full font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g,'').slice(0,4)
                          if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2)
                          setCardExpiry(v)
                        }}
                        placeholder="MM/YY"
                        className="input w-full font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))}
                        placeholder="•••"
                        className="input w-full font-mono"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCardPay}
                  disabled={isLoading}
                  className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {isLoading ? 'Processing...' : `Pay K${amount.toLocaleString()} Securely`}
                </button>
              </>
            )}

            {/* STEP: Bank Transfer */}
            {step === 'details' && method === 'bank' && (
              <>
                <button onClick={() => setStep('select')} className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-bold text-gray-900 mb-4">Bank Transfer Details</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 mb-6">
                  {[
                    ['Bank', 'Zambia National Commercial Bank'],
                    ['Account Name', 'Zamgrow Exchange Ltd'],
                    ['Account Number', '1234567890'],
                    ['Branch', 'Cairo Road, Lusaka'],
                    ['Swift Code', 'ZNCOZMLU'],
                    ['Reference', txRef],
                    ['Amount', `K${amount.toLocaleString()}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-bold text-gray-900 text-right max-w-48">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Use the reference number <strong>{txRef}</strong> exactly as shown. Credits are added within 1–24 hours after payment is confirmed.</p>
                </div>
                <button onClick={() => { toast.success('Payment details sent to your phone!'); setStep('success') }} className="w-full btn-primary py-4">
                  I've Made the Transfer
                </button>
              </>
            )}

            {/* STEP: OTP Verification */}
            {step === 'otp' && (
              <>
                <div className="text-center mb-6">
                  <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4', selectedMobile?.logoColor)}>
                    {selectedMobile?.logoText}
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-1">Confirm with OTP</h2>
                  <p className="text-sm text-gray-500">
                    Enter the OTP sent to <strong>{phone}</strong> via {selectedMobile?.name}
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">One-Time Password</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="Enter OTP"
                    className="input w-full text-center text-2xl font-mono tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-center text-gray-400 mt-2">Demo: enter any 4+ digits</p>
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length < 4}
                  className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isLoading ? 'Verifying...' : 'Confirm Payment'}
                </button>
                <button onClick={() => setStep('select')} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 py-2">
                  ← Use a different method
                </button>
              </>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          {['🔒 SSL Secured', '🏦 Bank-grade', '📱 Mobile Money', '✅ Instant'].map(b => (
            <span key={b} className="text-xs text-gray-400 font-medium">{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
