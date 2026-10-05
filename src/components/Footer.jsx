import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Heart, ArrowUp } from 'lucide-react';
import { supabase } from './supabaseClient';

const github = new URL('../assets/images/github.png', import.meta.url).href;
const facebook = new URL('../assets/images/facebook.png', import.meta.url).href;
const whatsapp = new URL('../assets/images/whatsapp.png', import.meta.url).href;

export const Footer = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSignUpPage = location.pathname === '/signup';
  const isIndexPage = location.pathname === '/';

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoginPage || isSignUpPage) return null;
  if (!isLoggedIn && isIndexPage) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-400 select-none border-t border-gray-800">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">

          {/* 1. Brand */}
          <div className="flex flex-col gap-2">
            <Link to="/home" className="flex items-center gap-2 w-fit">
              <div className="w-8 h-8 bg-[#0a4d3c] text-white rounded-lg flex items-center justify-center font-black text-base shadow-sm">
                S
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-white tracking-tight">
                  Swabi
                </span>
                <span className="text-base font-bold text-emerald-400 tracking-tight">
                  Market
                </span>
              </div>
            </Link>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Swabi ka apna online marketplace. Khareedein, bechein, aur local trade karein — bilkul free.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <MapPin className="w-3 h-3 text-[#D4AF37]" />
              <span>Swabi, KPK, Pakistan</span>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col gap-2 sm:items-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 sm:justify-center">
              <Link to="/home" className="text-[11px] text-gray-400 hover:text-[#D4AF37] transition-colors">Home</Link>
              <Link to="/aboutus" className="text-[11px] text-gray-400 hover:text-[#D4AF37] transition-colors">About</Link>
              <Link to="/privacy" className="text-[11px] text-gray-400 hover:text-[#D4AF37] transition-colors">Privacy</Link>
              <Link to="/terms" className="text-[11px] text-gray-400 hover:text-[#D4AF37] transition-colors">Terms</Link>
            </div>
          </div>

          {/* 3. Developer + Social */}
          <div className="flex flex-col gap-2 sm:items-end">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="text-[11px] text-gray-500">Built with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span className="text-[11px] text-gray-500">by</span>
              <a
                href="https://wa.me/923100094241"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-emerald-400 hover:text-[#D4AF37] transition-colors"
              >
                Waqas Ahmad
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/923100094241"
                target="_blank"
                rel="noreferrer"
                title="WhatsApp"
                className="w-7 h-7 rounded-full overflow-hidden hover:scale-110 transition-all shadow-sm ring-1 ring-gray-700 hover:ring-[#25D366]"
              >
                <img src={whatsapp} alt="WhatsApp" className="w-full h-full object-cover rounded-full" />
              </a>
              <a
                href="https://github.com/Mr-WaqasAhmad"
                target="_blank"
                rel="noreferrer"
                title="GitHub"
                className="w-7 h-7 rounded-full overflow-hidden hover:scale-110 transition-all shadow-sm ring-1 ring-gray-700 hover:ring-white"
              >
                <img src={github} alt="GitHub" className="w-full h-full object-cover rounded-full" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100081875383531"
                target="_blank"
                rel="noreferrer"
                title="Facebook"
                className="w-7 h-7 rounded-full overflow-hidden hover:scale-110 transition-all shadow-sm ring-1 ring-gray-700 hover:ring-[#1877F2]"
              >
                <img src={facebook} alt="Facebook" className="w-full h-full object-cover rounded-full" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] sm:text-[11px] text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Swabi Market. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[10px] sm:text-[11px] text-gray-500 hidden sm:inline">
              Made in 🇵🇰 Pakistan
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer font-medium"
            >
              <ArrowUp className="w-3 h-3" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
