import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Trash2, Loader2, User2 } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useUser } from '../contexts/UserDetailsContext';

// ✅ Comments fetch function — 2 simple queries, no JOIN
const fetchComments = async (postId) => {
  // Step 1: Comments fetch karein
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, post_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (commentsError) throw new Error(commentsError.message);
  if (!commentsData || commentsData.length === 0) return [];

  // Step 2: Unique user IDs nikaalein
  const userIds = [...new Set(commentsData.map((c) => c.user_id))];

  // Step 3: Profiles fetch karein
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  if (profilesError) console.warn('Profiles fetch warning:', profilesError.message);

  // Step 4: Map banayein
  const profilesMap = {};
  (profilesData || []).forEach((p) => {
    profilesMap[p.id] = p;
  });

  // Step 5: Merge karein
  return commentsData.map((comment) => ({
    ...comment,
    profiles: profilesMap[comment.user_id] || { full_name: 'User' },
  }));
};

// ✅ Time formatting
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

export const CommentsSection = ({ postId }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  // ✅ Comments fetch
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  });

  // ✅ Comment add mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      if (!user?.id) throw new Error('Login required');
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        }]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      setNewComment('');
      setError('');
    },
    onError: (err) => {
      setError(err.message || 'Comment post nahi hua');
    },
  });

  // ✅ Comment delete mutation
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
      setError(err.message || 'Delete nahi hua');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setError('Comment karne ke liye login karein.');
      return;
    }
    if (!newComment.trim()) {
      setError('Comment likhein pehle.');
      return;
    }
    if (newComment.length > 500) {
      setError('Comment 500 characters se zyada nahi ho sakta.');
      return;
    }
    addCommentMutation.mutate(newComment);
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Kya aap yeh comment delete karna chahte hain?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  return (
    <section className='bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm'>
      {/* Header */}
      <div className='flex items-center gap-2 border-b border-gray-100 pb-4 mb-5'>
        <MessageCircle className='w-5 h-5 text-[#0a4d3c]' />
        <h2 className='text-lg sm:text-xl font-bold text-gray-800'>
          Comments
        </h2>
        <span className='text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'>
          {comments?.length || 0}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl font-medium'>
          {error}
        </div>
      )}

      {/* Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className='mb-6'>
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
                  className='flex items-center gap-1.5 bg-[#0a4d3c] hover:bg-[#07382c] text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {addCommentMutation.isPending ? (
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
      {isLoading ? (
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
          {comments?.map((comment) => {
            const isOwner = user?.id === comment.user_id;
            const authorName = comment.profiles?.full_name || 'User';
            const authorInitial = authorName.trim()[0]?.toUpperCase() || 'U';

            return (
              <div
                key={comment.id}
                className='flex gap-2 sm:gap-3 group'
              >
                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#3b053d] flex items-center justify-center text-white font-bold shrink-0 text-sm'>
                  {authorInitial}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='bg-gray-50 border border-gray-100 rounded-2xl p-3'>
                    <div className='flex items-center justify-between gap-2 mb-1'>
                      <span className='font-bold text-gray-800 text-xs sm:text-sm truncate'>
                        {authorName}
                      </span>
                      <div className='flex items-center gap-2 shrink-0'>
                        <span className='text-[10px] text-gray-400 font-medium'>
                          {getTimeAgo(comment.created_at)}
                        </span>
                        {isOwner && (
  <button
    onClick={() => handleDelete(comment.id)}
    disabled={deleteCommentMutation.isPending}
    className='text-red-400 hover:text-red-600 transition-all cursor-pointer p-1 hover:bg-red-50 rounded-lg disabled:opacity-50'
    aria-label='Delete comment'
    title='Delete comment'
  >
    {deleteCommentMutation.isPending ? (
      <Loader2 className='w-3.5 h-3.5 animate-spin' />
    ) : (
      <Trash2 className='w-3.5 h-3.5' />
    )}
  </button>
)}
                      </div>
                    </div>
                    <p className='text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words'>
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
