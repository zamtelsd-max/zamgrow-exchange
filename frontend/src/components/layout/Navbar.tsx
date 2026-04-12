import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { logout, demoLogin } from '../../store/slices/authSlice'
import { openAuthModal, openSubscribeModal, toggleNotifications } from '../../store/slices/uiSlice'
import { markAllAsRead } from '../../store/slices/notificationsSlice'
import { Bell, Menu, X, Plus, BarChart2, ShoppingBag, Heart, User, LogOut, Settings, Shield, Coins, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const { unreadCount, notifications } = useSelector((s: RootState) => s.notifications)
  const { isMenuOpen, isNotificationsOpen } = useSelector((s: RootState) => s.ui)
  const [profileOpen, setProfileOpen] = useState(false)

  const navLinks = [
    { label: 'Browse', href: '/browse', icon: ShoppingBag },
    { label: 'Market Prices', href: '/market', icon: BarChart2 },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold">Z</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-gray-900 font-bold text-lg leading-none">Zamgrow</span>
              <span className="text-primary-600 font-bold text-lg leading-none"> Exchange</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Credits Badge */}
                <button
                  onClick={() => navigate('/payment', { state: { amount: 50, credits: 5, purpose: 'Credit Top-up' } })}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  title="Top up credits"
                >
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">{user.creditsBalance}</span>
                  <span className="text-xs text-amber-500">credits</span>
                  <span className="text-xs text-amber-400 font-medium">+ Top Up</span>
                </button>

                {/* Post Listing Button */}
                <button
                  onClick={() => navigate('/listings/create')}
                  className="hidden sm:flex btn-primary text-sm py-2 px-3"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post</span>
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => dispatch(toggleNotifications())}
                    className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-semibold text-gray-900">Notifications</span>
                        <button
                          onClick={() => dispatch(markAllAsRead())}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.slice(0, 5).map(n => (
                          <div
                            key={n.id}
                            className={clsx(
                              'px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer',
                              !n.isRead && 'bg-primary-50/50'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />}
                              <div className={!n.isRead ? '' : 'pl-4'}>
                                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3">
                        <button className="w-full text-sm text-center text-primary-600 font-medium hover:text-primary-700">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-emerald-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{user.name[0]}</span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      {[
                        { icon: User, label: 'My Profile', href: '/profile' },
                        { icon: ShoppingBag, label: 'Dashboard', href: '/dashboard' },
                        { icon: Heart, label: 'Watchlist', href: '/watchlist' },
                        ...(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? [{ icon: Shield, label: 'Admin Panel', href: '/admin' }] : []),
                        { icon: Settings, label: 'Settings', href: '/profile' },
                      ].map(item => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-gray-400" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => { dispatch(logout()); setProfileOpen(false) }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => dispatch(openAuthModal('login'))}
                  className="btn-ghost text-sm py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => dispatch(openAuthModal('register'))}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Join Free
                </button>
                {/* Demo Login */}
                <button
                  onClick={() => dispatch(demoLogin())}
                  className="hidden sm:flex btn-secondary text-xs py-2 px-3"
                  title="Demo login"
                >
                  Demo
                </button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch({ type: 'ui/toggleMenu' })}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium"
                onClick={() => dispatch({ type: 'ui/closeMenu' })}
              >
                <link.icon className="w-5 h-5 text-gray-400" />
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/listings/create"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-primary-700 hover:bg-primary-50 font-medium"
                onClick={() => dispatch({ type: 'ui/closeMenu' })}
              >
                <Plus className="w-5 h-5" />
                Post a Listing
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
