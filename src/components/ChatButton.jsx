import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserDetailsContext';

export const ChatButton = ({ sellerId, postId, className = '' }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // ✅ Sirf postId se chat
    navigate(`/chat/${postId}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Message seller"
      className={`w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FA855] text-white font-semibold text-sm py-3 px-4 rounded-2xl shadow transition-all cursor-pointer ${className}`}
    >
      <MessageCircle className='w-4 h-4' aria-hidden="true" />
      <span>Message Seller</span>
    </button>
  );
};
