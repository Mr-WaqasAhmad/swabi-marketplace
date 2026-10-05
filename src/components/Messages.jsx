import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Loader2, User2, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useUser } from '../contexts/UserDetailsContext';
import { SEO } from './SEO';

// ✅ Time ago
const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
};

// ✅ Conversations fetch karein
const fetchConversations = async (userId) => {
  // 1. Conversations fetch
  const { data: convs, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (convError) throw new Error(convError.message);
  if (!convs || convs.length === 0) return [];

  // 2. Saare other user IDs nikaalein
  const otherUserIds = [
    ...new Set(
      convs.map((c) => (c.buyer_id === userId ? c.seller_id : c.buyer_id))
    ),
  ];

  // 3. Post IDs nikaalein
  const postIds = [...new Set(convs.map((c) => c.post_id).filter(Boolean))];

  // 4. Profiles fetch
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', otherUserIds);

  // 5. Posts fetch
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, price, image_url')
    .in('id', postIds);

  // 6. Maps
  const profilesMap = {};
  (profiles || []).forEach((p) => { profilesMap[p.id] = p; });

  const postsMap = {};
  (posts || []).forEach((p) => { postsMap[p.id] = p; });

  // 7. Merge
  return convs.map((c) => {
    const isBuyer = c.buyer_id === userId;
    const otherId = isBuyer ? c.seller_id : c.buyer_id;
    const unread = isBuyer ? c.buyer_unread : c.seller_unread;

    return {
      ...c,
      other_user: profilesMap[otherId] || { full_name: 'User' },
      post: postsMap[c.post_id] || null,
      unread_count: unread || 0,
      is_buyer: isBuyer,
    };
  });
};

export const Messages = () => {
  const { user } = useUser();

  const { data: conversations, isLoading, isError } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => fetchConversations(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center pt-16 bg-gray-50'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-[#0a4d3c]' />
          <p className='text-sm text-gray-500 font-medium'>Chats load ho rahi hain...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center pt-16 bg-gray-50 gap-4 px-4'>
        <div className='bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center'>
          <p className='text-red-700 font-bold'>Chats load nahi hui!</p>
        </div>
        <Link to="/home" className='text-[#0a4d3c] font-semibold text-sm hover:underline'>
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="My Messages - Swabi Market"
        description="Aap ki saari chats aur conversations ek jagah."
        url="/messages"
      />

      <main className='w-full min-h-screen bg-gray-50 pt-20 pb-12 select-none'>
        <div className='max-w-3xl mx-auto px-3 sm:px-6'>

          {/* Header */}
          <div className='flex items-center gap-3 mb-5'>
            <Link
              to="/home"
              className='p-2 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer'
              aria-label='Back'
            >
              <ArrowLeft className='w-4 h-4 text-gray-700' />
            </Link>
            <div className='flex items-center gap-2'>
              <MessageCircle className='w-6 h-6 text-[#0a4d3c]' />
              <h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
                My Messages
              </h1>
              {conversations?.length > 0 && (
                <span className='text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'>
                  {conversations.length}
                </span>
              )}
            </div>
          </div>

          {/* Empty State */}
          {conversations?.length === 0 ? (
            <div className='bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm'>
              <div className='w-16 h-16 rounded-full bg-[#effffb] flex items-center justify-center mx-auto mb-4'>
                <MessageCircle className='w-7 h-7 text-[#0a4d3c]' />
              </div>
              <h2 className='text-lg font-bold text-gray-800 mb-2'>
                Abhi koi chat nahi
              </h2>
              <p className='text-sm text-gray-500 max-w-sm mx-auto mb-5'>
                Kisi bhi product pe "Message Seller" click karein aur apni pehli chat shuru karein.
              </p>
              <Link
                to="/home"
                className='inline-flex items-center gap-2 bg-[#0a4d3c] hover:bg-[#07382c] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition-all'
              >
                <span>Browse Products</span>
              </Link>
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              {conversations.map((conv) => {
                const otherName = conv.other_user?.full_name || 'User';
                const initial = otherName.trim()[0]?.toUpperCase() || 'U';
                const hasUnread = conv.unread_count > 0;

                return (
                  <Link
                    key={conv.id}
                    to={`/chat/${conv.post_id}/${conv.is_buyer ? conv.seller_id : conv.buyer_id}`}
                    className={`flex items-center gap-3 bg-white border rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      hasUnread ? 'border-[#0a4d3c]/30 bg-[#effffb]/30' : 'border-gray-200'
                    }`}
                  >
                    {/* Avatar */}
                    <div className='relative shrink-0'>
                      <div className='w-12 h-12 rounded-full bg-[#3b053d] flex items-center justify-center text-white font-bold text-lg'>
                        {initial}
                      </div>
                      {hasUnread && (
                        <span className='absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white'>
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2 mb-0.5'>
                        <h3 className={`text-sm sm:text-base font-bold truncate ${
                          hasUnread ? 'text-gray-900' : 'text-gray-800'
                        }`}>
                          {otherName}
                        </h3>
                        <span className='text-[10px] sm:text-xs text-gray-400 font-medium shrink-0'>
                          {getTimeAgo(conv.last_message_at)}
                        </span>
                      </div>

                      {/* Product title */}
                      {conv.post && (
                        <p className='text-[10px] sm:text-xs text-[#0a4d3c] font-semibold truncate mb-0.5'>
                          {conv.post.title}
                        </p>
                      )}

                      {/* Last message */}
                      <p className={`text-xs sm:text-sm truncate ${
                        hasUnread ? 'text-gray-700 font-semibold' : 'text-gray-500'
                      }`}>
                        {conv.last_message || 'Naya conversation'}
                      </p>
                    </div>

                    {/* Post Image */}
                    {conv.post?.image_url && (
                      <img
                        src={conv.post.image_url}
                        alt={conv.post.title}
                        className='w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 hidden sm:block'
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </>
  );
};
