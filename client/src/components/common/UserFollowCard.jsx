import React, { useState, useEffect } from 'react';
import { checkFollow, followUser, unfollowUser, API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, UserCheck, MessageSquare, Star } from 'lucide-react';
import { useToast } from './Toast';

const UserFollowCard = ({ user, onFollow, onUnfollow }) => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?._id && user?._id) {
      checkFollow(user._id)
        .then(({ data }) => setIsFollowing(data.isFollowing))
        .catch(() => setIsFollowing(false));
    }
  }, [user?._id, currentUser?._id]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      toast.error('Please log in to follow users');
      return;
    }
    if (currentUser._id === user._id) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user._id);
        setIsFollowing(false);
        onUnfollow?.();
        toast.success(`Unfollowed ${user.name}`);
      } else {
        await followUser(user._id);
        setIsFollowing(true);
        onFollow?.();
        toast.success(`Now following ${user.name}`);
      }
    } catch (err) {
      toast.error(isFollowing ? 'Failed to unfollow' : 'Failed to follow');
    } finally {
      setLoading(false);
    }
  };

  const avgRating = user.reviewsCount && user.totalRating 
    ? (user.totalRating / user.reviewsCount).toFixed(1) 
    : null;

  return (
    <div className="user-follow-card">
      <div className="user-follow-header">
        <div className="user-follow-avatar">
          {user.avatar ? (
            <img src={`${API_URL}${user.avatar}`} alt={user.name} />
          ) : (
            <span>{user.name?.[0]?.toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className="user-follow-info">
          <div className="user-follow-name">{user.name}</div>
          <div className="user-follow-meta">
            {user.location?.city && (
              <span className="user-follow-location">
                <span className="location-dot" />
                {user.location.area ? `${user.location.area}, ` : ''}{user.location.city}
              </span>
            )}
            {avgRating && (
              <span className="user-follow-rating">
                <Star size={10} fill="#F59E0B" color="#F59E0B" />
                {avgRating}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="user-follow-actions">
        <button
          onClick={handleToggleFollow}
          disabled={loading || (!currentUser && !isFollowing)}
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
        >
          {isFollowing ? (
            <>
              <UserCheck size={16} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={16} />
              <span>Follow</span>
            </>
          )}
        </button>
        
        {currentUser && currentUser._id !== user._id && (
          <button
            className="message-btn"
            onClick={() => toast.info('Direct messaging coming soon!')}
          >
            <MessageSquare size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserFollowCard;
