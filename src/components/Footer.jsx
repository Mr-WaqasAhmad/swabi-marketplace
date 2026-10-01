import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { MapPin, Heart, MessageCircle, Code2, Globe } from "lucide-react";

export const Footer = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const isIndexPage = location.pathname === "/";

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

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16 border-t border-gray-800 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-800">

          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#0a4d3c] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md">
                S
              </div>
              <span className="text-lg font-bold text-white tracking-wide">
                Swabi <span className="text-[#effffb]">Market</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Swabi ka sabse bada online marketplace. Apni cheezein aasani se khareedein aur bechein.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Swabi, KPK, Pakistan</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3 sm:items-end">
            <h4 className="text-sm font-bold text-white">Quick Links</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end">
              <Link
                to="/home"
                className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/aboutus"
                className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/privacy"
                className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>

        </div>

        {/* Developer Credit + Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">

          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Swabi Market. All rights reserved.
          </p>

          {/* Developer Credit + Social Icons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-500">Built with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span className="text-xs text-gray-500">by</span>
            <a
              href="https://wa.me/923100094241"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[#effffb] hover:text-[#D4AF37] transition-colors"
            >
              Waqas Ahmad
            </a>

            {/* ✅ Lucide SVG Icons — Perfectly Circular */}
            <div className="flex items-center gap-2 ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-gray-700">
              <a
                href="https://wa.me/923100094241"
                target="_blank"
                rel="noreferrer"
                title="WhatsApp"
                className="w-8 h-8 bg-[#25D366] hover:bg-[#1FA855] rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
              </a>
              <a
                href="https://github.com/Mr-WaqasAhmad"
                target="_blank"
                rel="noreferrer"
                title="GitHub"
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
              >
                <Code2 className="w-4 h-4 text-white" strokeWidth={2.5} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100081875383531"
                target="_blank"
                rel="noreferrer"
                title="Facebook"
                className="w-8 h-8 bg-[#1877F2] hover:bg-[#0a5dc2] rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
              >
                <Globe className="w-4 h-4 text-white" strokeWidth={2.5} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
