import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, ArrowUpDown, ChevronDown, Eye, Star, ArrowUp, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShimmerEffect } from './ShimmerEffect';
import { supabase } from './supabaseClient';
import { categories, getCategoryIcon } from './CategorySelector';
import { SEO } from './SEO';

// ============================================
// ✅ FETCH
// ============================================
const fetchPostsFromSupabase = async () => {
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('id, title, price, category, location, image_url, views, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(30);

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

// ============================================
// ✅ HELPERS
// ============================================
const getProductAge = (createdAt) => {
  if (!createdAt) return '';

  const productDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - productDate;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);
  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInMinutes < 1) return 'Now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d`;
  if (diffInWeeks < 4) return `${diffInWeeks}w`;
  return new Date(createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
};

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

// ============================================
// ✅ PRODUCT CARD (Optimized + Uniform Eye Box)
// ============================================
const ProductCard = memo(({ product }) => {
  const isNew = isNewProduct(product.created_at);

  return (
    <article
      className='bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col'
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* ✅ Image container — fixed height */}
      <div className='relative w-full h-36 sm:h-44 overflow-hidden pt-2 bg-gray-50'>
        <img
          src={product.image_url || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="}
          alt={product.title}
          loading='lazy'
          decoding='async'
          fetchPriority='low'
          itemProp="image"
          width="300"
          height="300"
          className='w-full h-full object-contain rounded'
        />

        {isNew && (
          <div className='absolute top-1.5 left-1.5 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold z-10'>
            NEW
          </div>
        )}

        {/* ✅ Uniform Views Box — Same size, aligned right */}
        <div className='absolute top-1.5 right-1.5 bg-white/95 text-gray-700 h-5 px-1.5 rounded flex items-center gap-0.5 text-[9px] font-bold z-10 border border-gray-200 leading-none'>
          <Eye className='w-2.5 h-2.5 text-[#0a4d3c] shrink-0' />
          <span className='leading-none pt-px'>{product.views || 0}</span>
        </div>
      </div>

      <div className='p-2 sm:p-2.5 flex flex-col gap-1 flex-1 justify-between'>
        <div>
          <h3
            className='text-[11px] sm:text-sm font-bold text-gray-800 truncate leading-tight'
            itemProp="name"
          >
            {product.title}
          </h3>
          <p
            className='text-[#0a4d3c] font-black text-[11px] sm:text-sm mt-0.5'
            itemProp="price"
            content={product.price}
          >
            PKR {Number(product.price)?.toLocaleString()}
          </p>

          {product.totalRatings > 0 && (
            <div className='flex items-center gap-0.5 mt-0.5'>
              <Star className='w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]' />
              <span className='text-[9px] sm:text-[10px] font-bold text-gray-700'>
                {product.avgRating.toFixed(1)}
              </span>
              <span className='text-[8px] sm:text-[9px] text-gray-400'>
                ({product.totalRatings})
              </span>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-1 pt-1 border-t border-gray-100 mt-0.5'>
          <div className='flex items-center justify-between gap-1 text-gray-500 text-[9px] sm:text-[10px]'>
            <div className='flex items-center gap-0.5 truncate'>
              <MapPin className='w-2.5 h-2.5 text-red-500 shrink-0' />
              <span className='truncate font-medium text-gray-600'>
                {product.location || "Swabi"}
              </span>
            </div>
            <span className='text-gray-400 font-medium shrink-0'>
              {getProductAge(product.created_at)}
            </span>
          </div>

          <Link
            to={`/singleproductdetails/${product.id}?ref=home`}
            className='w-full flex items-center justify-center gap-1 border border-[#0a4d3c] text-[#0a4d3c] font-semibold text-[10px] sm:text-xs py-1.5 rounded-lg'
          >
            <Eye className='w-3 h-3' />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';

// ============================================
// ✅ CATEGORY CHIP (memoized)
// ============================================
const CategoryChip = memo(({ category, isActive, count, onClick }) => {
  const hasAds = count > 0;

  return (
    <button
      type='button'
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer ${
        isActive
          ? 'bg-[#0a4d3c] text-white border-[#0a4d3c]'
          : hasAds
            ? 'bg-white text-gray-700 border-gray-200'
            : 'bg-white text-gray-400 border-gray-200'
      }`}
    >
      <span className={isActive ? 'text-[#D4AF37]' : hasAds ? 'text-[#0a4d3c]' : 'text-gray-400'}>
        {getCategoryIcon(category, 'w-3.5 h-3.5')}
      </span>
      <span className='max-w-30 truncate'>{category}</span>
      <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        isActive
          ? 'bg-[#D4AF37] text-[#0a4d3c]'
          : hasAds
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-400'
      }`}>
        {count}
      </span>
    </button>
  );
});

CategoryChip.displayName = 'CategoryChip';

// ============================================
// ✅ MAIN COMPONENT
// ============================================
export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // ✅ Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ Scroll — passive, rAF
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 400;
          setShowBackToTop((prev) => (prev !== shouldShow ? shouldShow : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchPostsFromSupabase,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
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

  const sortedCategories = useMemo(() => {
    const withAds = [];
    const withoutAds = [];

    categories.forEach((cat) => {
      if ((categoryCounts[cat] || 0) > 0) {
        withAds.push(cat);
      } else {
        withoutAds.push(cat);
      }
    });

    withAds.sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));

    return [...withAds, ...withoutAds];
  }, [categoryCounts]);

  const visibleCategories = useMemo(() => {
    return showAllCategories ? sortedCategories : sortedCategories.slice(0, 8);
  }, [showAllCategories, sortedCategories]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    const search = debouncedSearch.toLowerCase().trim();

    let filtered = posts.filter((post) => {
      if (!search && !selectedCategory) return true;

      const matchesSearch =
        !search ||
        post.title?.toLowerCase().includes(search) ||
        post.category?.toLowerCase().includes(search) ||
        post.location?.toLowerCase().includes(search);

      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy !== 'newest') {
      switch (sortBy) {
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
    }

    return filtered;
  }, [posts, debouncedSearch, selectedCategory, sortBy]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Viewed' },
    { value: 'top-rated', label: 'Top Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || 'Newest First';

  const newProductsCount = useMemo(
    () => filteredPosts.filter((p) => isNewProduct(p.created_at)).length,
    [filteredPosts]
  );

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
        <section className='max-w-6xl mx-auto px-3 sm:px-6 mt-2 sm:mt-4'>
          <div className='w-full bg-[#0a4d3c] text-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col items-center justify-center text-center'>
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
                placeholder='Search items...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full text-gray-800 bg-white border-0 text-xs sm:text-base pl-3.5 pr-10 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md outline-none'
              />
              <button
                type="button"
                aria-label="Search"
                className='absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#0a4d3c] text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl'
              >
                <Search className='w-3.5 h-3.5 sm:w-5 sm:h-5' />
              </button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-[11px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider'>
              Categories
            </h3>
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className='text-[11px] sm:text-xs font-bold text-[#0a4d3c] cursor-pointer flex items-center gap-1'
            >
              {showAllCategories ? 'Show Less' : `Show All (${categories.length})`}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showAllCategories ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          <div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin'>
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-[#0a4d3c] text-white border-[#0a4d3c]'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${selectedCategory === '' ? 'text-[#D4AF37]' : 'text-[#0a4d3c]'}`} />
              <span>All</span>
              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                selectedCategory === '' ? 'bg-[#D4AF37] text-[#0a4d3c]' : 'bg-gray-100 text-gray-600'
              }`}>
                {posts?.length || 0}
              </span>
            </button>

            {visibleCategories.map((cat) => (
              <CategoryChip
                key={cat}
                category={cat}
                isActive={selectedCategory === cat}
                count={categoryCounts[cat] || 0}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}

            {!showAllCategories && sortedCategories.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllCategories(true)}
                className='shrink-0 text-[11px] sm:text-xs font-bold text-[#0a4d3c] px-3 py-1.5 rounded-full border-2 border-dashed border-[#0a4d3c]/40 cursor-pointer'
              >
                +{sortedCategories.length - 8} more
              </button>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>
          <div className='flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-emerald-500'></span>
              <span className='text-xs sm:text-sm font-semibold text-gray-700'>
                Total <span className='text-[#0a4d3c] font-bold'>{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'Product' : 'Products'}
              </span>
            </div>

            {newProductsCount > 0 && (
              <div className='flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span>
                <span className='text-[10px] sm:text-xs font-bold text-emerald-700'>
                  {newProductsCount} NEW
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Sort */}
        <section className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>
          <div className='flex items-center justify-end gap-2'>
            <div className='relative'>
              <button
                type="button"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className='flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl shadow-sm cursor-pointer'
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
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium cursor-pointer flex items-center justify-between ${
                          sortBy === option.value
                            ? 'bg-[#effffb] text-[#0a4d3c] font-bold'
                            : 'text-gray-700'
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

        {/* Products */}
        <section
          className='max-w-6xl mx-auto px-3 sm:px-6 mt-4 pb-12'
          aria-label="Product listings"
        >
          {filteredPosts?.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm" role="status">
              {selectedCategory
                ? `"${selectedCategory}" mein abhi koi ad nahi hai.`
                : 'Koi ad nahi mila!'}
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4'>
              {filteredPosts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Back to Top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#0a4d3c] text-white shadow-lg border border-white/20 cursor-pointer ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ transition: 'opacity 0.2s, transform 0.2s' }}
      >
        <ArrowUp className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={2.5} />
      </button>
    </>
  );
};
