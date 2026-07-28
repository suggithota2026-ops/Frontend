import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export const WebsiteFooter = () => {
  return (
    <footer className="bg-slate-950 pt-16 pb-8 text-slate-300 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand/About */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <img
                src="/suggi-thota-logo.png"
                alt="Suggi Thota logo"
                className="h-20 w-auto rounded-xl bg-white object-contain p-2"
              />
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
              <li className="flex items-start space-x-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-green-500" />
                <div className="space-y-2">
                  <a
                    href="tel:8884672766"
                    className="block text-base font-semibold text-slate-200 transition-colors hover:text-white"
                  >
                    8884672766
                  </a>
                  <a
                    href="tel:9606670144"
                    className="block text-base font-semibold text-slate-200 transition-colors hover:text-white"
                  >
                    9606670144
                  </a>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-green-500 shrink-0" />
                <a href="mailto:prksmilegroups2020@gmail.com" className="hover:text-white transition-colors text-xs break-all">prksmilegroups2020@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Location</h3>
            <p className="text-sm text-slate-400">
              Find us quickly on Google Maps.
            </p>
            <a
              href="https://maps.app.goo.gl/u8w8JXf2Gg1HBce6A?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-green-500/40 hover:bg-green-600 hover:text-white"
            >
              Open in Google Maps
              <ExternalLink size={14} />
            </a>
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
