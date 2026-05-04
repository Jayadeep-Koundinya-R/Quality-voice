import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, X } from 'lucide-react';
import { searchUsers, resolveMediaUrl } from '../utils/api';
import FollowButton from '../components/common/FollowButton';
import '../styles/UserSearch.css';

const getAvatarGradient = name => {
  const c = (name || 'A')[0].toUpperCase();
  if (c <= 'F') return 'linear-gradient(135deg,#667eea,#764ba2)';
  if (c <= 'M') return 'linear-gradient(135deg,#f093fb,#f5576c)';
  if (c <= 'S') return 'linear-gradient(135deg,#43e97b,#38f9d7)';
  return 'linear-gradient(135deg,#fa709a,#fee140)';
};

const UserSearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await searchUsers(q.trim());
      setResults(data.users || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 350);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="user-search-page">
      <div className="content-container">
        {/* Header */}
        <div className="us-header">
          <h1 className="us-title">
            <Users size={22} />
            Find People
          </h1>
          <p className="us-subtitle">Search for reviewers to follow</p>
        </div>

        {/* Search input */}
        <div className="us-search-wrap">
          <Search size={18} className="us-search-icon" />
          <input
            type="text"
            className="us-search-input"
            placeholder="Search by name…"
            value={query}
            onChange={handleChange}
            autoFocus
          />
          {query && (
            <button className="us-clear-btn" onClick={handleClear} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="us-results">
          {loading && (
            <div className="us-loading">
              <div className="spinner" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="us-empty">
              <Users size={40} />
              <p className="us-empty-title">No users found</p>
              <p className="us-empty-sub">Try a different name</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="us-hint">
              <Search size={40} />
              <p>Type at least 2 characters to search</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="us-list">
              {results.map(user => (
                <div key={user._id} className="us-user-card">
                  <button
                    className="us-user-info"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    <div
                      className="us-avatar"
                      style={{ background: getAvatarGradient(user.name) }}
                    >
                      {user.avatar ? (
                        <img src={resolveMediaUrl(user.avatar)} alt={user.name} />
                      ) : (
                        user.name?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="us-user-details">
                      <span className="us-user-name">{user.name}</span>
                      {user.location?.city && (
                        <span className="us-user-location">
                          {user.location.area ? `${user.location.area}, ` : ''}{user.location.city}
                        </span>
                      )}
                      <span className="us-user-stats">
                        {user.followers?.length || 0} followers
                      </span>
                    </div>
                  </button>
                  <FollowButton
                    userId={user._id}
                    userToFollowName={user.name}
                    size="sm"
                    variant="outline"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchPage;
