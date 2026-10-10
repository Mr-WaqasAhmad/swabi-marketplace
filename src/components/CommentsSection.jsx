import React, { useState, useEffect, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Trash2, Loader2, User2, Star, Check, Reply, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useUser } from '../contexts/UserDetailsContext';

// ============================================
// 📋 FETCH COMMENTS (with replies)
// ============================================
const fetchComments = async (postId) => {
  // 1. All comments (top-level + replies)
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, post_id, parent_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) throw new Error(commentsError.message);
  if (!commentsData || commentsData.length === 0) return [];

  // 2. Get unique user IDs
  const userIds = [...new Set(commentsData.map((c) => c.user_id))];

  // 3. Profiles
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  if (profilesError) console.warn('Profiles fetch warning:', profilesError.message);

  const profilesMap = {};
  (profilesData || []).forEach((p) => {
    profilesMap[p.id] = p;
  });

  // 4. Separate top-level and replies
  const topLevel = [];
  const repliesMap = {};

  commentsData.forEach((comment) => {
    const enriched = {
      ...comment,
      profiles: profilesMap[comment.user_id] || { full_name: 'User' },
    };

    if (comment.parent_id) {
      if (!repliesMap[comment.parent_id]) repliesMap[comment.parent_id] = [];
      repliesMap[comment.parent_id].push(enriched);
    } else {
      topLevel.push(enriched);
    }
  });

  // 5. Sort top-level by newest first
  topLevel.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 6. Attach replies
  return topLevel.map((comment) => ({
    ...comment,
    replies: repliesMap[comment.id] || [],
  }));
};

// ============================================
// ⭐ FETCH RATINGS
// ============================================
const fetchRatings = async (postId) => {
  const { data, error } = await supabase
    .from('ratings')
    .select('id, rating, user_id, created_at')
    .eq('post_id', postId);

  if (error) throw new Error(error.message);

  const ratings = data || [];
  const total = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const average = total > 0 ? sum / total : 0;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  });

  return { ratings, total, average, breakdown };
};

// ============================================
// ⏰ TIME AGO
// ============================================
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

