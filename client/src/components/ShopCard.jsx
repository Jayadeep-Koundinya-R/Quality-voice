import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';
import { Star, MapPin, Store, Utensils, Wrench, Package } from 'lucide-react';

const CATEGORY_ICONS = {
  Food: <Utensils size={32} strokeWidth={1.5} />,
  Services: <Wrench size={32} strokeWidth={1.5} />,
  Shops: <Store size={32} strokeWidth={1.5} />,
  Products: <Package size={32} strokeWidth={1.5} />
};

// Compact card for horizontal scroll feed
export const ShopCardCompact = ({ shop }) => {
  const navigate = useNavigate();

  return (
    <article
      className="shop-card"
      onClick={() => navigate(`/shop/${shop._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/shop/${shop._id}`)}
      aria-label={`${shop.name}, ${shop.category}, rated ${shop.averageRating} stars`}
    >
      {shop.photos && shop.photos.length > 0 ? (
        <img
          src={`${API_URL}${shop.photos[0]}`}
          alt={shop.name}
          className="shop-card-img"
          loading="lazy"
        />
      ) : (
        <div className="shop-card-img-placeholder" aria-hidden="true">
          {CATEGORY_ICONS[shop.category] || <Store size={32} strokeWidth={1.5} />}
        </div>
      )}
      <div className="shop-card-body">
        <div className="shop-card-top">
          <h3 className="shop-card-name">{shop.name}</h3>
          <div className="shop-card-rating">
            <Star size={14} className="shop-card-rating-star" fill="currentColor" />
            {shop.averageRating > 0 ? shop.averageRating.toFixed(1) : 'New'}
          </div>
        </div>
        <div className="shop-card-meta">
          <span className="category-pill">{shop.category}</span>
          {shop.hasGovtBadge && (
            <span className="govt-badge">✅ Verified</span>
          )}
        </div>
        <div className="shop-card-location">
          <MapPin size={12} /> {shop.area}, {shop.city}
        </div>      </div>
    </article>
  );
};

// Full-width card for search results
export const ShopCardFull = ({ shop }) => {
  const navigate = useNavigate();

  return (
    <article
      className="shop-card-full"
      onClick={() => navigate(`/shop/${shop._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/shop/${shop._id}`)}
      aria-label={`${shop.name}, ${shop.category}, rated ${shop.averageRating} stars`}
    >
      {shop.photos && shop.photos.length > 0 ? (
        <img
          src={`${API_URL}${shop.photos[0]}`}
          alt={shop.name}
          className="shop-card-full-img"
          loading="lazy"
        />
      ) : (
        <div className="shop-card-full-img-placeholder" aria-hidden="true">
          {CATEGORY_ICONS[shop.category] || <Store size={32} strokeWidth={1.5} />}
        </div>
      )}
      <div className="shop-card-full-body">
        <div className="shop-card-full-name">{shop.name}</div>
        <div className="shop-card-full-meta">
          <div className="shop-card-full-rating">
            <Star size={14} fill="currentColor" /> {shop.averageRating > 0 ? shop.averageRating.toFixed(1) : 'New'}
          </div>
          <span className="category-pill">{shop.category}</span>
          {shop.hasGovtBadge && <span className="govt-badge">✅</span>}
        </div>
        <div className="shop-card-location" style={{ marginTop: 6 }}>
          <MapPin size={12} /> {shop.area}, {shop.city}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {shop.totalReviews} review{shop.totalReviews !== 1 ? 's' : ''}
        </div>
      </div>
    </article>
  );
};

export default ShopCardCompact;
