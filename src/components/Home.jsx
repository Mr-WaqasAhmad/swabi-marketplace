import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, ArrowUpDown, ChevronDown, Eye, Star, ArrowUp, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShimmerEffect } from './ShimmerEffect';
import { supabase } from './supabaseClient';
import { categories, getCategoryIcon } from './CategorySelector';
import { SEO } from './SEO';

const fetchPostsFromSupabase = async () => {
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (postsError) throw new Error(postsError.message);
  if (!postsData || postsData.length === 0) return [];

  const postIds = postsData.map((p) => p.id);

  const { data: ratingsData, error: ratingsError } = await supabase
    .from('ratings')
    .select('post_id, rating')
    .in('post_id', postIds);

  if (ratingsError) console.warn('Ratings fetch warning:', ratingsError.message);

  const ratingsMap = {};
  (ratingsData || []).forEach((r) => {
    if (!ratingsMap[r.post_id]) {
      ratingsMap[r.post_id] = { total: 0, count: 0 };
    }
    ratingsMap[r.post_id].total += r.rating;
    ratingsMap[r.post_id].count += 1;
  });

  return postsData.map((post) => {
    const stats = ratingsMap[post.id];
    return {
      ...post,
      avgRating: stats ? stats.total / stats.count : 0,
      totalRatings: stats ? stats.count : 0,
    };
  });
};

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchPostsFromSupabase,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const categoryCounts = useMemo(() => {
    if (!posts) return {};
    return posts.reduce((acc, post) => {
      if (post.category) {
        acc[post.category] = (acc[post.category] || 0) + 1;
      }
      return acc;
    }, {});
  }, [posts]);

  // ✅ Active Categories — sirf jinme ads hain
  const activeCategories = useMemo(() => {
    if (!posts) return [];
    return categories.filter((cat) => (categoryCounts[cat] || 0) > 0);
  }, [posts, categoryCounts]);

  const isNewProduct = (createdAt) => {
    if (!createdAt) return false;
    const productDate = new Date(createdAt);
    const now = new Date();

    return (
      productDate.getDate() === now.getDate() &&
      productDate.getMonth() === now.getMonth() &&
      productDate.getFullYear() === now.getFullYear()
    );
  };

  const getProductAge = (createdAt) => {
    if (!createdAt) return '';

    const productDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now - productDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInWeeks === 1) return '1 week ago';
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    if (diffInMonths === 1) return '1 month ago';
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    if (diffInYears === 1) return '1 year ago';
    return `${diffInYears} years ago`;
  };

  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    let filtered = posts.filter((post) => {
      const matchesSearch =
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'top-rated':
        filtered.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      default:
        break;
    }

    return filtered;
  }, [posts, searchQuery, selectedCategory, sortBy]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Viewed' },
    { value: 'top-rated', label: 'Top Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || 'Newest First';

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
      <SEO
        title="Buy & Sell Anything in Swabi"
        description="Swabi ka sabse bada online marketplace. Mobiles, gaadiyan, property, electronics aur hazaron cheezein apne elaqay mein khareedein aur bechein. Free ads posting!"
        keywords="Swabi Market, Buy Sell Swabi, Swabi Classifieds, KPK Marketplace, Pakistan Online Bazar, Swabi OLX"
        url="/"
      />

      <main className='w-full min-h-screen pt-18 select-none bg-[#eee]'>
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
          </div>
        </section>

        {/* ✅ CATEGORY CHIPS ROW — Sirf Ek Category Filter */}
        <section className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>
          <div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
            {/* ✅ All Chip */}
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-[#0a4d3c] text-white border-[#0a4d3c] shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#0a4d3c] hover:text-[#0a4d3c]'
              }`}
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${selectedCategory === '' ? 'text-[#D4AF37]' : 'text-[#0a4d3c]'}`} />
              <span>All</span>
              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                selectedCategory === ''
                  ? 'bg-[#D4AF37] text-[#0a4d3c]'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {posts?.length || 0}
              </span>
            </button>

            {/* ✅ Category Chips — Saari jinke ads hain */}
            {activeCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0a4d3c] text-white border-[#0a4d3c] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#0a4d3c] hover:text-[#0a4d3c]'
                  }`}
                >
                  <span className={isActive ? 'text-[#D4AF37]' : 'text-[#0a4d3c]'}>
                    {getCategoryIcon(cat, 'w-3.5 h-3.5')}
                  </span>
                  <span className='max-w-30 truncate'>{cat}</span>
                  <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#0a4d3c]'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Total Products Stats Bar */}
        <section className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>
          <div className='flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-emerald-500'></span>
              <span className='text-xs sm:text-sm font-semibold text-gray-700'>
                Total <span className='text-[#0a4d3c] font-bold'>{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'Product' : 'Products'} Available
              </span>
            </div>

            {filteredPosts.filter(p => isNewProduct(p.created_at)).length > 0 && (
              <div className='flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span>
                <span className='text-[10px] sm:text-xs font-bold text-emerald-700'>
                  {filteredPosts.filter(p => isNewProduct(p.created_at)).length} NEW
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Sort Bar */}
        <section className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>
          <div className='flex items-center justify-end gap-2'>
            <div className='relative'>
              <button
                type="button"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className='flex items-center gap-1.5 bg-white border border-gray-300 hover:border-[#0a4d3c] text-gray-700 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl shadow-sm transition-all cursor-pointer'
              >
                <ArrowUpDown className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0a4d3c]' />
                <span className='hidden sm:inline'>{currentSortLabel}</span>
                <span className='sm:hidden'>Sort</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                    showSortMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showSortMenu && (
                <>
                  <div
                    className='fixed inset-0 z-40'
                    onClick={() => setShowSortMenu(false)}
                  />

                  <div className='absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden'>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          sortBy === option.value
                            ? 'bg-[#effffb] text-[#0a4d3c] font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.value && (
                          <span className='w-2 h-2 rounded-full bg-[#0a4d3c]'></span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section
          className='max-w-6xl mx-auto px-3 sm:px-6 mt-4 pb-12'
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

                    {isNewProduct(product.created_at) && (
                      <div className='absolute top-2 left-2 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1 z-10'>
                        <span className='w-1.5 h-1.5 rounded-full bg-white animate-pulse'></span>
                        NEW
                      </div>
                    )}

                    <div className='absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-gray-700 px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold shadow-md flex items-center gap-1 z-10 border border-gray-200'>
                      <Eye className='w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0a4d3c]' aria-hidden="true" />
                      <span>{product.views || 0}</span>
                    </div>

                    <div className='absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-md pointer-events-none flex items-center gap-1'>
                      <span className='w-1 h-1 rounded-full bg-[#D4AF37]'></span>
                      Swabi Market
                    </div>
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

                      {product.totalRatings > 0 && (
                        <div className='flex items-center gap-1 mt-0.5'>
                          <Star className='w-3 h-3 fill-[#D4AF37] text-[#D4AF37] shrink-0' aria-hidden="true" />
                          <span className='text-[10px] sm:text-xs font-bold text-gray-700'>
                            {product.avgRating.toFixed(1)}
                          </span>
                          <span className='text-[9px] sm:text-[10px] text-gray-400 font-medium'>
                            ({product.totalRatings})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className='flex flex-col gap-1.5 pt-1.5 border-t border-gray-100 mt-1'>
                      <div className='flex items-center justify-between gap-1 text-gray-500 text-[10px] sm:text-xs'>
                        <div className='flex items-center gap-1 truncate'>
                          <MapPin className='w-3 h-3 text-red-500 shrink-0' aria-hidden="true" />
                          <span className='truncate font-medium text-gray-600'>
                            {product.location || "Swabi, KP"}
                          </span>
                        </div>
                        <span className='text-gray-400 font-medium shrink-0'>
                          {getProductAge(product.created_at)}
                        </span>
                      </div>

                      <Link
                        to={`/singleproductdetails/${product.id}?ref=home`}
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

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#0a4d3c] hover:bg-[#D4AF37] text-white hover:text-[#0a4d3c] shadow-lg hover:shadow-xl border border-white/20 transition-all duration-300 cursor-pointer ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={2.5} />
      </button>
    </>
  );
};
