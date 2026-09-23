import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { User2Icon } from 'lucide-react';
import { useUser } from '../contexts/UserDetailsContext';

export const NavLinks = () => {
    const { user } = useUser();

    const firstNameLetter =
        user?.user_metadata?.full_name?.trim()?.[0];

    return (
        <nav className="hidden md:flex items-center gap-5 lg:gap-8 lg:pr-3">

            <NavLink
                to="/"
                className={({ isActive }) =>
                    isActive
                        ? "text-[#0a4d3c] font-bold border-b-2 border-[#0a4d3c] pb-1"
                        : "text-gray-800 hover:text-[#0a4d3c] pb-1 transition-colors"
                }
            >
                Home
            </NavLink>

            <NavLink
                to="/aboutus"
                className={({ isActive }) =>
                    isActive
                        ? "text-[#0a4d3c] font-bold border-b-2 border-[#0a4d3c] pb-1"
                        : "text-gray-800 hover:text-[#0a4d3c] pb-1 transition-colors"
                }
            >
                About Us
            </NavLink>

            <NavLink
                to="/userpost"
                className="bg-[#0a4d3c] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow hover:bg-[#D4AF37] hover:text-[#0a4d3c] transition-all duration-200"
            >
                Post Ad
            </NavLink>

            <div className="flex items-center justify-center shrink-0 min-w-10 h-10">
                {user ? (
                    <Link
                        to="/userprofile"
                        className="w-10 h-10 rounded-full overflow-hidden border border-[#0a4d3c] hover:opacity-80 transition-opacity block shadow-sm"
                    >
                        <div className="w-full h-full flex justify-center items-center text-[33px] bg-[#3b053d] font-semibold text-white">
                            {firstNameLetter || <User2Icon size={24} />}
                        </div>
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        className="bg-[#0a4d3c] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow hover:bg-[#D4AF37] hover:text-[#0a4d3c] transition-all duration-200 block text-center"
                    >
                        Log In
                    </Link>
                )}
            </div>

        </nav>
    );
};
