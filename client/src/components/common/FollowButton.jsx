import React, { useState, useEffect } from 'react';
import { checkFollow, followUser, unfollowUser } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { UserPlus, UserCheck } from 'lucide-react';
import '../../styles/Social.css';

const FollowButton = ({ userId, userToFollowName, size = 'md', variant = 'primary' }) => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?._id && userId && currentUser._id !== userId) {
      checkFollow(userId)
        .then(({ data }) => setIsFollowing(data.isFollowing))
        .catch(() => setIsFollowing(false));
    }
  }, [userId, currentUser?._id]);

  // Don't render for own profile
  if (!currentUser || currentUser._id === userId) return null;

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        toast.success(`Unfollowed ${userToFollowName || 'user'}`);
      } else {
        await followUser(userId);
        setIsFollowing(true);
        toast.success(`Now following ${userToFollowName || 'user'}`);
      }
    } catch (err) {
      toast.error(isFollowing ? 'Failed to unfollow' : 'Failed to follow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`follow-btn follow-btn--${size} follow-btn--${variant} ${isFollowing ? 'follow-btn--following' : ''}`}
      aria-label={isFollowing ? `Unfollow ${userToFollowName}` : `Follow ${userToFollowName}`}
    >
      {isFollowing ? (
        <><UserCheck size={size === 'sm' ? 13 : 15} /><span>Following</span></>
      ) : (
        <><UserPlus size={size === 'sm' ? 13 : 15} /><span>Follow</span></>
      )}
    </button>
  );
};

export default FollowButton;
