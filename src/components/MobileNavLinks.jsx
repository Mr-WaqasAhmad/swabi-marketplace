import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUser } from '../contexts/UserDetailsContext';
import { LogIn, User as UserIcon, Plus } from 'lucide-react';

export const MobileNavLinks = ({ isOpened, setIsOpened }) => {
  const { user } = useUser();
  const firstNameLetter =
    user?.full_name?.trim()?.[0] || user?.user_metadata?.full_name?.trim()?.[0];
  const userName =
    user?.full_name || user?.user_metadata?.full_name || 'User';

  return (
    <div
      className={`absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl md:hidden transition-all duration-300 ease-in-out origin-top z-50 ${
        isOpened
          ? 'translate-y-0 opacity-100 pointer-events-auto visible'
          : '-translate-y-4 opacity-0 pointer-events-none invisible'
      }`}
    >
      <div className="flex flex-col p-5 gap-5">

        {/* ✅ Home + About Us — Same Line, Balanced */}
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            onClick={() => setIsOpened(false)}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-[#0a4d3c] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-[#effffb] hover:text-[#0a4d3c]'
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/aboutus"
            onClick={() => setIsOpened(false)}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-[#0a4d3c] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-[#effffb] hover:text-[#0a4d3c]'
              }`
            }
          >
            About Us
          </NavLink>
        </div>

        {/* ✅ Divider */}
        <div className="h-px bg-gray-100" />

        {/* ✅ Post Ad — Full Width Button with Icon */}
        <NavLink
          to="/userpost"
          onClick={() => setIsOpened(false)}
          className="flex items-center justify-center gap-2 bg-[#0a4d3c] text-white text-sm font-bold py-3 rounded-xl shadow-md hover:bg-[#D4AF37] hover:text-[#0a4d3c] hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Post Ad
        </NavLink>

        {/* ✅ Profile ya Login — Clean Card Style */}
        {user ? (
          <Link
            to="/userprofile"
            onClick={() => setIsOpened(false)}
            className="flex items-center gap-3 p-3 bg-[#effffb] border border-[#0a4d3c]/10 rounded-xl hover:bg-[#e0fff5] transition-all"
          >
            <div className="w-11 h-11 rounded-full flex justify-center items-center text-lg bg-[#3b053d] font-bold text-white shadow-sm shrink-0">
              {firstNameLetter || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-gray-800 truncate">
                {userName}
              </span>
              <span className="text-xs text-[#0a4d3c] font-medium">
                View Profile →
              </span>
            </div>
          </Link>
        ) : (
          <Link
            to="/login"
            onClick={() => setIsOpened(false)}
            className="flex items-center justify-center gap-2 bg-white border-2 border-[#0a4d3c] text-[#0a4d3c] text-sm font-bold py-3 rounded-xl hover:bg-[#0a4d3c] hover:text-white transition-all active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            Log In
          </Link>
        )}

      </div>
    </div>
  );
};
