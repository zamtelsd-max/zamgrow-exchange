import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">Z</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-none">Zamgrow</span>
                <span className="text-primary-400 font-bold text-lg leading-none"> Exchange</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Zamgrow Exchange — Zambia's premier agricultural marketplace. Connecting farmers, buyers, and agro-dealers with AI-powered pricing.
            </p>
            <div className="flex gap-3">
              {['FB','TW','IG'].map((s, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors text-xs font-bold">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2">
              {[
                ['Browse Listings', '/browse'],
                ['Post a Listing', '/listings/create'],
                ['Market Prices', '/market'],
                ['Price Alerts', '/dashboard'],
                ['Watchlist', '/watchlist'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {['🌾 Cereals & Grains', '🫘 Legumes', '🥬 Vegetables', '🐄 Livestock', '🐟 Fisheries', '🍯 Honey & Bees'].map(cat => (
                <li key={cat}>
                  <Link to="/browse" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">Cairo Road, Lusaka, Zambia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">+260 211 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">hello@zamgrow.co.zm</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 mb-2">Available on mobile:</p>
              <div className="flex gap-2">
                <div className="flex-1 text-center py-1.5 px-2 bg-gray-700 rounded-lg text-xs text-gray-300 font-medium">
                  Android
                </div>
                <div className="flex-1 text-center py-1.5 px-2 bg-gray-700 rounded-lg text-xs text-gray-300 font-medium">
                  iOS
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Zamgrow Exchange. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Help Center'].map(item => (
              <a key={item} href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
