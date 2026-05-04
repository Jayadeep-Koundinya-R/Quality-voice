import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, MapPin, Star, Trash2, Plus } from 'lucide-react';
import { API_URL } from '../utils/api';
import { useToast } from './common/Toast';
import '../styles/SavedShopsSection.css';

const SavedShopsSection = ({ userId }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [savedShops, setSavedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadSavedShops();
  }, [userId]);

  const loadSavedShops = async () => {
    setLoading(true);
    try {
      // TODO: Implement API endpoint to fetch saved shops
      // const { data } = await getSavedShops();
      // setSavedShops(data.savedShops || []);
      
      // For now, load from localStorage
      const saved = localStorage.getItem(`savedShops_${userId}`);
      if (saved) {
        setSavedShops(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved shops:', err);
      toast.error('Failed to load saved shops');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedShop = async (shopId) => {
    setDeleting(shopId);
    try {
      // TODO: Implement API endpoint to remove saved shop
      // await removeSavedShop(shopId);
      
      // For now, update localStorage
      const updated = savedShops.filter(shop => shop._id !== shopId);
      setSavedShops(updated);
      localStorage.setItem(`savedShops_${userId}`, JSON.stringify(updated));
      
      toast.success('Shop removed from saved');
    } catch (err) {
      toast.error('Failed to remove shop');
    } finally {
      setDeleting(null);
    }
  };

  const handleNavigateToShop = (shopId) => {
    navigate(`/shop/${shopId}`);
  };

  if (loading) {
    return (
      <div className="saved-shops-section">
        <div className="saved-shops-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="saved-shops-section">
      <div className="saved-shops-header">
        <h2 className="saved-shops-title">
          <Bookmark size={18} />
          Saved Shops
        </h2>
        {savedShops.length > 0 && (
          <span className="saved-shops-count">{savedShops.length}</span>
        )}
      </div>

      {savedShops.length === 0 ? (
        <div className="saved-shops-empty">
          <div className="saved-shops-empty-icon">
            <Bookmark size={40} />
          </div>
          <p className="saved-shops-empty-title">No saved shops yet</p>
          <p className="saved-shops-empty-subtitle">
            Bookmark your favorite shops to find them quickly later
          </p>
          <button
            className="saved-shops-empty-btn"
            onClick={() => navigate('/search')}
          >
            <Plus size={14} />
            Explore Shops
          </button>
        </div>
      ) : (
        <div className="saved-shops-grid">
          {savedShops.map((shop) => (
            <div
              key={shop._id}
              className="saved-shop-card"
              onClick={() => handleNavigateToShop(shop._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigateToShop(shop._id)}
            >
              {/* Shop Image */}
              <div className="saved-shop-image">
                {shop.photos && shop.photos.length > 0 ? (
                  <img
                    src={`${API_URL}${shop.photos[0]}`}
                    alt={shop.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="saved-shop-placeholder">
                    {shop.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  className="saved-shop-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSavedShop(shop._id);
                  }}
                  disabled={deleting === shop._id}
                  title="Remove from saved"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Shop Info */}
              <div className="saved-shop-info">
                <h3 className="saved-shop-name">{shop.name}</h3>
                
                <div className="saved-shop-meta">
                  <span className="saved-shop-category">{shop.category}</span>
                  {shop.hasGovtBadge && (
                    <span className="saved-shop-badge">✓ Verified</span>
                  )}
                </div>

                <div className="saved-shop-location">
                  <MapPin size={12} />
                  <span>{shop.area}, {shop.city}</span>
                </div>

                <div className="saved-shop-rating">
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span className="saved-shop-rating-value">
                    {shop.averageRating > 0 ? shop.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span className="saved-shop-review-count">
                    ({shop.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedShopsSection;
