import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../store'
import { MOCK_ADMIN_STATS, MOCK_LISTINGS, MOCK_USERS, formatZMW } from '../services/mockData'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { Users, Package, DollarSign, TrendingUp, CheckCircle, AlertCircle, Ban, Eye, Flag, Shield } from 'lucide-react'
import clsx from 'clsx'

const MONTHLY_REVENUE = [
  { month: 'Oct', revenue: 88000 },
  { month: 'Nov', revenue: 102000 },
  { month: 'Dec', revenue: 115000 },
  { month: 'Jan', revenue: 128000 },
  { month: 'Feb', revenue: 138000 },
  { month: 'Mar', revenue: 145000 },
  { month: 'Apr', revenue: 148420 },
]

const USER_ROLES = [
  { name: 'Sellers', value: 58, color: '#16a34a' },
  { name: 'Buyers', value: 29, color: '#3b82f6' },
  { name: 'Both', value: 13, color: '#f59e0b' },
]

export default function AdminPage() {
  const { user } = useSelector((s: RootState) => s.auth)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'reports'>('overview')

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-gray-500">You don't have permission to access this page.</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Go to Dashboard</Link>
      </div>
    )
  }

  const stats = [
    { icon: Users, label: 'Total Users', value: MOCK_ADMIN_STATS.totalUsers.toLocaleString(), change: `+${MOCK_ADMIN_STATS.newUsersToday} today`, color: 'text-blue-600 bg-blue-50' },
    { icon: Package, label: 'Active Listings', value: MOCK_ADMIN_STATS.activeListings.toLocaleString(), change: `+${MOCK_ADMIN_STATS.newListingsToday} today`, color: 'text-primary-600 bg-primary-50' },
    { icon: DollarSign, label: 'Monthly Revenue', value: formatZMW(MOCK_ADMIN_STATS.monthlyRevenue), change: '+8.2% vs last month', color: 'text-amber-600 bg-amber-50' },
    { icon: TrendingUp, label: 'Total Transactions', value: MOCK_ADMIN_STATS.totalTransactions.toLocaleString(), change: 'All time', color: 'text-purple-600 bg-purple-50' },
  ]

  const TABS = ['overview', 'users', 'listings', 'reports'] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary-600" />
            <h1 className="page-title">Admin Panel</h1>
          </div>
          <p className="text-gray-500">Zamgrow Exchange Operations Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-600">System Operational</span>
        </div>
      </div>

      {MOCK_ADMIN_STATS.pendingKyc > 0 && (
        <div className="card p-4 bg-amber-50 border-amber-200 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800 font-medium">{MOCK_ADMIN_STATS.pendingKyc} pending KYC verifications need review</span>
          </div>
          <button className="btn-amber text-sm py-2">Review KYC</button>
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
                <div className="text-xs text-green-600 mt-1">{s.change}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend (ZMW)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={MONTHLY_REVENUE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `K${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`K ${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">User Role Distribution</h3>
              <PieChart width={200} height={200}>
                <Pie data={USER_ROLES} cx={100} cy={100} innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {USER_ROLES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
              <div className="space-y-2 mt-2">
                {USER_ROLES.map(r => (
                  <div key={r.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-gray-600">{r.name}</span>
                    </div>
                    <span className="font-semibold">{r.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">User Management</h3>
            <input type="search" placeholder="Search users..." className="input-field text-sm py-2 w-48" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['User', 'Phone', 'Role', 'Province', 'KYC', 'Credits', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_USERS.filter(u => u.role !== 'ADMIN').map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 text-sm font-semibold">{u.name[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.phone}</td>
                    <td className="px-4 py-3"><span className="badge-active text-xs">{u.role}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.province?.name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {u.isVerified
                        ? <div className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Verified</div>
                        : <div className="flex items-center gap-1 text-amber-600 text-xs"><AlertCircle className="w-3.5 h-3.5" /> Pending</div>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.creditsBalance}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-primary-600 rounded"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Ban className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Listing Moderation</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Type', 'Seller', 'Province', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_LISTINGS.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{l.categoryEmoji}</span>
                        <span className="text-sm font-medium text-gray-900">{l.product}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={l.type === 'SELL' ? 'badge-sell' : 'badge-buy'}>{l.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.province.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-primary-700">{formatZMW(l.priceZmw)}</td>
                    <td className="px-4 py-3"><span className="badge-active text-xs">{l.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link to={`/listings/${l.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 rounded"><Eye className="w-4 h-4" /></Link>
                        <button className="p-1.5 text-gray-400 hover:text-amber-600 rounded"><Flag className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Ban className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Province Trading Volume', desc: 'Download CSV of all trades by province', btn: 'Export CSV' },
            { title: 'Revenue Report', desc: 'Monthly subscription revenue breakdown', btn: 'Export Excel' },
            { title: 'User Growth Report', desc: 'New user registrations by week/month', btn: 'Export CSV' },
            { title: 'Price Anomaly Report', desc: 'Flagged prices that deviate from market norms', btn: 'View Report' },
          ].map(r => (
            <div key={r.title} className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{r.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
              <button className="btn-secondary text-sm">{r.btn}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
