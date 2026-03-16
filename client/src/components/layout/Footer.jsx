import { Link } from 'react-router-dom'
import { Leaf, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Browse Products', href: '/products' },
      { name: 'Categories', href: '/products?category=all' },
      { name: 'Featured', href: '/products?featured=true' },
      { name: 'Organic', href: '/products?organic=true' },
    ],
    farmers: [
      { name: 'Sell Your Products', href: '/register?type=farmer' },
      { name: 'Farmer Dashboard', href: '/farmer/dashboard' },
      { name: 'Market Prices', href: '/farmer/market-prices' },
      { name: 'Success Stories', href: '/stories' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Shipping Info', href: '/shipping' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
  }

  return (
    <footer className="bg-card text-foreground">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-farmer-500 to-farmer-700 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">FarmMarket</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Connecting Maharashtra's farmers directly with buyers. Fresh produce, fair prices, and sustainable farming.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-farmer-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-farmer-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-farmer-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-farmer-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm hover:text-farmer-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Farmers</h3>
            <ul className="space-y-3">
              {footerLinks.farmers.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm hover:text-farmer-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm hover:text-farmer-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-farmer-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Maharashtra, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-farmer-500 flex-shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-farmer-500 flex-shrink-0" />
                <span className="text-sm">support@farmmarket.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} FarmMarket. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer