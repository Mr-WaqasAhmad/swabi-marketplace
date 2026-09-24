import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShimmerEffect } from './ShimmerEffect';
import { supabase } from './supabaseClient';
import { CategorySelector } from './CategorySelector';
import { SEO } from './SEO'; // ✅ ADD

const fetchPostsFromSupabase = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchPostsFromSupabase,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const filteredPosts = posts?.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) return <ShimmerEffect />;

  if (isError) {
    return (
      <div className='min-h-screen flex items-center justify-center text-red-500 font-bold select-none'>
        Data load karne me masla hua!
      </div>
    );
  }

  return (
    <>
      {/* ✅ SEO Tags */}
      <SEO
        title="Buy & Sell Anything in Swabi"
        description="Swabi ka sabse bada online marketplace. Mobiles, gaadiyan, property, electronics aur hazaron cheezein apne elaqay mein khareedein aur bechein. Free ads posting!"
        keywords="Swabi Market, Buy Sell Swabi, Swabi Classifieds, KPK Marketplace, Pakistan Online Bazar, Swabi OLX"
        url="/"
      />

      <main className='w-full min-h-screen mt-21 select-none bg-[#eee]'>
        {/* Search Banner */}
        <section
          className='max-w-6xl mx-auto px-3 sm:px-6 mt-2 sm:mt-4'
          aria-label="Search and filter"
        >
          <div className='w-full bg-[#0a4d3c] text-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden'>
            <h1 className='text-xl sm:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2'>
              Buy & Sell Anything in <span className='text-[#D4AF37]'>Swabi!</span>
            </h1>
            <p className='text-[11px] sm:text-sm text-emerald-100 max-w-md mb-3 sm:mb-6 leading-snug'>
              Find local deals, smartphones, vehicles, real estate and much more directly from sellers near you.
            </p>

            <div className='relative w-full max-w-xl'>
              <label htmlFor="search-input" className="sr-only">Search products</label>
              <input
                id="search-input"
                type="text"
                placeholder='Search items (e.g. Alto, Mobile...)'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full text-gray-800 bg-white border-0 text-xs sm:text-base pl-3.5 pr-10 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all'
              />
              <button
                type="button"
                aria-label="Search"
                className='absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#0a4d3c] hover:bg-[#07382c] text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all cursor-pointer'
              >
                <Search className='w-3.5 h-3.5 sm:w-5 sm:h-5' />
              </button>
            </div>

            <CategorySelector
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
        </section>

        {/* Products Grid */}
        <section
          className='max-w-6xl mx-auto px-3 sm:px-6 mt-5 sm:mt-6 pb-12'
          aria-label="Product listings"
        >
          {filteredPosts?.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm" role="status">
              Koi ad nahi mila!
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4'>
              {filteredPosts?.map((product) => (
                <article
                  key={product.id}
                  className='bg-white border border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group'
                  itemScope
                  itemType="https://schema.org/Product"
                >
                  <div className='relative aspect-square overflow-hidden bg-gray-100 p-2'>
                    <img
                      src={product.image_url || "https://via.placeholder.com/300"}
                      alt={`${product.title} - ${product.category || 'Product'} in ${product.location || 'Swabi'}`}
                      loading='lazy'
                      itemProp="image"
                      className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-300'
                    />
                  </div>

                  <div className='p-2.5 sm:p-3 flex flex-col gap-1.5 flex-1 justify-between'>
                    <div>
                      <h3
                        className='text-xs sm:text-base font-bold text-gray-800 truncate leading-tight'
                        itemProp="name"
                      >
                        {product.title}
                      </h3>
                      <p
                        className='text-[#0a4d3c] font-black text-xs sm:text-base mt-0.5 sm:mt-1'
                        itemProp="price"
                        content={product.price}
                      >
                        PKR {Number(product.price)?.toLocaleString()}
                      </p>
                    </div>

                    <div className='flex flex-col gap-1.5 pt-1.5 border-t border-gray-100 mt-1'>
                      <div className='flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs truncate'>
                        <MapPin className='w-3 h-3 text-red-500 shrink-0' aria-hidden="true" />
                        <span className='truncate font-medium text-gray-600'>
                          {product.location || "Swabi, KP"}
                        </span>
                      </div>

                      <Link
                        to={`/singleproductdetails/${product.id}`}
                        aria-label={`View details of ${product.title}`}
                        className='w-full flex items-center justify-center gap-1 border border-[#0a4d3c] text-[#0a4d3c] hover:bg-[#0a4d3c] hover:text-white font-semibold text-[11px] sm:text-xs py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer'
                      >
                        <Eye className='w-3 h-3 sm:w-3.5 sm:h-3.5' aria-hidden="true" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
};
