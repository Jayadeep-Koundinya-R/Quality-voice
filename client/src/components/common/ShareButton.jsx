import React, { useState } from 'react';
import { Share2, Copy } from 'lucide-react';
import { useToast } from './Toast';

const Facebook = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Twitter = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const ShareButton = ({ 
  content = 'Check this out!', 
  url = window.location.href,
  title = 'Share',
  size = 'md',
  variant = 'primary'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      setIsOpen(false);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async (platform) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(content)}`;
        break;
      case 'instagram':
        toast.info('Instagram sharing requires app installation');
        return;
      default:
        return;
    }

    if (window.share && platform === 'native') {
      try {
        await navigator.share({
          title: title,
          text: content,
          url: url
        });
        setIsOpen(false);
      } catch (err) {
        console.log('Native share cancelled');
      }
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          flex items-center gap-2 rounded-lg font-medium transition-all duration-200
          ${variant === 'primary' ? 'shadow-md hover:shadow-lg' : ''}
        `}
        aria-label="Share"
      >
        {variant === 'primary' ? (
          <Share2 size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        ) : (
          <Share2 size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        )}
        <span>{title}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden animate-fade-in-down">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Share this content
              </h3>
            </div>
            
            <div className="p-2">
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Facebook size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Twitter size={20} className="text-sky-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter</span>
              </button>
              
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Copy size={20} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Copy Link</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
