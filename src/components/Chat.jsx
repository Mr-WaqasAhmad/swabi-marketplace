import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader2, User2, MessageCircle } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useUser } from '../contexts/UserDetailsContext';

// ✅ Conversation + messages fetch
const fetchConversationData = async (postId, userId) => {
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, title, price, image_url, user_id')
    .eq('id', postId)
    .single();

  if (postError) throw new Error(postError.message);
  if (!post) throw new Error('Post not found');

  const postOwnerId = post.user_id;
  const isUserSeller = userId === postOwnerId;

  let conversation = null;
  let otherUser = null;

  if (isUserSeller) {
    // ✅ SELLER — apni ad pe aaya hai
    // Sabse recent conversation dhoondein
    const { data: convs, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('post_id', postId)
      .eq('seller_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(1);

    if (convError) throw new Error(convError.message);

    if (!convs || convs.length === 0) {
      return {
        post,
        seller: null,
        conversation: null,
        messages: [],
        isUserSeller: true,
        isSellerNoConv: true,
      };
    }

    conversation = convs[0];

    const { data: buyer } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', conversation.buyer_id)
      .maybeSingle();

    otherUser = buyer;
  } else {
    // ✅ BUYER — normal flow
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('post_id', postId)
      .eq('buyer_id', userId)
      .eq('seller_id', postOwnerId)
      .maybeSingle();

    conversation = existing;

    if (!conversation) {
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert([{
          post_id: postId,
          buyer_id: userId,
          seller_id: postOwnerId,
        }])
        .select()
        .single();

      if (createError) throw new Error(createError.message);
      conversation = newConv;
    }

    const { data: seller } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', postOwnerId)
      .maybeSingle();

    otherUser = seller;
  }

  // Messages fetch
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true });

  if (msgError) throw new Error(msgError.message);

  return {
    post,
    seller: otherUser,
    conversation,
    messages: messages || [],
    isUserSeller,
    isSellerNoConv: false,
  };
};

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
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const Chat = () => {
  const { postId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['chat', postId, user?.id],
    queryFn: () => fetchConversationData(postId, user.id),
    enabled: !!postId && !!user?.id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const { conversation, messages = [], post, seller, isSellerNoConv } = data || {};

  // ✅ Realtime — naye messages
  useEffect(() => {
    if (!conversation?.id) return;

    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => {
          queryClient.invalidateQueries(['chat', postId, user?.id]);
          queryClient.invalidateQueries(['conversations', user?.id]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, queryClient, postId, user?.id]);

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ✅ Mark messages as read (FIX — baar baar nahi chalega)
  useEffect(() => {
    if (!conversation?.id || !user?.id || messages.length === 0) return;

    const isBuyer = user.id === conversation.buyer_id;
    const unreadField = isBuyer ? 'buyer_unread' : 'seller_unread';
    const currentUnread = conversation[unreadField] || 0;

    // Agar unread 0 hai to kuch nahi karna
    if (currentUnread === 0) return;

    // Check karein — koi unread message hai jo user ne nahi bheja
    const hasUnreadFromOther = messages.some(
      (m) => m.sender_id !== user.id && !m.is_read
    );

    if (!hasUnreadFromOther) return;

    const markRead = async () => {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      await supabase
        .from('conversations')
        .update({ [unreadField]: 0 })
        .eq('id', conversation.id);

      queryClient.invalidateQueries(['conversations', user?.id]);
      queryClient.invalidateQueries(['header-unread']);
    };

    markRead();
  }, [conversation?.id, conversation?.buyer_id, messages, user?.id, queryClient, conversation]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation?.id || !user?.id) return;

    setIsSending(true);
    setError('');

    try {
      const { error: sendError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversation.id,
          sender_id: user.id,
          content: newMessage.trim(),
        }]);

      if (sendError) throw sendError;

      const isBuyer = user.id === conversation.buyer_id;
      const otherUnreadField = isBuyer ? 'seller_unread' : 'buyer_unread';
      const otherUnread = (isBuyer ? conversation.seller_unread : conversation.buyer_unread) || 0;

      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString(),
          [otherUnreadField]: otherUnread + 1,
        })
        .eq('id', conversation.id);

      setNewMessage('');
      queryClient.invalidateQueries(['chat', postId, user?.id]);
      queryClient.invalidateQueries(['conversations', user?.id]);
    } catch (err) {
      setError(err.message || 'Message send nahi hua.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center pt-16 bg-gray-50'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-[#0a4d3c]' />
          <p className='text-sm text-gray-500 font-medium'>Chat load ho rahi hai...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center pt-16 bg-gray-50 gap-4 px-4'>
        <div className='bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center'>
          <p className='text-red-700 font-bold mb-2'>Chat load nahi hui!</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className='text-[#0a4d3c] font-semibold text-sm hover:underline'
        >
          ← Back
        </button>
      </div>
    );
  }

  // ✅ Seller ne apni ad pe click kiya lekin koi conversation nahi
  if (isSellerNoConv) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center pt-16 bg-gray-50 gap-4 px-4'>
        <div className='bg-[#effffb] border border-emerald-200 rounded-2xl p-6 max-w-md text-center'>
          <MessageCircle className='w-10 h-10 text-[#0a4d3c] mx-auto mb-3' />
          <p className='text-gray-800 font-bold mb-2'>Abhi koi message nahi aaya</p>
          <p className='text-xs text-gray-600 mb-4'>
            Jab koi buyer iss ad pe message karega, to yahan dikhega.
          </p>
          <Link
            to="/messages"
            className='inline-flex items-center gap-2 bg-[#0a4d3c] hover:bg-[#07382c] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all'
          >
            <span>All Messages</span>
          </Link>
        </div>
      </div>
    );
  }

  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const otherName = seller?.full_name || 'User';

  return (
    <div className='w-full bg-gray-50 select-none flex flex-col' style={{ height: 'calc(100vh - 4rem)', marginTop: '4rem' }}>
      <div className='max-w-3xl mx-auto w-full flex flex-col h-full px-2 sm:px-4 py-2'>

        {/* ✅ Header */}
        <div className='bg-white border border-gray-200 rounded-t-2xl p-3 sm:p-4 shadow-sm flex items-center gap-3 shrink-0'>
          <button
            onClick={() => navigate('/messages')}
            className='p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0'
            aria-label='Back'
          >
            <ArrowLeft className='w-4 h-4 text-gray-700' />
          </button>

          <div className='w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#3b053d] flex items-center justify-center text-white font-bold text-base shrink-0'>
            {otherName.trim()[0]?.toUpperCase() || <User2 className='w-5 h-5' />}
          </div>

          <div className='flex-1 min-w-0'>
            <h1 className='font-bold text-gray-800 text-sm sm:text-base truncate'>
              {otherName}
            </h1>
            <p className='text-[10px] sm:text-xs text-gray-500 truncate'>
              Re: {post?.title || 'Product'}
            </p>
          </div>
        </div>

        {/* ✅ Product Context */}
        {post && (
          <Link
            to={`/singleproductdetails/${postId}`}
            className='bg-[#effffb] border border-emerald-100 border-t-0 px-3 sm:px-4 py-2 flex items-center gap-2.5 hover:bg-[#dffff5] transition-colors shrink-0'
          >
            <img
              src={post.image_url}
              alt={post.title}
              className='w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0'
            />
            <div className='flex-1 min-w-0'>
              <p className='text-[11px] sm:text-xs font-bold text-gray-800 truncate'>
                {post.title}
              </p>
              <p className='text-[10px] sm:text-[11px] font-black text-[#0a4d3c]'>
                PKR {Number(post.price)?.toLocaleString()}
              </p>
            </div>
          </Link>
        )}

        {/* ✅ Messages — SCROLLABLE */}
        <div
          ref={messagesContainerRef}
          className='flex-1 bg-white border border-gray-200 border-t-0 overflow-y-auto px-3 sm:px-4 py-4 flex flex-col gap-3 min-h-0'
        >
          {messages.length === 0 ? (
            <div className='flex-1 flex flex-col items-center justify-center text-center px-4'>
              <div className='w-16 h-16 rounded-full bg-[#effffb] flex items-center justify-center mb-3'>
                <MessageCircle className='w-7 h-7 text-[#0a4d3c]' />
              </div>
              <p className='text-sm font-bold text-gray-700 mb-1'>Chat shuru karein</p>
              <p className='text-xs text-gray-500 max-w-xs'>
                {otherName} ko apna sawaal bhejein.
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date} className='flex flex-col gap-3'>
                <div className='flex items-center justify-center'>
                  <span className='text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                    {formatDate(msgs[0].created_at)}
                  </span>
                </div>

                {msgs.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm ${
                          isOwn
                            ? 'bg-[#0a4d3c] text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}
                      >
                        <p className='text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words'>
                          {message.content}
                        </p>
                        <div className={`flex items-center gap-1 justify-end mt-1 ${
                          isOwn ? 'text-emerald-100' : 'text-gray-500'
                        }`}>
                          <span className='text-[9px] sm:text-[10px] font-medium'>
                            {getTimeAgo(message.created_at)}
                          </span>
                          {isOwn && message.is_read && (
                            <span className='text-[9px] font-bold'>✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 border-t-0 px-3 py-2 text-red-700 text-xs font-medium shrink-0'>
            {error}
          </div>
        )}

        {/* ✅ Input — Upar utha diya, extra padding */}
        <form
          onSubmit={handleSend}
          className='bg-white border border-gray-200 border-t-0 rounded-b-2xl p-2.5 sm:p-3 flex items-end gap-2 shadow-sm shrink-0 mb-2'
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Message likhein...'
            rows='1'
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className='flex-1 border border-gray-300 focus:border-[#0a4d3c] rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 resize-none max-h-25 transition-all'
          />
          <button
            type='submit'
            disabled={isSending || !newMessage.trim()}
            className='bg-[#0a4d3c] hover:bg-[#07382c] text-white p-2.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
            aria-label='Send'
          >
            {isSending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Send className='w-4 h-4' />
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
