import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import BrowsePage from './pages/BrowsePage'
import ListingDetailPage from './pages/ListingDetailPage'
import CreateListingPage from './pages/CreateListingPage'
import DashboardPage from './pages/DashboardPage'
import MarketPage from './pages/MarketPage'
import ProfilePage from './pages/ProfilePage'
import SubscribePage from './pages/SubscribePage'
import AdminPage from './pages/AdminPage'
import WatchlistPage from './pages/WatchlistPage'
import PaymentPage from './pages/PaymentPage'
import SalesDashboard from './pages/sales/SalesDashboard'
import AuthModal from './components/ui/AuthModal'
import SubscribeModal from './components/ui/SubscribeModal'

function App() {
  const { isAuthModalOpen, isSubscribeModalOpen } = useSelector((s: RootState) => s.ui)
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/listings/create" element={<CreateListingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/profile/:id?" element={<ProfilePage />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/sales" element={<SalesDashboard />} />
        </Routes>
      </Layout>
      {isAuthModalOpen && <AuthModal />}
      {isSubscribeModalOpen && <SubscribeModal />}
    </>
  )
}
export default App
