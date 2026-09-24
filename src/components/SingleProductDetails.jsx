import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, MessageSquare, Phone, Share2, ShieldCheck, User, User2, Wrench } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ShimmerEffectForSingleItem } from './ShimmerEffectForSingleItem';
import { supabase } from './supabaseClient';
import { useUser } from '../contexts/UserDetailsContext';
import { SEO } from './SEO'; // ✅ ADD

const getData = async (id) => {
  if (!id) return null;

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (postError) throw new Error(postError.message);
  if (!post) return null;

  let sellerDetails = null;
  if (post.user_id) {
    const { data: userData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', post.user_id)
      .maybeSingle();

    if (profileError) console.warn("Profile fetch warning:", profileError.message);
    sellerDetails = userData;
  }

  return {
    ...post,
    full_name: sellerDetails?.full_name || post.full_name,
    phone: sellerDetails?.phone || post.phone,
    location: sellerDetails?.location || sellerDetails?.address || post.location,
    user_details: sellerDetails
  };
};

export const SingleProductDetails = () => {
  const { user } = useUser();
  const firstNameLetter = user?.user_metadata?.full_name?.trim()?.[0];
  const param = useParams();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', param.id],
    queryFn: () => getData(param.id),
    enabled: !!param.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <ShimmerEffectForSingleItem />;

  if (isError || !product) {
    return (
      <div className='min-h-screen flex items-center justify-center text-red-500 font-bold'>
        Product data load hone me issue aaya!
      </div>
    );
  }

  const seller = product?.user_details || {};
  const sellerName = seller.full_name || product?.full_name || "User";
  const sellerPhone = seller.phone || product?.phone || "+92 3XX XXXXXXX";
  const sellerLocation = seller.location || seller.address || product?.location || "Swabi, KP";

  return (
    <>
      {/* ✅ Dynamic SEO Tags for each product */}
      <SEO
        title={`${product?.title} - PKR ${Number(product?.price)?.toLocaleString()}`}
        description={`${product?.title} for sale in ${product?.location || 'Swabi'} at PKR ${product?.price}. ${product?.description?.substring(0, 120)}...`}
        keywords={`${product?.title}, ${product?.category}, buy ${product?.category} Swabi, sell ${product?.category}`}
        image={product?.image_url}
        url={`/singleproductdetails/${param.id}`}
        type="product"
        publishedTime={product?.created_at}
      />

      <main className='w-full min-h-screen bg-gray-50 pt-16 pb-12 select-none'>
        <div className='max-w-6xl mx-auto px-3 sm:px-6 mt-4'>

          {/* Breadcrumb — SEO ke liye ahem */}
          <nav aria-label="Breadcrumb" className='mb-3'>
            <ol className='flex items-center gap-2 text-xs text-gray-500'>
              <li><Link to="/" className='hover:text-[#0a4d3c]'>Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/" className='hover:text-[#0a4d3c]'>{product?.category || 'Products'}</Link></li>
              <li aria-hidden="true">/</li>
              <li className='text-gray-700 font-medium truncate max-w-50'>{product?.title}</li>
            </ol>
          </nav>

          <div className='flex items-center justify-between mb-4'>
            <Link
              to="/"
              className='flex items-center gap-2 text-[#0a4d3c] font-semibold text-sm hover:underline'
            >
              <ArrowLeft className='w-4 h-4' aria-hidden="true" /> Back to Listings
            </Link>
            <div className='flex items-center gap-2 text-gray-600'>
              <button
                aria-label="Share this product"
                className='p-2 bg-white border border-gray-200 rounded-xl hover:text-[#0a4d3c] transition-colors cursor-pointer shadow-sm'
              >
                <Share2 className='w-4 h-4' aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>

            {/* LEFT SECTION */}
            <article className='lg:col-span-8 flex flex-col gap-6'>

              {/* Image */}
              <div className='bg-white border border-gray-200 rounded-3xl p-3 sm:p-4 shadow-sm overflow-hidden'>
                <div className='relative w-full aspect-4/3 sm:aspect-16/10 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center'>
                  {imageLoading && !imageError && (
                    <div className='absolute flex gap-1.5 items-center justify-center z-10'>
                      <div className='w-3.5 h-3.5 rounded-full bg-black animate-bounce'></div>
                      <div className='w-3.5 h-3.5 rounded-full bg-black animate-bounce' style={{ animationDelay: '0.15s' }}></div>
                      <div className='w-3.5 h-3.5 rounded-full bg-black animate-bounce' style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  )}
                  {imageError ? (
                    <div className='text-xs text-gray-400 font-medium'>Image unavailable</div>
                  ) : (
                    <img
                      src={product?.image_url}
                      alt={`${product?.title} for sale in ${product?.location || 'Swabi'}`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => { setImageLoading(false); setImageError(true); }}
                      className={`w-[90%] h-[90%] object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className='bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5'>
                <header className='border-b border-gray-100 pb-5'>
                  <h1 className='text-2xl sm:text-3xl font-black text-gray-900 mt-1'>
                    {product?.title}
                  </h1>

                  <div className='text-2xl sm:text-3xl font-extrabold text-[#0a4d3c] mt-2'>
                    PKR {Number(product?.price)?.toLocaleString()}
                  </div>

                  <address className='flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-3 not-italic'>
                    <MapPin className='w-4 h-4 text-red-500 shrink-0' aria-hidden="true" />
                    <span className='font-medium'>{product?.location}</span>
                  </address>

                  <div className='mt-4 pt-3 border-t border-gray-50'>
                    <div className='flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 text-xs font-bold w-fit'>
                      <Wrench className='w-3.5 h-3.5 text-[#D4AF37]' aria-hidden="true" />
                      <span className='text-amber-900'>Warranty: {product?.warranty || 'No Warranty'}</span>
                    </div>
                  </div>
                </header>

                <section>
                  <h2 className='text-base font-bold text-gray-800 mb-2'>Description</h2>
                  <p className='text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line'>
                    {product?.description}
                  </p>
                </section>

                <div className='bg-[#effffb] border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 mt-2'>
                  <ShieldCheck className='w-5 h-5 text-[#0a4d3c] shrink-0 mt-0.5' aria-hidden="true" />
                  <div className='text-xs text-gray-700'>
                    <strong className='text-[#0a4d3c] block font-bold'>Safety Tip for Swabi Marketplace:</strong>
                    Always inspect the vehicle or item in person before making any payment advance.
                  </div>
                </div>
              </div>
            </article>

            {/* RIGHT SECTION */}
            <aside className='lg:col-span-4 flex flex-col gap-4' aria-label="Seller information">
              <div className='bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col gap-5 sticky top-20'>
                <h2 className='font-bold text-gray-800 text-base border-b pb-3 border-gray-100 flex items-center gap-2'>
                  <User className='w-4 h-4 text-[#0a4d3c]' aria-hidden="true" /> Seller Contact Info
                </h2>

                <div className='flex items-center gap-3.5'>
                  <div className='relative w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border-2 border-[#D4AF37] shadow-sm shrink-0'>
                    <div className="w-full h-full flex justify-center items-center text-[33px] bg-[#3b053d] font-semibold text-white">
                      {sellerName?.trim()?.[0] || <User2 size={24} />}
                    </div>
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900 text-base leading-tight'>{sellerName}</h3>
                    <p className='text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1'>
                      <ShieldCheck className='w-3.5 h-3.5' aria-hidden="true" /> Verified Seller
                    </p>
                  </div>
                </div>

                <div className='flex flex-col gap-2.5 text-xs text-gray-600'>
                  <div className='flex items-center gap-2.5 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-medium'>
                    <Phone className='w-4 h-4 text-[#0a4d3c] shrink-0' aria-hidden="true" />
                    <span>{sellerPhone}</span>
                  </div>
                  <div className='flex items-center gap-2.5 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-medium'>
                    <MapPin className='w-4 h-4 text-[#0a4d3c] shrink-0' aria-hidden="true" />
                    <span>{sellerLocation}</span>
                  </div>
                </div>

                <div className='flex flex-col gap-2.5 pt-2'>
                  <a
                    href={`tel:${sellerPhone}`}
                    aria-label={`Call seller ${sellerName}`}
                    className='w-full flex items-center justify-center gap-2 bg-[#0a4d3c] hover:bg-[#07382c] text-white font-semibold text-sm py-3 px-4 rounded-2xl shadow transition-all cursor-pointer'
                  >
                    <Phone className='w-4 h-4' aria-hidden="true" />
                    <span>Call Seller</span>
                  </a>

                  <Link
  to={`/seller/${product?.user_id}`}
  className='flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium border px-3 py-2 rounded-xl hover:bg-[#D4AF37] transition-all duration-200 text-[#0a4d3c]'
>
  <User2 />
  <span className='hidden sm:inline'>View Seller Profile</span>
</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};
