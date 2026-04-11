import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { closeAuthModal, setAuthTab } from '../../store/slices/uiSlice'
import { loginStart, loginSuccess, loginFailure, demoLogin } from '../../store/slices/authSlice'
import { PROVINCES } from '../../services/mockData'
import { X, Phone, Lock, User, MapPin, ChevronRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthModal() {
  const dispatch = useDispatch()
  const { authModalTab } = useSelector((s: RootState) => s.ui)
  const { isLoading } = useSelector((s: RootState) => s.auth)

  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [form, setForm] = useState({ name: '', phone: '', role: 'SELLER', province: '', otp: '' })
  const [otpSent, setOtpSent] = useState(false)

  const handleSendOtp = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error('Enter a valid Zambian phone number')
      return
    }
    dispatch(loginStart())
    await new Promise(r => setTimeout(r, 1000))
    setOtpSent(true)
    setStep('otp')
    dispatch(loginFailure(''))
    toast.success('OTP sent to ' + form.phone + ' (demo: use 123456)')
  }

  const handleVerifyOtp = async () => {
    if (form.otp !== '123456' && form.otp !== '') {
      toast.error('Incorrect OTP. Demo: use 123456')
      return
    }
    dispatch(loginStart())
    await new Promise(r => setTimeout(r, 1000))
    dispatch(loginSuccess({
      user: {
        id: 'demo-user',
        name: form.name || 'John Nkhoma',
        phone: form.phone,
        role: form.role as 'BUYER' | 'SELLER' | 'BOTH',
        creditsBalance: 10,
        isVerified: false,
        createdAt: new Date().toISOString(),
      },
      token: 'demo-token'
    }))
    dispatch(closeAuthModal())
    toast.success(authModalTab === 'register' ? 'Account created! 10 free credits added 🎉' : 'Welcome back!')
  }

  const handleDemoLogin = () => {
    dispatch(demoLogin())
    dispatch(closeAuthModal())
    toast.success('Logged in as demo user')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => dispatch(closeAuthModal())} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="gradient-hero text-white p-6">
          <button onClick={() => dispatch(closeAuthModal())} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <span className="font-bold text-white">Zamgrow Exchange</span>
          </div>
          <h2 className="text-xl font-bold">{authModalTab === 'register' ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-green-200 text-sm mt-1">{authModalTab === 'register' ? 'Join 14,800+ traders' : 'Sign in to continue trading'}</p>

          {/* Tabs */}
          <div className="flex mt-4 bg-white/10 rounded-xl p-1">
            {['login', 'register'].map(tab => (
              <button
                key={tab}
                onClick={() => { dispatch(setAuthTab(tab as 'login' | 'register')); setStep('form') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${authModalTab === tab ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'}`}
              >
                {tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {step === 'form' ? (
            <>
              {authModalTab === 'register' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Joseph Mwale"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">🇿🇲</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+260 97X XXX XXX"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {authModalTab === 'register' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">I am a...</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['SELLER', 'BUYER', 'BOTH'].map(role => (
                        <button
                          key={role}
                          onClick={() => setForm(f => ({ ...f, role }))}
                          className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.role === role ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                          {role === 'SELLER' ? '🌾 Farmer' : role === 'BUYER' ? '🛒 Buyer' : '🔄 Both'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Province</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={form.province}
                        onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                        className="select-field pl-10"
                      >
                        <option value="">Select Province</option>
                        {PROVINCES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {authModalTab === 'login' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" placeholder="••••••••" className="input-field pl-10" />
                  </div>
                </div>
              )}

              <button onClick={handleSendOtp} disabled={isLoading} className="btn-primary w-full py-3.5">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {authModalTab === 'register' ? 'Send OTP Verification' : 'Send OTP to Sign In'}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
              </div>

              <button onClick={handleDemoLogin} className="btn-secondary w-full py-3">
                🎭 Demo Login (no setup needed)
              </button>
            </>
          ) : (
            <>
              <div className="text-center py-2">
                <Phone className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Verify your number</p>
                <p className="text-sm text-gray-500">Enter the 6-digit OTP sent to {form.phone}</p>
                <p className="text-xs text-primary-600 mt-1">Demo: use code 123456</p>
              </div>

              <div>
                <input
                  type="text"
                  value={form.otp}
                  onChange={e => setForm(f => ({ ...f, otp: e.target.value }))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="input-field text-center text-2xl tracking-widest font-bold"
                />
              </div>

              <button onClick={handleVerifyOtp} disabled={isLoading} className="btn-primary w-full py-3.5">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
              </button>

              <button onClick={() => setStep('form')} className="text-sm text-gray-500 hover:text-gray-700 w-full text-center">
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
