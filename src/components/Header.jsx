import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { Menu, X } from 'lucide-react'
import { NavLinks } from './NavLinks';
import { MobileNavLinks } from './MobileNavLinks';
import { supabase } from './supabaseClient';

export const Header = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const isIndexPage = location.pathname === "/";
  
  const [isOpened, setIsOpened] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Current auth session check karein
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Auth status change listen karein
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Condition 1: Login ya Signup pages par hide hoga
  if (isLoginPage || isSignUpPage) return null;

  // Condition 2: Agar user LOGGED OUT hai aur '/' (index page) par hai, toh HIDE hoga
  if (!isLoggedIn && isIndexPage) return null;

  return (
    <header className="w-full h-17 fixed top-0 left-0 z-50 flex items-center justify-between px-4 shadow-md bg-[#d8f3ecb9] select-none backdrop-blur">
      <Logo className="h-10 sm:h-12" />
      {/* Desktop Navigation */}
      <NavLinks />

      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpened(!isOpened)}
        className="md:hidden p-2 text-gray-800 hover:text-[#0a4d3c] focus:outline-none"
      >
        {isOpened ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Smooth Animated Mobile Drawer */}
      <MobileNavLinks isOpened={isOpened} setIsOpened={setIsOpened} />
    </header>
  )
}













































// import React, { useState } from 'react'
// import { NavLink, useLocation, Link } from 'react-router-dom'
// import { Logo } from './Logo'
// import { Menu, X } from 'lucide-react'
// import { NavLinks } from './NavLinks';
// import { MobileNavLinks } from './MobileNavLinks';

// export const Header = () => {
//   const location = useLocation();
//   const isLoginPage = location.pathname === "/login";
//   const isSignUpPage = location.pathname === "/signup";
//   const [isOpened, setIsOpened] = useState(false);

//   if (isLoginPage || isSignUpPage) return null;

//   return (
//     <header className="w-full h-17 fixed top-0 left-0 z-50 flex items-center justify-between px-4 shadow-md bg-[#d8f3ecb9] select-none backdrop-blur">
//       <Logo className="h-10 sm:h-12" />
//       {/* Desktop Navigation */}
//      <NavLinks/>

//       {/* Mobile Toggle Button */}
//       <button
//         type="button"
//         onClick={() => setIsOpened(!isOpened)}
//         className="md:hidden p-2 text-gray-800 hover:text-[#0a4d3c] focus:outline-none"
//       >
//         {isOpened ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//       </button>

//       {/* Smooth Animated Mobile Drawer */}
//       <MobileNavLinks isOpened={isOpened}/>

//     </header>
//   );
// };
