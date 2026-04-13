/**
 * Sales Dashboard Router — shows the correct dashboard based on user role
 * TDR → personal performance only
 * ZBM → their zone only
 * HSD → all zones, national view, target setting
 */
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import TDRDashboard from './TDRDashboard'
import ZBMDashboard from './ZBMDashboard'
import HSDDashboard from './HSDDashboard'
import SalesLoginPage from './SalesLoginPage'

export default function SalesDashboard() {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)

  if (!isAuthenticated || !user) return <SalesLoginPage />

  switch (user.role) {
    case 'HSD':   return <HSDDashboard />
    case 'ZBM':   return <ZBMDashboard />
    case 'TDR':   return <TDRDashboard />
    default:      return <SalesLoginPage />
  }
}
