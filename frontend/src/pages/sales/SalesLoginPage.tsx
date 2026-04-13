/**
 * Sales Portal Login — with demo quick-access for HSD / ZBM / TDR
 */
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../../store/slices/authSlice'
import { DEMO_USERS } from '../../services/salesData'
import { TrendingUp, Shield, Users, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DEMO_ROLES = [
  {
    key: 'hsd' as const,
    label: 'HSD',
    name: 'Head of Sales Division',
    description: 'Set targets, view all zones & TDRs nationally',
    icon: Shield,
    color: 'bg-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-700',
  },
  {
    key: 'zbm' as const,
    label: 'ZBM',
    name: 'Zone Business Manager',
    description: 'View your zone only — all TDRs in Lusaka Zone',
    icon: Users,
    color: 'bg-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
  },
  {
    key: 'tdr' as const,
    label: 'TDR',
    name: 'Territory Development Rep',
    description: 'Your personal performance & assigned target only',
    icon: User,
    color: 'bg-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-300',
    text: 'text-primary-700',
  },
]

export default function SalesLoginPage() {
  const dispatch = useDispatch()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDemoLogin = async (roleKey: 'hsd' | 'zbm' | 'tdr') => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const demoUser = DEMO_USERS[roleKey]
    dispatch(loginSuccess({ user: demoUser as any, token: `demo-${roleKey}-token` }))
    toast.success(`Logged in as ${demoUser.name} (${demoUser.role})`)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Zamgrow Sales Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Performance management for TDR, ZBM & HSD</p>
        </div>

        {/* Phone + PIN form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Sign In</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+260 97 123 4567"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIN</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="input w-full pr-10"
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => toast('Connect backend for live login · Use demo below')}
              className="w-full btn-primary py-3"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Demo quick access */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Demo Access — Select Role</p>
          <div className="space-y-3">
            {DEMO_ROLES.map(role => (
              <button
                key={role.key}
                onClick={() => handleDemoLogin(role.key)}
                disabled={loading}
                className={clsx(
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all hover:shadow-sm disabled:opacity-50',
                  role.bg, role.border
                )}
              >
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0', role.color)}>
                  <role.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className={clsx('font-bold text-sm', role.text)}>
                    {role.label} — {role.name}
                  </div>
                  <div className="text-xs text-gray-500">{role.description}</div>
                </div>
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                  : <span className={clsx('text-xs font-bold flex-shrink-0', role.text)}>Enter →</span>
                }
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Zamgrow Exchange · Sales Performance System · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
