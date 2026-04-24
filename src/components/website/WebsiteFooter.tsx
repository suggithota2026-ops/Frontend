import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export const WebsiteFooter = () => {
  return (
    <footer className="bg-slate-950 pt-16 pb-8 text-slate-300 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand/About */}
          <div className="space-y-6">
            <Link to="/" className="inline-block group">
              <div className="flex items-center gap-3">
                <img
                  src="/Invoice.png"
                  alt="Suggi Thota Logo"
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
                <span className="text-xl font-bold text-white tracking-tight">
                  Suggi <span className="text-green-500">Thota</span>
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Bengaluru's premium vegetable sourcing partner.
              Bridging the gap between farms and your kitchen with freshness you can taste.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-green-600 hover:text-white transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Company</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/" className="hover:text-green-500 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-green-500 transition-all duration-300 group-hover:w-3" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-green-500 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-green-500 transition-all duration-300 group-hover:w-3" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-500 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-green-500 transition-all duration-300 group-hover:w-3" />
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.prksmile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="h-px w-0 bg-green-500 transition-all duration-300 group-hover:w-3" />
                  Download App <ExternalLink size={12} className="opacity-50" />
                </a>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-green-500 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-green-500 transition-all duration-300 group-hover:w-3" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-green-500 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-green-500 transition-all duration-300 group-hover:w-3" />
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-green-500 shrink-0 mt-0.5" />
                <span className="text-slate-400">Bilekahalli, Vijayabank Layout, Bengaluru - 560076</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-green-500 shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:8884672766" className="hover:text-white transition-colors">8884672766</a>
                  <a href="tel:9606670144" className="hover:text-white transition-colors text-xs opacity-70">9606670144</a>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-green-500 shrink-0" />
                <a href="mailto:prksmilegroups2020@gmail.com" className="hover:text-white transition-colors text-xs break-all">prksmilegroups2020@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Stay Fresh</h3>
            <p className="text-sm text-slate-400">
              Join 5,000+ subscribers for weekly farm updates.
            </p>
            <div className="relative group">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-green-600 hover:bg-green-500 text-white rounded-lg px-4 text-xs font-bold transition-all active:scale-95">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-slate-500">
          <p>© {new Date().getFullYear()} SUGGI THOTA. A UNIT OF PRK SMILE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="#" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
