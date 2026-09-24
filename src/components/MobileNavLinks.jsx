import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUser } from '../contexts/UserDetailsContext';

export const MobileNavLinks = ({ isOpened, setIsOpened }) => {
  const { user } = useUser();
  const firstNameLetter =
    user?.full_name?.trim()?.[0] || user?.user_metadata?.full_name?.trim()?.[0];

  return (
    <div
      className={`absolute top-16 left-0 w-full bg-[#effffb] border-t border-gray-200 p-4 flex flex-col gap-4 shadow-lg md:hidden transition-all duration-300 ease-in-out origin-top z-50 ${isOpened
        ? 'translate-y-0 opacity-100 pointer-events-auto visible'
        : '-translate-y-10 opacity-0 pointer-events-none invisible'
        }`}
    >
      {/* ✅ Home (Left) + About Us (Right) */}
      <div className="flex items-center justify-evenly px-10 gap-10">
        <NavLink
          to="/"
          onClick={() => setIsOpened(false)}
          className={({ isActive }) =>
            isActive
              ? 'text-[#0a4d3c] font-bold'
              : 'text-gray-800 font-medium hover:text-[#0a4d3c]'
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/aboutus"
          onClick={() => setIsOpened(false)}
          className={({ isActive }) =>
            isActive
              ? 'text-[#0a4d3c] font-bold'
              : 'text-gray-800 font-medium hover:text-[#0a4d3c]'
          }
        >
          About Us
        </NavLink>
      </div>

      {/* Post Ad Button */}
      <NavLink
        to="/userpost"
        onClick={() => setIsOpened(false)}
        className="bg-[#0a4d3c] text-white text-center text-sm font-semibold py-2 rounded-xl hover:bg-[#D4AF37] hover:text-[#0a4d3c] transition-all"
      >
        Post Ad
      </NavLink>

      {/* Profile ya Login */}
      {user ? (
        <Link
          to="/userprofile"
          onClick={() => setIsOpened(false)}
          className="flex items-center justify-center gap-3 pt-3 border-t border-gray-200"
        >
          <div className="w-10 h-10 rounded-full flex justify-center items-center text-xl bg-[#3b053d] font-semibold text-white">
            {firstNameLetter || 'U'}
          </div>
        </Link>
      ) : (
        <Link
          to="/login"
          onClick={() => setIsOpened(false)}
          className="bg-[#0a4d3c] text-white text-center text-sm font-semibold py-2 rounded-xl hover:bg-[#D4AF37] hover:text-[#0a4d3c] transition-all"
        >
          Log In
        </Link>
      )}
    </div>
  );
};
