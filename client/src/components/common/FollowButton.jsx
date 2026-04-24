import React, { useState, useEffect } from 'react';
import { checkFollow, followUser, unfollowUser } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, UserCheck } from 'lucide-react';

const FollowButton = ({ userId, userToFollowName, size = 'md', variant = 'primary' }) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?._id && userId) {
      checkFollow(userId)
        .then(({ data }) => setIsFollowing(data.isFollowing))
        .catch(() => setIsFollowing(false));
    }
  }, [userId, currentUser?._id]);

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800'
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading || (!currentUser && !isFollowing)}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${loading ? 'opacity-75 cursor-not-allowed' : ''}
        flex items-center gap-2 rounded-full font-medium transition-all duration-200
        ${variant === 'primary' ? 'shadow-md hover:shadow-lg' : ''}
      `}
      aria-label={isFollowing ? `Unfollow ${userToFollowName}` : `Follow ${userToFollowName}`}
    >
      {isFollowing ? (
        <>
          <UserCheck size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;
