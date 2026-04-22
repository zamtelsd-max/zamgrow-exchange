import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { closeAuthModal, setAuthTab } from '../../store/slices/uiSlice'
import { loginStart, loginSuccess, loginFailure, demoLogin } from '../../store/slices/authSlice'
import { PROVINCES } from '../../services/mockData'
import { X, Phone, Lock, User, MapPin, ChevronRight, Loader2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL || '/api/v1'

type LoginMode = 'otp' | 'password'

export default function AuthModal() {
  const dispatch = useDispatch()
  const { authModalTab } = useSelector((s: RootState) => s.ui)
  const { isLoading } = useSelector((s: RootState) => s.auth)

  const [step, setStep]           = useState<'form' | 'otp'>('form')
  const [loginMode, setLoginMode] = useState<LoginMode>('otp')
  const [form, setForm]           = useState({ name: '', phone: '', role: 'farmer', province: '', otp: '', password: '' })
  const [busy, setBusy]           = useState(false)

  const loading = isLoading || busy

  // ── Password login (admin / staff) ───────────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (!form.phone || !form.password) {
      toast.error('Phone and password required')
      return
    }
    setBusy(true)
    dispatch(loginStart())
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      dispatch(loginSuccess({
        user: {
          id: data.user.id,
          name: data.user.name,
          phone: data.user.phone,
          role: data.user.role,
          creditsBalance: data.user.credits ?? 0,
          isVerified: true,
          createdAt: data.user.createdAt,
        },
        token: data.token,
      }))
      dispatch(closeAuthModal())
      toast.success(`Welcome back, ${data.user.name}! 👋`)
    } catch (e: any) {
      dispatch(loginFailure(e.message))
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  // ── OTP — send ───────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error('Enter a valid Zambian phone number')
      return
    }
    if (authModalTab === 'register' && !form.province) {
      toast.error('Please select your province')
      return
    }

    setBusy(true)
    dispatch(loginStart())

    try {
      if (authModalTab === 'register') {
        // Register → get token directly (sandbox: no OTP needed)
        const phone = form.phone.startsWith('+') ? form.phone : `+260${form.phone.replace(/^0/, '')}`
        const res = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name || 'Zamgrow User',
            phone,
            role: form.role,
            province: form.province,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Registration failed')
        dispatch(loginSuccess({
          user: {
            id: data.user.id,
            name: data.user.name,
            phone: data.user.phone,
            role: data.user.role,
            creditsBalance: data.user.credits ?? 10,
            isVerified: false,
            createdAt: data.user.createdAt,
          },
          token: data.token,
        }))
        dispatch(closeAuthModal())
        toast.success('Account created! 10 free credits added 🎉')
      } else {
        // Login via OTP send
        const phone = form.phone.startsWith('+') ? form.phone : `+260${form.phone.replace(/^0/, '')}`
        const res = await fetch(`${API}/auth/otp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
        setForm(f => ({ ...f, phone }))
        setStep('otp')
        dispatch(loginFailure(''))
        toast.success('OTP sent to ' + phone)
      }
    } catch (e: any) {
      dispatch(loginFailure(e.message))
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  // ── OTP — verify ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!form.otp || form.otp.length < 4) {
      toast.error('Enter the OTP from your SMS')
      return
    }
    setBusy(true)
    dispatch(loginStart())
    try {
      const res = await fetch(`${API}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp: form.otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'OTP verification failed')
      dispatch(loginSuccess({
        user: {
          id: data.user.id,
          name: data.user.name,
          phone: data.user.phone,
          role: data.user.role,
          creditsBalance: data.user.credits ?? 0,
          isVerified: true,
          createdAt: data.user.createdAt,
        },
        token: data.token,
      }))
      dispatch(closeAuthModal())
      toast.success(`Welcome back, ${data.user.name}! 👋`)
    } catch (e: any) {
      dispatch(loginFailure(e.message))
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleDemoLogin = () => {
    dispatch(demoLogin())
    dispatch(closeAuthModal())
    toast.success('Logged in as demo user')
  }

  const switchTab = (tab: 'login' | 'register') => {
    dispatch(setAuthTab(tab))
    setStep('form')
    setLoginMode('otp')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => dispatch(closeAuthModal())} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">

        {/* ── Header ── */}
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
          <p className="text-green-200 text-sm mt-1">
            {authModalTab === 'register' ? 'Join 14,800+ traders' : 'Sign in to continue trading'}
          </p>

          {/* Tabs */}
          <div className="flex mt-4 bg-white/10 rounded-xl p-1">
            {(['login', 'register'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${authModalTab === tab ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'}`}
              >
                {tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-4">

          {step === 'otp' ? (
            /* ─── OTP step ─── */
            <>
              <div className="text-center py-2">
                <Phone className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Verify your number</p>
                <p className="text-sm text-gray-500">Enter the 6-digit OTP sent to {form.phone}</p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={form.otp}
                onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))}
                placeholder="• • • • • •"
                maxLength={6}
                className="input-field text-center text-2xl tracking-widest font-bold"
              />
              <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
              </button>
              <button onClick={() => setStep('form')} className="text-sm text-gray-500 hover:text-gray-700 w-full text-center">
                ← Back
              </button>
            </>
          ) : authModalTab === 'login' ? (
            /* ─── Login step ─── */
            <>
              {/* Login mode toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 text-sm">
                <button
                  onClick={() => setLoginMode('otp')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginMode === 'otp' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  📱 OTP Login
                </button>
                <button
                  onClick={() => setLoginMode('password')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginMode === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  🔐 Password Login
                </button>
              </div>

              {/* Phone field */}
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

              {loginMode === 'password' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
                        placeholder="••••••••"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  {/* Admin hint */}
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                    <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-green-700">
                      Admin & staff accounts use password login. Regular traders use OTP.
                    </p>
                  </div>

                  <button onClick={handlePasswordLogin} disabled={loading} className="btn-primary w-full py-3.5">
                    {loading
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <><Lock className="w-4 h-4" /> Sign In</>}
                  </button>
                </>
              )}

              {loginMode === 'otp' && (
                <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full py-3.5">
                  {loading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <><Phone className="w-4 h-4" /> Send OTP <ChevronRight className="w-4 h-4" /></>}
                </button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
              </div>

              <button onClick={handleDemoLogin} className="btn-secondary w-full py-3">
                🎭 Demo Login (no setup needed)
              </button>
            </>
          ) : (
            /* ─── Register step ─── */
            <>
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

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🇿🇲</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+260 97X XXX XXX"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'farmer', label: '🌾 Farmer' },
                    { value: 'buyer',  label: '🛒 Buyer' },
                    { value: 'dealer', label: '🔄 Dealer' },
                  ].map(r => (
                    <button
                      key={r.value}
                      onClick={() => setForm(f => ({ ...f, role: r.value }))}
                      className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.role === r.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      {r.label}
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

              <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full py-3.5">
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <>Create Account <ChevronRight className="w-5 h-5" /></>}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
              </div>

              <button onClick={handleDemoLogin} className="btn-secondary w-full py-3">
                🎭 Demo Login (no setup needed)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
