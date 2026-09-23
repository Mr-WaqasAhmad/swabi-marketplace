import React from 'react'
import { Link, NavLink } from 'react-router-dom'
const profile = false
export const MobileNavLinks = ({isOpened}) => {
  return (
   <div
        className={`absolute top-16 left-0 w-full bg-[#effffb] border-t border-gray-200 p-4 flex flex-col gap-4 shadow-lg md:hidden -z-10 transition-all duration-300 ease-in-out origin-top ${isOpened
          ? "translate-y-0 opacity-100 pointer-events-auto visible"
          : "-translate-y-10 opacity-0 pointer-events-none invisible"
          }`}
      >
        <NavLink
          to="/"
          onClick={() => setIsOpened(false)}
          className="text-gray-800 font-medium hover:text-[#0a4d3c]"
        >
          Home
        </NavLink>

        <NavLink
          to="/chat"
          onClick={() => setIsOpened(false)}
          className="text-gray-800 font-medium hover:text-[#0a4d3c]"
        >
          Chat
        </NavLink>

        <NavLink
          to="/aboutus"
          onClick={() => setIsOpened(false)}
          className="text-gray-800 font-medium hover:text-[#0a4d3c]"
        >
          About Us
        </NavLink>

        <NavLink
          to="/userpost"
          onClick={() => setIsOpened(false)}
          className="bg-[#0a4d3c] text-white text-center text-sm font-semibold py-2 rounded-xl"
        >
          Post Ad
        </NavLink>

        {profile ? (
          <Link
            to="/userprofile"
            onClick={() => setIsOpened(false)}
            className="flex items-center gap-3 pt-2 border-t border-gray-200"
          >
            <img src={profile} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-[#0a4d3c]" />
            <span className="text-gray-800 font-semibold text-sm">My Profile</span>
          </Link>
        ) : (
          <Link
            to="/login"
            onClick={() => setIsOpened(false)}
            className="bg-[#0a4d3c] text-white text-center text-sm font-semibold py-2 rounded-xl"
          >
            Log In
          </Link>
        )}
      </div>
  )
}
