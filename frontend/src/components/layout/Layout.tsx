import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import PriceTicker from '../marketplace/PriceTicker'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <PriceTicker />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
