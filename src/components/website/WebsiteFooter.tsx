import { memo } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const linkClass = "hover:text-green-400 transition-colors";

export const WebsiteFooter = memo(function WebsiteFooter() {
  return (
    <footer className="bg-[#0f2e1a] pt-8 pb-5 text-slate-300 md:pt-12 md:pb-6">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4 md:gap-10">
          {/* Brand/About */}
          <div className="col-span-2 flex items-start gap-4 md:col-span-1 md:block md:space-y-5">
            <Link to="/" className="shrink-0">
              <img
                src="/suggi-thota-logo.png"
                alt="Suggi Thota logo"
                width={160}
                height={80}
                loading="lazy"
                decoding="async"
                className="h-14 w-auto rounded-xl bg-white object-contain p-1.5 md:h-20 md:p-2"
              />
            </Link>
            <div className="space-y-3 md:space-y-5">
              <p className="text-sm leading-relaxed text-slate-400">
                Bengaluru's premium vegetable sourcing partner.
                Bridging the gap between farms and your kitchen with freshness you can taste.
              </p>
              <div className="flex gap-3">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-all duration-300 hover:bg-green-600 hover:text-white"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Company</h3>
            <ul className="space-y-2.5 text-sm md:space-y-3">
              <li><Link to="/" className={linkClass}>Home</Link></li>
              <li><Link to="/about" className={linkClass}>About Us</Link></li>
              <li><Link to="/contact" className={linkClass}>Contact</Link></li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.suggithota"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} inline-flex items-center gap-1.5`}
                >
                  Download App <ExternalLink size={12} className="opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div className="space-y-3 md:order-last md:space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Location</h3>
            <p className="text-sm text-slate-400">
              Find us quickly on Google Maps.
            </p>
            <a
              href="https://maps.app.goo.gl/u8w8JXf2Gg1HBce6A?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-green-500"
            >
              Open in Google Maps
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 space-y-3 md:col-span-1 md:space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Contact</h3>
            <ul className="space-y-2.5 text-sm md:space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-green-500" />
                <span className="text-slate-400">Bilekahalli, Vijayabank Layout, Bengaluru - 560076</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={17} className="shrink-0 text-green-500" />
                <span className="font-semibold text-slate-200">
                  <a href="tel:8884672766" className="hover:text-white">8884672766</a>
                  <span className="mx-2 text-white/30">|</span>
                  <a href="tel:9606670144" className="hover:text-white">9606670144</a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={17} className="shrink-0 text-green-500" />
                <a href="mailto:prksmilegroups2020@gmail.com" className="break-all transition-colors hover:text-white">prksmilegroups2020@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 md:mt-10 md:flex-row md:gap-6 md:pt-6 md:text-left">
          <p>© {new Date().getFullYear()} SUGGI THOTA. A UNIT OF PRK SMILE. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});
