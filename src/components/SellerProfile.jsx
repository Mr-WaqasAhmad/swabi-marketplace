import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, ShieldCheck, User, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const getSellerData = async (sellerId) => {
  if (!sellerId) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sellerId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

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
  const sellerName = profile.full_name || 'User';
  const sellerPhone = profile.phone || 'Not provided';
  const sellerLocation = profile.location || 'Swabi, KP';
  const firstLetter = sellerName.trim()?.[0]?.toUpperCase();

  return (
    <main className="w-full min-h-screen bg-gray-50 pt-20 pb-12 select-none">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">

        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-[#0a4d3c] font-semibold text-sm hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>

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

              {sellerPhone && sellerPhone !== 'Not provided' && (
                <a
                  href={`tel:${sellerPhone}`}
                  className="inline-flex items-center gap-2 mt-4 bg-[#0a4d3c] hover:bg-[#07382c] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Call Seller
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Seller's Ads */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{sellerName}'s Ads</h2>
          <span className="text-sm font-medium text-[#0a4d3c] bg-[#effffb] px-3 py-1 rounded-full border border-[#0a4d3c]/20">
            Total: {posts.length}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-semibold text-sm bg-white rounded-2xl border border-gray-200">
            Is seller ne abhi tak koi ad post nahi ki.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {posts.map((product) => (
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
      </div>
    </main>
  );
};
