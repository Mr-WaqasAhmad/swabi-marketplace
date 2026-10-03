import React from 'react';
import { Tag } from 'lucide-react';

export const categories = [
  "Antiques and collectibles",
  "Appliances",
  "Arts & crafts",
  "Baby & children",
  "Bags & luggage",
  "Bicycles",
  "Books, films & music",
  "Car parts",
  "Electronics & computers",
  "Mobile phones & Tablets",
  "Furniture",
  "Garage sale",
  "Garden",
  "Health & beauty",
  "Household",
  "Jewellery and accessories",
  "Men's clothing & shoes",
  "Women's clothing & shoes",
  "Miscellaneous",
  "Musical Instruments",
  "Pet supplies",
  "Property for sale",
  "Property to rent",
  "Sport and outdoors",
  "Tools",
  "Video Games",
  "Vehicles",
  "Services & Jobs",
];

export const CategorySelector = ({ value, onChange, categoryCounts = {} }) => {
  // ✅ Total active products count
  const totalCount = Object.values(categoryCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className='relative w-full max-w-xl mt-3'>
      <Tag className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#0a4d3c] pointer-events-none z-10' />

      <select
        name="category"
        value={value}
        onChange={onChange}
        className='w-full appearance-none bg-white text-gray-800 text-xs sm:text-base pl-10 pr-10 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all cursor-pointer font-medium'
      >
        {/* ✅ All Categories with total count */}
        <option value="">
          All Categories
        </option>

        {categories.map((cat, index) => {
          const count = categoryCounts[cat] || 0;
          return (
            <option key={index} value={cat}>
              {cat} {count > 0 ? `(${count})` : ''}
            </option>
          );
        })}
      </select>

      {/* Custom Dropdown Arrow */}
      <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
        <svg
          className='w-4 h-4 text-gray-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </div>
    </div>
  );
};
