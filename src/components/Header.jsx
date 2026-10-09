import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Logo } from './Logo'
import { Menu, X, MessageCircle } from 'lucide-react'
import { NavLinks } from './NavLinks';
import { MobileNavLinks } from './MobileNavLinks';
import { supabase } from './supabaseClient';
import { useUser } from '../contexts/UserDetailsContext';

export const Header = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const isIndexPage = location.pathname === "/";

  const { user } = useUser();
  const [isOpened, setIsOpened] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ Unread count — sirf initial fetch, koi realtime nahi
  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    let isMounted = true;

    const fetchUnread = async () => {
      try {
        const { data: convs, error } = await supabase
          .from('conversations')
          .select('buyer_id, seller_id, buyer_unread, seller_unread')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (error || !isMounted) return;

        const total = (convs || []).reduce((sum, c) => {
          const isBuyer = c.buyer_id === user.id;
          return sum + (isBuyer ? (c.buyer_unread || 0) : (c.seller_unread || 0));
        }, 0);

        if (isMounted) setUnreadCount(total);
      } catch (err) {
        // silent
      }
    };

    fetchUnread();

    // ✅ Periodic refresh — har 30 sec
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  if (isLoginPage || isSignUpPage) return null;
  if (!isLoggedIn && isIndexPage) return null;

  return (
    <header className="w-full h-17 fixed top-0 left-0 z-50 flex items-center justify-between px-4 shadow-md bg-[#d8f3ecb9] select-none backdrop-blur">
      <Logo className="h-10 sm:h-12" />

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2 sm:gap-3">
        {user && (
          <Link
            to="/messages"
            aria-label="Messages"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#effffb] transition-colors cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center border border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        <NavLinks />
      </div>

      {/* Mobile Icons */}
      <div className="md:hidden flex items-center gap-1">
        {user && (
          <Link
            to="/messages"
            aria-label="Messages"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#effffb] transition-colors cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center border border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        <button
          type="button"
          id="mobile-menu-button"
          onClick={() => setIsOpened(!isOpened)}
          aria-label={isOpened ? "Close menu" : "Open menu"}
          className="relative z-50 w-12 h-12 flex items-center justify-center text-gray-800 hover:text-[#0a4d3c] hover:bg-[#d8f3ecb9] rounded-xl focus:outline-none cursor-pointer"
        >
          {isOpened ? (
            <X className="w-6 h-6 pointer-events-none" />
          ) : (
            <Menu className="w-6 h-6 pointer-events-none" />
          )}
        </button>
      </div>

      <MobileNavLinks isOpened={isOpened} setIsOpened={setIsOpened} />
    </header>
  )
}
