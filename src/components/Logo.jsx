import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = () => {
  return (
    <Link
      to="/"
      className="group flex flex-col items-start select-none cursor-pointer hover:opacity-90 transition-opacity duration-200"
      aria-label="Swabi Market — Home"
    >
      {/* Main Logo Text */}
      <div className="flex items-center gap-1 leading-none">
        <span className="font-extrabold text-2xl tracking-tight text-[#0F2D4A] uppercase group-hover:text-[#0a4d3c] transition-colors">
          Swabi
        </span>
        <span className="font-extrabold text-2xl tracking-tight text-[#107C41] uppercase">
          Market
        </span>
      </div>

      {/* Tagline */}
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[11px] font-bold tracking-widest text-amber-600 uppercase">
          Buy &amp; Sell
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#0a4d3c]"></span>
        <span className="text-[11px] font-medium text-gray-700 tracking-tight">
          Local Trade
        </span>
      </div>
    </Link>
  );
};
