import { ArrowLeft, Home, Compass, AlertCircle } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className='w-full min-h-screen bg-linear-to-br from-slate-900 via-[#07251e] to-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden select-none'>
      
      {/* 2026 Futuristic Background Glow Elements */}
      <div className='absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-87.5 sm:w-125 h-87.5 sm:h-125 bg-[#0a4d3c]/30 rounded-full blur-[120px] pointer-events-none'></div>
      <div className='absolute bottom-10 right-10 w-50 sm:w-75 h-50] sm:h-75 bg-[#D4AF37]/15 rounded-full blur-[100px] pointer-events-none'></div>

      {/* Main Glassmorphism Card */}
      <div className='relative z-10 max-w-lg w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center text-center'>
        
        {/* Glowing 404 Badge */}
        <div className='relative mb-4'>
          <h1 className='text-8xl sm:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-200 to-[#D4AF37] drop-shadow-lg animate-pulse'>
            404
          </h1>
          <div className='absolute -top-3 -right-3 bg-[#D4AF37] text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1'>
            <AlertCircle className='w-3 h-3' /> Lost Route
          </div>
        </div>

        {/* Message Headings */}
        <h2 className='text-xl sm:text-2xl font-bold text-gray-100 mb-2'>
          Oops! Page Not Found
        </h2>
        <p className='text-xs sm:text-sm text-gray-300 max-w-sm mb-8 leading-relaxed'>
          Aap jo URL dhoond rahe hain wo majood nahi hai ya remove kar diya gaya hai. Swabi Market me wapas ja kar search karein!
        </p>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row items-center gap-3 w-full'>
          <button
            onClick={() => navigate(-1)}
            className='w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-3 px-5 rounded-2xl border border-white/15 transition-all cursor-pointer backdrop-blur-sm'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className='w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#0a4d3c] to-[#0f6852] hover:from-[#083c2f] hover:to-[#0c5644] text-white text-sm font-semibold py-3 px-5 rounded-2xl shadow-lg transition-all cursor-pointer border border-emerald-500/30'
          >
            <Home className='w-4 h-4' />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Footer info tag */}
        <div className='mt-8 pt-4 border-t border-white/10 w-full flex items-center justify-center gap-1.5 text-xs text-emerald-400/80 font-mono'>
          <Compass className='w-3.5 h-3.5 animate-spin' />
          <span>Swabi Marketplace • Navigation Engine</span>
        </div>

      </div>

    </div>
  );
};