import { Search } from 'lucide-react';
import React from 'react';

export const ShimmerEffect = () => {
  const cards = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className='w-full min-h-screen pt-16 pb-12 select-none bg-gray-50'>
      
      {/* Top Banner & Search Bar Area */}
      <div className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>
        <div className='w-full bg-[#0a4d3c] text-white p-6 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden'>
          
          <h1 className='text-xl sm:text-4xl font-extrabold tracking-tight mb-2'>
            Buy & Sell Anything in <span className='text-[#D4AF37]'>Swabi!</span>
          </h1>
          
          <p className='text-xs sm:text-sm text-emerald-100 max-w-md mb-4 sm:mb-6 leading-relaxed'>
            Find local deals, smartphones, vehicles, real estate and much more directly from sellers near you.
          </p>

          {/* Search Input Box */}
          <div className='relative w-full max-w-xl'>
            <input
              type="text"
              placeholder='Search items (e.g. Laptop, Car...)'
              disabled
              className='w-full text-gray-800 bg-white border-0 text-sm sm:text-base pl-4 pr-12 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md outline-none cursor-not-allowed opacity-90'
            />
            <button
              type="button"
              disabled
              className='absolute right-2 top-1/2 -translate-y-1/2 bg-[#0a4d3c] text-white p-2.5 rounded-xl cursor-not-allowed'
            >
              <Search className='w-4 h-4' />
            </button>
          </div>

        </div>
       
      </div>

      {/* Product Cards Shimmer Grid */}
      <div className='max-w-6xl mx-auto px-3 sm:px-6 animate-pulse'>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5'>
          {cards.map((_, i) => (
            <div 
              key={i} 
              className='bg-white border border-gray-200 rounded-2xl p-3 shadow-sm flex flex-col gap-3'
            >
              {/* Product Image Skeleton */}
              <div className='w-full aspect-4/3 bg-gray-300 rounded-xl'></div>

              {/* Title & Price Skeletons */}
              <div className='flex flex-col gap-2 pt-1'>
                <div className='w-3/4 h-4 bg-gray-300 rounded-md'></div>
                <div className='w-1/2 h-5 bg-gray-300 rounded-md'></div>
              </div>

              {/* Location & Date Footer Skeletons */}
              <div className='pt-2 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto'>
                <div className='w-2/3 h-3 bg-gray-300 rounded-md'></div>
                <div className='w-1/4 h-3 bg-gray-300 rounded-md'></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};