import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Vidamedics" className="w-8 h-8" />
              <span className="text-xl font-bold">Vida<span className="text-purple-400">medics</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Your trusted source for professional medical equipment and supplies.
              Serving healthcare professionals with quality products at competitive prices.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Quick Links</h3>
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <Link to="/" className="text-gray-300 hover:text-purple-400 text-sm transition-colors no-underline">Shop</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-purple-400 text-sm transition-colors no-underline">My Dashboard</Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-purple-400 text-sm transition-colors no-underline">Cart</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-purple-400 text-sm transition-colors no-underline">Login</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Categories</h3>
            <ul className="space-y-2 list-none p-0 m-0">
              <li><span className="text-gray-300 text-sm">Stethoscopes</span></li>
              <li><span className="text-gray-300 text-sm">Diagnostic Tools</span></li>
              <li><span className="text-gray-300 text-sm">PPE</span></li>
              <li><span className="text-gray-300 text-sm">Surgical</span></li>
              <li><span className="text-gray-300 text-sm">First Aid</span></li>
              <li><span className="text-gray-300 text-sm">Mobility Aids</span></li>
              <li><span className="text-gray-300 text-sm">Patient Monitoring</span></li>
              <li><span className="text-gray-300 text-sm">Lab Equipment</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Vidamedics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
