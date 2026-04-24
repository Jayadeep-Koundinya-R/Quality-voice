import React, { useState, useEffect } from 'react';
import { getFollowers, getFollowing, getFollowSuggestions, API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FollowersList = ({ type = 'followers', userId }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        let response;
        if (type === 'followers') {
          response = await getFollowers();
        } else if (type === 'following') {
          response = await getFollowing();
        } else if (type === 'suggestions') {
          response = await getFollowSuggestions();
        }
        setItems(response?.data?.[type === 'suggestions' ? 'suggestions' : type] || []);
      } catch (err) {
        setError('Failed to load ' + type);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          {type === 'suggestions' ? (
            <TrendingUp size={24} className="text-gray-400" />
          ) : (
            <Users size={24} className="text-gray-400" />
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          {type === 'suggestions' 
            ? 'No users to follow yet' 
            : type === 'followers' 
              ? 'No followers yet' 
              : 'Not following anyone yet'}
        </p>
        {type === 'suggestions' && currentUser && (
          <button
            onClick={() => navigate('/search')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find users to follow
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item._id || item.id}
          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {item.avatar ? (
                <img src={`${API_URL}${item.avatar}`} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                item.name?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {item.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {item.city || item.area ? `${item.area ? item.area + ', ' : ''}${item.city}` : 'No location'}
              </p>
            </div>
          </div>
          {type === 'suggestions' && currentUser && (
            <button
              onClick={() => navigate(`/profile/${item._id}`)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="View profile"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FollowersList;
