import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserDetailsContext';

export const ChatButton = ({ sellerId, postId, className = '' }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleClick = () => {
    // ❌ Apni ad pe chat nahi
    if (user?.id === sellerId) {
      alert('Ye aap ki apni ad hai. Aap khud ko message nahi kar sakte.');
      return;
    }

    // ❌ Login required
    if (!user) {
      navigate('/login');
      return;
    }

    // ✅ Chat page pe jayein
    navigate(`/chat/${postId}/${sellerId}`);
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
