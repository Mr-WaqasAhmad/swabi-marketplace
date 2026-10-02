import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, ShieldCheck, User, Loader2, MessageCircle, Share2, Check, CheckCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

const getSellerData = async (sellerId) => {
  if (!sellerId) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sellerId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

  // ✅ Saare posts (active + sold)
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', sellerId)
    .order('created_at', { ascending: false });

  if (postsError) throw new Error(postsError.message);

  return { profile, posts: posts || [] };
};

export const SellerProfile = () => {
  const { sellerId } = useParams();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: () => getSellerData(sellerId),
    enabled: !!sellerId,
    staleTime: 0,
    refetchOnMount: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-10 h-10 animate-spin text-[#0a4d3c]" />
      </div>
    );
  }

  if (isError || !data?.profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 font-bold gap-4 pt-16 px-4">
        <p>Seller profile load nahi ho saki!</p>
        <Link to="/home" className="text-[#0a4d3c] hover:underline text-sm">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const { profile, posts } = data;

  // ✅ Active aur Sold alag karein
  const activePosts = posts.filter(p => p.status === 'active' || !p.status);
  const soldPosts = posts.filter(p => p.status === 'sold');

  const sellerName = profile.full_name || 'User';
  const sellerPhone = profile.phone || 'Not provided';
  const sellerWhatsapp = profile.whatsapp || null;
  const sellerLocation = profile.location || 'Swabi, KP';
  const firstLetter = sellerName.trim()?.[0]?.toUpperCase();

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

Main ne aap ki profile *Swabi Market* par dekhi hai.

Aap ki products dekh kar mujhe interest hua. 
Kya aap se koi deal ho sakti hai?

Mujhe aap ki products ke baare mein maloomat chahiye.

Shukriya! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleaned}?text=${encodedMessage}`;
  };

  const whatsappLink = getWhatsappLink(sellerWhatsapp);

  const handleShare = async () => {
    const shareUrl = `https://skpk.vercel.app/seller/${sellerId}`;
    const shareData = {
      title: `${sellerName} - Swabi Market`,
      text: `${sellerName} ki profile Swabi Market par dekhein. ${activePosts.length} active ads.`,
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
    <main className="w-full min-h-screen bg-gray-50 pt-20 pb-12 select-none">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">

        {/* Back + Share Bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-[#0a4d3c] font-semibold text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Listings
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this seller profile"
              className={`relative p-2 border rounded-xl transition-all cursor-pointer shadow-sm ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-gray-200 hover:text-[#0a4d3c] hover:border-[#0a4d3c]'
              }`}
            >
              {copied ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Share2 className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {copied && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-pulse">
                ✓ Link copied!
              </span>
            )}
          </div>
        </div>

        {/* Seller Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#3b053d] flex items-center justify-center text-5xl font-bold text-white shrink-0 border-4 border-[#D4AF37]">
              {firstLetter || <User className="w-12 h-12" />}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {sellerName}
              </h1>
              <p className="text-sm text-emerald-700 font-semibold flex items-center justify-center sm:justify-start gap-1.5 mb-4">
                <ShieldCheck className="w-4 h-4" /> Verified Seller
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-600 max-w-md mx-auto sm:mx-0">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                  <Phone className="w-4 h-4 text-[#0a4d3c] shrink-0" />
                  <span>{sellerPhone}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                  <MapPin className="w-4 h-4 text-[#0a4d3c] shrink-0" />
                  <span>{sellerLocation}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4 max-w-md mx-auto sm:mx-0">
                <div className="bg-[#effffb] border border-emerald-200 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-[#0a4d3c]">{activePosts.length}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Active Ads</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-red-600">{soldPosts.length}</p>
                  <p className="text-[10px] text-red-600 font-medium">Sold</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 max-w-md mx-auto sm:mx-0">
                {sellerPhone && sellerPhone !== 'Not provided' && (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0a4d3c] hover:bg-[#07382c] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    Call Seller
                  </a>
                )}

                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FA855] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Seller
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Active Ads Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {sellerName}'s Active Ads
          </h2>
          <span className="text-sm font-medium text-[#0a4d3c] bg-[#effffb] px-3 py-1 rounded-full border border-[#0a4d3c]/20">
            Total: {activePosts.length}
          </span>
        </div>

        {activePosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-semibold text-sm bg-white rounded-2xl border border-gray-200 mb-8">
            Is seller ki koi active ad nahi hai.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {activePosts.map((product) => (
              <Link
                key={product.id}
                to={`/singleproductdetails/${product.id}`}
                className="bg-white border border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100 p-2">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/300'}
                    alt={product.title}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5 sm:p-3 flex flex-col gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                    {product.title}
                  </h3>
                  <p className="text-[#0a4d3c] font-black text-xs sm:text-sm">
                    PKR {Number(product.price)?.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs truncate">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    <span className="truncate">{product.location || 'Swabi'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ✅ Sold Ads Section (agar koi sold hai to) */}
        {soldPosts.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  {sellerName}'s Sold Ads
                </h2>
              </div>
              <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                Total: {soldPosts.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {soldPosts.map((product) => (
                <Link
                  key={product.id}
                  to={`/singleproductdetails/${product.id}`}
                  className="bg-white border border-red-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group opacity-90"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100 p-2">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300'}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-contain grayscale group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* ✅ SOLD Badge */}
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      SOLD
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3 flex flex-col gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                      {product.title}
                    </h3>
                    <p className="text-gray-400 font-black text-xs sm:text-sm line-through">
                      PKR {Number(product.price)?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs truncate">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{product.location || 'Swabi'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>
    </main>
  );
};
