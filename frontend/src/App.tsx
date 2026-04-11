import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LandingPage from './pages/LandingPage'
import BrowsePage from './pages/BrowsePage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import CreateListingPage from './pages/CreateListingPage'
import ListingDetailPage from './pages/ListingDetailPage'
import MarketPage from './pages/MarketPage'
import ProfilePage from './pages/ProfilePage'
import SubscribePage from './pages/SubscribePage'
import AdminPage from './pages/AdminPage'
import WatchlistPage from './pages/WatchlistPage'
import Navbar from './components/Navbar'
import { setUser } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const stored = localStorage.getItem('zamgrow_user')
    const token = localStorage.getItem('zamgrow_token')
    if (stored && token) {
      dispatch(setUser({ user: JSON.parse(stored), token }))
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-green-50 dark:bg-gray-950">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/listings/create" element={<CreateListingPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