// ============================================
// ⭐ STAR COMPONENTS
// ============================================
const RatingDisplay = ({ rating = 0, size = 'sm', showNumber = false }) => {
  const sizeClass = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size] || 'w-4 h-4';

  return (
    <div className='flex items-center gap-1'>
      <div className='flex items-center gap-0.5'>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= Math.round(rating)
                ? 'fill-[#D4AF37] text-[#D4AF37]'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className='text-xs font-bold text-gray-700 ml-1'>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

const RatingInput = ({ value = 0, onChange, disabled = false }) => {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverValue || value);
        return (
          <button
            key={star}
            type='button'
            disabled={disabled}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => !disabled && setHoverValue(0)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className={`transition-transform ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-125'
            }`}
          >
            <Star
              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                isActive
                  ? 'fill-[#D4AF37] text-[#D4AF37]'
                  : 'fill-gray-200 text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// 💬 COMMENT ITEM (memoized)
// ============================================
const CommentItem = memo(({ comment, isOwner, onDelete, onReply, isReply = false, currentUser }) => {
  const authorName = comment.profiles?.full_name || 'User';
  const authorInitial = authorName.trim()[0]?.toUpperCase() || 'U';

  return (
    <div className={`flex gap-2 sm:gap-3 ${isReply ? 'mt-3' : ''}`}>
      <div className={`${isReply ? 'w-7 h-7 text-xs' : 'w-9 h-9 sm:w-10 sm:h-10'} rounded-full bg-[#3b053d] flex items-center justify-center text-white font-bold shrink-0`}>
        {authorInitial}
      </div>
      <div className='flex-1 min-w-0'>
        <div className={`${isReply ? 'bg-white' : 'bg-gray-50'} border border-gray-100 rounded-2xl p-3`}>
          <div className='flex items-center justify-between gap-2 mb-1 flex-wrap'>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-gray-800 text-xs sm:text-sm truncate'>
                {authorName}
              </span>
              {isOwner && (
                <span className='text-[9px] font-bold text-[#0a4d3c] bg-[#effffb] px-1.5 py-0.5 rounded'>
                  You
                </span>
              )}
            </div>
            <div className='flex items-center gap-1.5 shrink-0'>
              <span className='text-[10px] text-gray-400 font-medium'>
                {getTimeAgo(comment.created_at)}
              </span>
              {isOwner && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className='text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer'
                  aria-label='Delete comment'
                  title='Delete'
                >
                  <Trash2 className='w-3 h-3' />
                </button>
              )}
            </div>
          </div>
          <p className='text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words'>
            {comment.content}
          </p>

          {/* Reply Button (only for top-level) */}
          {!isReply && currentUser && (
            <button
              type='button'
              onClick={() => onReply(comment.id, authorName)}
              className='mt-2 text-[10px] sm:text-xs font-bold text-[#0a4d3c] hover:text-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1'
            >
              <Reply className='w-3 h-3' />
              Reply
            </button>
          )}
        </div>

        {/* Nested Replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className='ml-2 sm:ml-4 pl-2 sm:pl-3 border-l-2 border-gray-100 mt-2'>
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isOwner={currentUser?.id === reply.user_id}
                onDelete={onDelete}
                onReply={onReply}
                isReply={true}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

// ============================================
// 🎯 MAIN COMPONENT
// ============================================
export const CommentsSection = ({ postId }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Comments state
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, name }
  const [replyText, setReplyText] = useState('');

  // Ratings state
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');

  // ============================================
  // 📋 COMMENTS QUERIES
  // ============================================
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }) => {
      if (!user?.id) throw new Error('Login required');
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null,
        }]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      setNewComment('');
      setReplyText('');
      setReplyTo(null);
      setCommentError('');
    },
    onError: (err) => {
      setCommentError(err.message || 'Comment post nahi hua');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
    },
    onError: (err) => {
      setCommentError(err.message || 'Delete nahi hua');
    },
  });

  // ============================================
  // ⭐ RATINGS QUERIES
  // ============================================
  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: ['ratings', postId],
    queryFn: () => fetchRatings(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  });

  const { ratings = [], total = 0, average = 0, breakdown = {} } = ratingsData || {};
  const userRating = user ? ratings.find((r) => r.user_id === user.id) : null;

  const submitRatingMutation = useMutation({
    mutationFn: async (ratingValue) => {
      if (!user?.id) throw new Error('Login required');

      if (userRating) {
        const { error } = await supabase
          .from('ratings')
          .update({ rating: ratingValue, updated_at: new Date().toISOString() })
          .eq('id', userRating.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('ratings')
          .insert([{
            post_id: postId,
            user_id: user.id,
            rating: ratingValue,
          }]);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ratings', postId]);
      queryClient.invalidateQueries(['products']);
      setRatingSuccess('Shukriya! Aap ki rating save ho gayi.');
      setRatingError('');
      setTimeout(() => setRatingSuccess(''), 3000);
    },
    onError: (err) => {
      setRatingError(err.message || 'Rating save nahi hui');
      setRatingSuccess('');
    },
  });

  // ============================================
  // 🎯 HANDLERS
  // ============================================
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setCommentError('Comment karne ke liye login karein.');
      return;
    }
    if (!newComment.trim()) {
      setCommentError('Comment likhein pehle.');
      return;
    }
    if (newComment.length > 500) {
      setCommentError('Comment 500 characters se zyada nahi ho sakta.');
      return;
    }
    addCommentMutation.mutate({ content: newComment, parentId: null });
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyTo) return;
    if (!replyText.trim()) return;
    if (replyText.length > 500) return;
    addCommentMutation.mutate({ content: replyText, parentId: replyTo.id });
  };

  const handleReplyClick = (commentId, authorName) => {
    setReplyTo({ id: commentId, name: authorName });
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyText('');
  };

  const handleCommentDelete = (commentId) => {
    const confirmed = window.confirm(
      '⚠️ Kya aap yeh comment delete karna chahte hain?\n\nYeh action undo nahi ho sakta.'
    );
    if (confirmed) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleRate = (star) => {
    if (!user) {
      setRatingError('Rating dene ke liye login karein.');
      return;
    }
    submitRatingMutation.mutate(star);
  };

  // ============================================
  // 🎨 RENDER
  // ============================================
  return (
    <div className='flex flex-col gap-6'>

      {/* ============================================
          ⭐ RATINGS SECTION
          ============================================ */}
      <section className='bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm'>
        <div className='flex items-center gap-2 border-b border-gray-100 pb-4 mb-5'>
          <Star className='w-5 h-5 text-[#D4AF37] fill-[#D4AF37]' />
          <h2 className='text-lg sm:text-xl font-bold text-gray-800'>
            Ratings & Reviews
          </h2>
          <span className='text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'>
            {total}
          </span>
        </div>

        {ratingsLoading ? (
          <div className='flex items-center justify-center py-8 text-gray-400'>
            <Loader2 className='w-5 h-5 animate-spin mr-2' />
            <span className='text-sm'>Ratings load ho rahi hain...</span>
          </div>
        ) : (
          <>
            {ratingError && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl font-medium'>
                {ratingError}
              </div>
            )}
            {ratingSuccess && (
              <div className='mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-2'>
                <Check className='w-4 h-4' />
                {ratingSuccess}
              </div>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <div className='flex flex-col items-center justify-center bg-[#effffb] border border-emerald-100 rounded-2xl p-5'>
                <div className='text-5xl sm:text-6xl font-black text-[#0a4d3c]'>
                  {average > 0 ? average.toFixed(1) : '0.0'}
                </div>
                <div className='mt-2'>
                  <RatingDisplay rating={average} size='md' />
                </div>
                <p className='text-xs text-gray-500 font-medium mt-2'>
                  {total > 0 ? `${total} rating${total > 1 ? 's' : ''}` : 'Abhi tak koi rating nahi'}
                </p>
              </div>

              <div className='flex flex-col gap-1.5 justify-center'>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = breakdown[star] || 0;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={star} className='flex items-center gap-2'>
                      <span className='text-xs font-bold text-gray-700 w-3'>{star}</span>
                      <Star className='w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37] shrink-0' />
                      <div className='flex-1 h-2 bg-gray-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-[#D4AF37] rounded-full transition-all duration-500'
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className='text-[10px] font-semibold text-gray-500 w-8 text-right'>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='mt-6 pt-6 border-t border-gray-100'>
              {user ? (
                <div className='flex flex-col items-center gap-3'>
                  <p className='text-sm font-semibold text-gray-700'>
                    {userRating
                      ? `Aap ne ${userRating.rating} star di hai — change karna chahein?`
                      : 'Is product ko rate karein:'}
                  </p>
                  <RatingInput
                    value={userRating?.rating || 0}
                    onChange={handleRate}
                    disabled={submitRatingMutation.isPending}
                  />
                  {submitRatingMutation.isPending && (
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      <span>Save ho raha hai...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className='p-4 bg-[#effffb] border border-emerald-200 rounded-xl text-center'>
                  <p className='text-xs sm:text-sm text-gray-700'>
                    Rating dene ke liye{' '}
                    <a href='/login' className='text-[#0a4d3c] font-bold underline'>
                      login karein
                    </a>
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* ============================================
          💬 COMMENTS SECTION
          ============================================ */}
      <section className='bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm'>
        <div className='flex items-center gap-2 border-b border-gray-100 pb-4 mb-5'>
          <MessageCircle className='w-5 h-5 text-[#0a4d3c]' />
          <h2 className='text-lg sm:text-xl font-bold text-gray-800'>
            Comments
          </h2>
          <span className='text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'>
            {comments?.length || 0}
          </span>
        </div>

        {commentError && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl font-medium'>
            {commentError}
          </div>
        )}

        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className='mb-6'>
            <div className='flex gap-2 sm:gap-3'>
              <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#3b053d] flex items-center justify-center text-white font-bold shrink-0'>
                {user?.full_name?.trim()?.[0]?.toUpperCase() ||
                  user?.user_metadata?.full_name?.trim()?.[0]?.toUpperCase() ||
                  <User2 className='w-4 h-4' />}
              </div>
              <div className='flex-1'>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder='Apna comment likhein...'
                  rows='2'
                  maxLength={500}
                  className='w-full border border-gray-300 focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 resize-none transition-all'
                />
                <div className='flex items-center justify-between mt-2'>
                  <span className={`text-[10px] font-medium ${
                    newComment.length > 450 ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {newComment.length}/500
                  </span>
                  <button
                    type='submit'
                    disabled={addCommentMutation.isPending || !newComment.trim()}
                    className='flex items-center gap-1.5 bg-[#0a4d3c] hover:bg-[#07382c] text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {addCommentMutation.isPending && !replyTo ? (
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                    ) : (
                      <Send className='w-3.5 h-3.5' />
                    )}
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className='mb-6 p-4 bg-[#effffb] border border-emerald-200 rounded-xl text-center'>
            <p className='text-xs sm:text-sm text-gray-700'>
              Comment karne ke liye{' '}
              <a href='/login' className='text-[#0a4d3c] font-bold underline'>
                login karein
              </a>
            </p>
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div className='flex items-center justify-center py-8 text-gray-400'>
            <Loader2 className='w-5 h-5 animate-spin mr-2' />
            <span className='text-sm'>Comments load ho rahe hain...</span>
          </div>
        ) : comments?.length === 0 ? (
          <div className='text-center py-8'>
            <MessageCircle className='w-10 h-10 text-gray-300 mx-auto mb-2' />
            <p className='text-sm text-gray-500 font-medium'>
              Abhi koi comment nahi. Pehla comment aap karein!
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {comments?.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  isOwner={user?.id === comment.user_id}
                  onDelete={handleCommentDelete}
                  onReply={handleReplyClick}
                  currentUser={user}
                />

                {/* Reply Input (Inline) */}
                {replyTo?.id === comment.id && (
                  <form onSubmit={handleReplySubmit} className='mt-3 ml-11 sm:ml-13 flex gap-2'>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-[10px] font-bold text-gray-600'>
                          Replying to <span className='text-[#0a4d3c]'>{replyTo.name}</span>
                        </span>
                        <button
                          type='button'
                          onClick={handleCancelReply}
                          className='text-gray-400 hover:text-gray-600 cursor-pointer'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder='Apna reply likhein...'
                        rows='2'
                        maxLength={500}
                        autoFocus
                        className='w-full border border-gray-300 focus:border-[#0a4d3c] rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 resize-none'
                      />
                      <div className='flex items-center justify-end gap-2 mt-2'>
                        <button
                          type='button'
                          onClick={handleCancelReply}
                          className='text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg cursor-pointer'
                        >
                          Cancel
                        </button>
                        <button
                          type='submit'
                          disabled={addCommentMutation.isPending || !replyText.trim()}
                          className='flex items-center gap-1.5 bg-[#0a4d3c] hover:bg-[#07382c] text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50'
                        >
                          {addCommentMutation.isPending ? (
                            <Loader2 className='w-3 h-3 animate-spin' />
                          ) : (
                            <Send className='w-3 h-3' />
                          )}
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
