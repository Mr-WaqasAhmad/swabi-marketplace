import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, MessageSquare, ShoppingCart, Loader2 } from 'lucide-react';
import { useUser } from '../contexts/UserDetailsContext';

export const OrderModal = ({ isOpen, onClose, product, sellerName, sellerWhatsapp }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    message: '',
  });

  // ✅ User ka data auto-fill karein
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user?.full_name || user?.user_metadata?.full_name || '',
        phone: user?.phone || user?.user_metadata?.phone || '',
        whatsapp: user?.whatsapp || user?.user_metadata?.whatsapp || user?.phone || '',
        address: user?.location || user?.user_metadata?.location || '',
        message: '',
      });
    }
  }, [isOpen, user]);

  // ESC key se close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ WhatsApp number clean karein
      let cleaned = sellerWhatsapp.replace(/[^0-9]/g, '');
      if (cleaned.startsWith('0')) {
        cleaned = '92' + cleaned.slice(1);
      }
      if (!cleaned.startsWith('92')) {
        cleaned = '92' + cleaned;
      }

      // ✅ Order message banayein
      const orderMessage = `Assalam o Alaikum ${sellerName}!

🛒 *NEW ORDER REQUEST*

━━━━━━━━━━━━━━━━━━━━
📦 *PRODUCT DETAILS*
━━━━━━━━━━━━━━━━━━━━
*Title:* ${product?.title}
*Price:* PKR ${Number(product?.price)?.toLocaleString()}
*Location:* ${product?.location || 'Swabi'}

━━━━━━━━━━━━━━━━━━━━
👤 *BUYER INFORMATION*
━━━━━━━━━━━━━━━━━━━━
*Name:* ${formData.name}
*Phone:* ${formData.phone}
*WhatsApp:* ${formData.whatsapp}
*Address:* ${formData.address}

📝 *Message:*
${formData.message || 'Mujhe yeh product chahiye. Baraye meherbani confirm karein.'}

━━━━━━━━━━━━━━━━━━━━

Mujhe yeh product order karna hai. Baraye meherbani confirm karein.

Shukriya! 🙏`;

      const encodedMessage = encodeURIComponent(orderMessage);
      const whatsappUrl = `https://wa.me/${cleaned}?text=${encodedMessage}`;

      // ✅ WhatsApp open karein
      window.open(whatsappUrl, '_blank');

      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Order error:', err);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='bg-[#0a4d3c] text-white p-5 sticky top-0 z-10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <ShoppingCart className='w-5 h-5 text-[#D4AF37]' />
              <h2 className='text-lg font-bold'>Order Now</h2>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer'
              aria-label='Close'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
          <p className='text-xs text-emerald-100 mt-1'>
            Apni details confirm karein aur seller ko order bhejein
          </p>
        </div>

        {/* Product Summary */}
        <div className='bg-[#effffb] border-b border-[#0a4d3c]/10 p-4'>
          <div className='flex items-center gap-3'>
            <img
              src={product?.image_url}
              alt={product?.title}
              className='w-14 h-14 rounded-xl object-cover border border-gray-200'
            />
            <div className='flex-1 min-w-0'>
              <h3 className='font-bold text-gray-800 text-sm truncate'>
                {product?.title}
              </h3>
              <p className='text-[#0a4d3c] font-black text-base mt-0.5'>
                PKR {Number(product?.price)?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-5 flex flex-col gap-4'>
          {/* Name */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold text-gray-700 flex items-center gap-1.5'>
              <User className='w-3.5 h-3.5 text-[#0a4d3c]' /> Aap ka Naam
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              placeholder='e.g. Waqas Ahmad'
              className='w-full border border-gray-300 focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 transition-all'
            />
          </div>

          {/* Phone + WhatsApp */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-bold text-gray-700 flex items-center gap-1.5'>
                <Phone className='w-3.5 h-3.5 text-[#0a4d3c]' /> Phone
              </label>
              <input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder='03100094241'
                className='w-full border border-gray-300 focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 transition-all'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-bold text-gray-700 flex items-center gap-1.5'>
                <MessageSquare className='w-3.5 h-3.5 text-[#25D366]' /> WhatsApp
              </label>
              <input
                type='tel'
                name='whatsapp'
                value={formData.whatsapp}
                onChange={handleChange}
                required
                placeholder='03100094241'
                className='w-full border border-gray-300 focus:border-[#25D366] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#25D366]/20 transition-all'
              />
            </div>
          </div>

          {/* Address */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold text-gray-700 flex items-center gap-1.5'>
              <MapPin className='w-3.5 h-3.5 text-[#0a4d3c]' /> Address
            </label>
            <input
              type='text'
              name='address'
              value={formData.address}
              onChange={handleChange}
              required
              placeholder='e.g. Swabi Adda, Swabi'
              className='w-full border border-gray-300 focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 transition-all'
            />
          </div>

          {/* Message */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold text-gray-700'>
              Message (Optional)
            </label>
            <textarea
              name='message'
              value={formData.message}
              onChange={handleChange}
              rows='3'
              placeholder='Seller ke liye koi message...'
              className='w-full border border-gray-300 focus:border-[#0a4d3c] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0a4d3c]/20 resize-none transition-all'
            ></textarea>
          </div>

          {/* Buttons */}
          <div className='flex gap-3 mt-2'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all cursor-pointer'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 py-3 bg-[#25D366] hover:bg-[#1FA855] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50'
            >
              {loading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <>
                  <ShoppingCart className='w-4 h-4' />
                  Send Order
                </>
              )}
            </button>
          </div>

          {/* Note */}
          <p className='text-[10px] text-center text-gray-400 font-medium'>
            Aap ki details seller ko WhatsApp par bheji jayengi
          </p>
        </form>
      </div>
    </div>
  );
};
