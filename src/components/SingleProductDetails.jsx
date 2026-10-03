import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Share2, ShieldCheck, User, User2, Wrench, MessageCircle, Check, Eye, ShoppingCart, Flag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ShimmerEffectForSingleItem } from './ShimmerEffectForSingleItem';
import { supabase } from './supabaseClient';
import { OrderModal } from './OrderModal';
import { ReportModal } from './ReportModal';
import { SEO } from './SEO';

const getData = async (id) => {
  if (!id) return null;

  // 1. Post fetch karein
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (postError) throw new Error(postError.message);
  if (!post) return null;

  // 2. Seller details fetch karein
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

  // 3. Similar products fetch karein
  let similarProducts = [];
  if (post.category) {
    const { data: similar, error: similarError } = await supabase
      .from('posts')
      .select('*')
      .eq('category', post.category)
      .eq('status', 'active')
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(4);

    if (similarError) console.warn("Similar products fetch warning:", similarError.message);
    similarProducts = similar || [];
  }

  return {
    ...post,
    full_name: sellerDetails?.full_name || post.full_name,
    phone: sellerDetails?.phone || post.phone,
    whatsapp: sellerDetails?.whatsapp || null,
    location: sellerDetails?.location || sellerDetails?.address || post.location,
    user_details: sellerDetails,
    similar_products: similarProducts,
  };
};

