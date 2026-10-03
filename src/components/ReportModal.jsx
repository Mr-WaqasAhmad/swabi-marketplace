import React, { useState, useEffect } from 'react';
import { X, Flag, AlertTriangle, Loader2, Check } from 'lucide-react';

const reportReasons = [
  { value: 'fake', label: 'Fake ya Jhooti Ad' },
  { value: 'wrong_info', label: 'Ghalat Information' },
  { value: 'duplicate', label: 'Duplicate Ad' },
  { value: 'illegal', label: 'Ghair-Qanooni Product' },
  { value: 'spam', label: 'Spam ya Scam' },
  { value: 'wrong_category', label: 'Ghalat Category' },
  { value: 'sold_out', label: 'Product Pehle Se Bik Gaya' },
  { value: 'other', label: 'Koi Aur Wajah' },
];

export const ReportModal = ({ isOpen, onClose, product, sellerName, sellerPhone, sellerLocation }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    reason: '',
    details: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ reason: '', details: '' });
      setSubmitted(false);
    }
  }, [isOpen]);

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
      // ✅ WhatsApp number clean karein (owner ka)
      const ownerNumber = '923100094241';

      // ✅ Report message banayein
      const reportMessage = `Assalam o Alaikum!

🚩 *AD REPORT*

━━━━━━━━━━━━━━━━━━━━
📦 *PRODUCT DETAILS*
━━━━━━━━━━━━━━━━━━━━
*Title:* ${product?.title}
*Price:* PKR ${Number(product?.price)?.toLocaleString()}
*Category:* ${product?.category || 'N/A'}
*Location:* ${product?.location || 'Swabi'}
*Product ID:* ${product?.id}

━━━━━━━━━━━━━━━━━━━━
👤 *SELLER DETAILS*
━━━━━━━━━━━━━━━━━━━━
*Name:* ${sellerName}
*Phone:* ${sellerPhone || 'N/A'}
*Location:* ${sellerLocation || 'N/A'}

━━━━━━━━━━━━━━━━━━━━
⚠️ *REPORT REASON*
━━━━━━━━━━━━━━━━━━━━
*Main Reason:* ${reportReasons.find(r => r.value === formData.reason)?.label || formData.reason}

📝 *Additional Details:*
${formData.details || 'Koi additional details nahi di gayi.'}

━━━━━━━━━━━━━━━━━━━━

Baraye meherbani is ad ko check karein aur zaroori action lein.

Shukriya! 🙏`;

      const encodedMessage = encodeURIComponent(reportMessage);
      const whatsappUrl = `https://wa.me/${ownerNumber}?text=${encodedMessage}`;

      // ✅ WhatsApp open karein
      window.open(whatsappUrl, '_blank');

      setLoading(false);
      setSubmitted(true);

      // 2 second baad close
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Report error:', err);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Success Screen
  if (submitted) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

        <div className='relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center'>
          <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Check className='w-8 h-8 text-emerald-600' strokeWidth={3} />
          </div>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>Report Send Ho Gayi!</h2>
          <p className='text-sm text-gray-600'>
            Aapki report hum tak pohanch gayi hai. Hum jald check karenge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

      {/* Modal */}
      <div className='relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='bg-red-600 text-white p-5 sticky top-0 z-10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Flag className='w-5 h-5' />
              <h2 className='text-lg font-bold'>Report This Ad</h2>
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
          <p className='text-xs text-red-100 mt-1'>
            Baraye meherbani sahi wajah batayein taake hum action le sakein
          </p>
        </div>

        {/* Product + Seller Summary */}
        <div className='bg-red-50 border-b border-red-100 p-4'>
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
              <p className='text-red-700 font-black text-base mt-0.5'>
                PKR {Number(product?.price)?.toLocaleString()}
              </p>
              <p className='text-[10px] text-gray-600 mt-0.5 truncate'>
                Seller: {sellerName}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-5 flex flex-col gap-4'>
          {/* Warning */}
          <div className='bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2'>
            <AlertTriangle className='w-4 h-4 text-amber-600 shrink-0 mt-0.5' />
            <p className='text-xs text-amber-800 leading-relaxed'>
              Galat report dene se aapka account block ho sakta hai. Baraye meherbani sirf sahi wajah batayein.
            </p>
          </div>

          {/* Reason Select */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold text-gray-700 flex items-center gap-1.5'>
              <Flag className='w-3.5 h-3.5 text-red-600' />
              Report ki Wajah <span className='text-red-500'>*</span>
            </label>
            <select
              name='reason'
              value={formData.reason}
              onChange={handleChange}
              required
              className='w-full border border-gray-300 focus:border-red-500 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 transition-all bg-white cursor-pointer'
            >
              <option value='' hidden>Select Reason</option>
              {reportReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Details */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold text-gray-700'>
              Additional Details (Optional)
            </label>
            <textarea
              name='details'
              value={formData.details}
              onChange={handleChange}
              rows='4'
              placeholder='Baraye meherbani tafseel se batayein...'
              className='w-full border border-gray-300 focus:border-red-500 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 resize-none transition-all'
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
              disabled={loading || !formData.reason}
              className='flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <>
                  <Flag className='w-4 h-4' />
                  Send Report
                </>
              )}
            </button>
          </div>

          {/* Note */}
          <p className='text-[10px] text-center text-gray-400 font-medium'>
            Aapki report admin ko WhatsApp par jayegi
          </p>
        </form>
      </div>
    </div>
  );
};