export const SingleProductDetails = () => {
  const param = useParams();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

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
  const sellerWhatsapp = seller.whatsapp || product?.whatsapp || null;
  const sellerLocation = seller.location || seller.address || product?.location || "Swabi, KP";

  const isSold = product?.status === 'sold';
  const similarProducts = product?.similar_products || [];

  // WhatsApp Link
  const getWhatsappLink = (whatsapp) => {
    if (!whatsapp) return null;

    let cleaned = whatsapp.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '92' + cleaned.slice(1);
    }
    if (!cleaned.startsWith('92')) {
      cleaned = '92' + cleaned;
    }

    const message = `Assalam o Alaikum ${sellerName}!

Main ne aapki yeh product *Swabi Market* par dekhi hai:

━━━━━━━━━━━━━━━━━━━━
📦 *PRODUCT DETAILS*
━━━━━━━━━━━━━━━━━━━━

*Title:* ${product?.title || 'N/A'}
*Price:* PKR ${Number(product?.price)?.toLocaleString() || 'N/A'}
*Category:* ${product?.category || 'N/A'}
*Warranty:* ${product?.warranty || 'No Warranty'}
*Location:* ${product?.location || 'Swabi'}

📝 *Description:*
${product?.description || 'N/A'}

━━━━━━━━━━━━━━━━━━━━

Kya yeh product abhi bhi available hai? 
Mujhe iske baare mein aur maloomat chahiye.

Shukriya! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleaned}?text=${encodedMessage}`;
  };

  const whatsappLink = getWhatsappLink(sellerWhatsapp);

  // Share Handler
  const handleShare = async () => {
    const shareUrl = `https://skpk.vercel.app/singleproductdetails/${param.id}`;
    const shareData = {
      title: product?.title || 'Swabi Market',
      text: `${product?.title} - PKR ${Number(product?.price)?.toLocaleString()}\n\nDekhein Swabi Market par:`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (clipErr) {
          console.error('Clipboard error:', clipErr);
        }
      }
    }
  };

  return (
    <>
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

          {/* Breadcrumb */}
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
                type="button"
                onClick={handleShare}
                aria-label="Share this product"
                className={`relative p-2 border rounded-xl transition-all cursor-pointer shadow-sm ${
                  copied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-gray-200 hover:text-[#0a4d3c] hover:border-[#0a4d3c]'
                }`}
              >
                {copied ? (
                  <Check className='w-4 h-4' aria-hidden="true" />
                ) : (
                  <Share2 className='w-4 h-4' aria-hidden="true" />
                )}
              </button>

              {copied && (
                <span className='text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-pulse'>
                  ✓ Link copied!
                </span>
              )}
            </div>
          </div>

          {/* SOLD Alert */}
          {isSold && (
            <div className='mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm'>
              <div className='bg-red-600 text-white p-2 rounded-full shrink-0'>
                <Check className='w-5 h-5' strokeWidth={3} />
              </div>
              <div>
                <h2 className='font-bold text-red-700 text-base sm:text-lg'>
                  Yeh Product Bik Gaya Hai!
                </h2>
                <p className='text-xs sm:text-sm text-red-600 mt-1 leading-relaxed'>
                  Yeh ad seller ne <strong>"Sold"</strong> mark kar di hai. Aap is product se related aur products dekh sakte hain ya <Link to="/home" className='underline font-semibold'>Home page</Link> par wapas jayein.
                </p>
              </div>
            </div>
          )}

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
                      className={`w-[90%] h-[90%] object-contain transition-opacity duration-300 ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                      } ${isSold ? 'grayscale opacity-80' : ''}`}
                    />
                  )}

                  {isSold && (
                    <div className='absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2'>
                      <Check className='w-4 h-4' strokeWidth={3} />
                      SOLD
                    </div>
                  )}

                  {/* Watermark */}
                  <div className='absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-md pointer-events-none flex items-center gap-1'>
                    <span className='w-1 h-1 rounded-full bg-[#D4AF37]'></span>
                    Swabi Market
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className='bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5'>
                <header className='border-b border-gray-100 pb-5'>
                  <h1 className='text-2xl sm:text-3xl font-black text-gray-900 mt-1'>
                    {product?.title}
                  </h1>

                  <div className={`text-2xl sm:text-3xl font-extrabold mt-2 ${
                    isSold ? 'text-gray-400 line-through' : 'text-[#0a4d3c]'
                  }`}>
                    PKR {Number(product?.price)?.toLocaleString()}
                  </div>

                  <address className='flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-3 not-italic'>
                    <MapPin className='w-4 h-4 text-red-500 shrink-0' aria-hidden="true" />
                    <span className='font-medium'>{product?.location}</span>
                  </address>

                  <div className='mt-4 pt-3 border-t border-gray-50 flex flex-wrap items-center gap-3'>
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
                  {isSold ? (
                    <>
                      <div className='w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-semibold text-sm py-3 px-4 rounded-2xl cursor-not-allowed border border-gray-200'>
                        <Phone className='w-4 h-4' aria-hidden="true" />
                        <span>Product Sold</span>
                      </div>
                      <div className='w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-semibold text-sm py-3 px-4 rounded-2xl cursor-not-allowed border border-gray-200'>
                        <MessageCircle className='w-4 h-4' aria-hidden="true" />
                        <span>Product Sold</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <a
                        href={`tel:${sellerPhone}`}
                        aria-label={`Call seller ${sellerName}`}
                        className='w-full flex items-center justify-center gap-2 bg-[#0a4d3c] hover:bg-[#07382c] text-white font-semibold text-sm py-3 px-4 rounded-2xl shadow transition-all cursor-pointer'
                      >
                        <Phone className='w-4 h-4' aria-hidden="true" />
                        <span>Call Seller</span>
                      </a>

                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp seller ${sellerName}`}
                          className='w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FA855] text-white font-semibold text-sm py-3 px-4 rounded-2xl shadow transition-all cursor-pointer'
                        >
                          <MessageCircle className='w-4 h-4' aria-hidden="true" />
                          <span>WhatsApp Seller</span>
                        </a>
                      )}

                      {/* Order Now Button */}
                      <button
                        type='button'
                        onClick={() => setShowOrderModal(true)}
                        className='w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b8962e] text-[#0a4d3c] font-bold text-sm py-3 px-4 rounded-2xl shadow-md transition-all cursor-pointer'
                      >
                        <ShoppingCart className='w-4 h-4' aria-hidden="true" />
                        <span>Order Now</span>
                      </button>
                    </>
                  )}

                  <Link
                    to={`/seller/${product?.user_id}`}
                    className='flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium border px-3 py-2 rounded-xl hover:bg-[#D4AF37] transition-all duration-200 text-[#0a4d3c]'
                  >
                    <User2 />
                    <span>View Seller Profile</span>
                  </Link>

                  {/* Report Ad Button */}
                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className='flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-200 text-red-600 cursor-pointer'
                  >
                    <Flag className='w-3.5 h-3.5' />
                    <span>Report This Ad</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {/* SIMILAR PRODUCTS SECTION */}
          {similarProducts.length > 0 && (
            <section className='mt-12 pt-8 border-t border-gray-200' aria-label="Similar products">
              <div className='flex items-center justify-between mb-5'>
                <div>
                  <h2 className='text-xl sm:text-2xl font-bold text-gray-800'>
                    Similar Products
                  </h2>
                  <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                    Same category ke aur products
                  </p>
                </div>
                <Link
                  to="/home"
                  className='text-xs sm:text-sm font-semibold text-[#0a4d3c] hover:underline flex items-center gap-1'
                >
                  View All <ArrowLeft className='w-3.5 h-3.5 rotate-180' />
                </Link>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4'>
                {similarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct.id}
                    to={`/singleproductdetails/${similarProduct.id}?ref=similar`}
                    className='bg-white border border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group'
                  >
                    <div className='relative aspect-square overflow-hidden bg-gray-100 p-2'>
                      <img
                        src={similarProduct.image_url || "https://via.placeholder.com/300"}
                        alt={similarProduct.title}
                        loading="lazy"
                        className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-300'
                      />
                    </div>

                    <div className='p-2.5 sm:p-3 flex flex-col gap-1.5'>
                      <h3 className='text-xs sm:text-sm font-bold text-gray-800 truncate'>
                        {similarProduct.title}
                      </h3>
                      <p className='text-[#0a4d3c] font-black text-xs sm:text-sm'>
                        PKR {Number(similarProduct.price)?.toLocaleString()}
                      </p>
                      <div className='flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs truncate'>
                        <MapPin className='w-3 h-3 text-red-500 shrink-0' />
                        <span className='truncate'>{similarProduct.location || 'Swabi'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* ✅ Order Modal */}
      {!isSold && sellerWhatsapp && (
        <OrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          product={product}
          sellerName={sellerName}
          sellerWhatsapp={sellerWhatsapp}
        />
      )}

      {/* ✅ Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        product={product}
        sellerName={sellerName}
        sellerPhone={sellerPhone}
        sellerLocation={sellerLocation}
      />
    </>
  );
};
