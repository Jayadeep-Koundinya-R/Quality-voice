import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ShieldCheck } from 'lucide-react';
import { API_URL } from '../../utils/api';
import './ShopCard.css';

const CATEGORY_ICONS = {
  Food: '🍽️', Services: '🔧', Shops: '🛍️', Products: '📦'
};

const CATEGORY_PLACEHOLDER_CLASS = {
  Food: 'placeholder-food',
  Services: 'placeholder-services',
  Shops: 'placeholder-shops',
  Products: 'placeholder-products',
};

const StarRow = ({ rating, size = 13 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        size={size}
        fill={i <= Math.round(rating) ? 'var(--accent)' : 'none'}
        color={i <= Math.round(rating) ? 'var(--accent)' : 'var(--border-strong)'}
        strokeWidth={1.5}
      />
    );
  }
  return <span className="star-row">{stars}</span>;
};

/* ─── Vertical card (desktop feed) ─────────────────────────────────────────── */
export const ShopCardVertical = ({ shop }) => {
  const navigate = useNavigate();
  const initial = shop.name?.[0]?.toUpperCase() || '?';

  return (
    <article
      className="shop-card-v"
      onClick={() => navigate(`/shop/${shop._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/shop/${shop._id}`)}
      aria-label={`${shop.name}, ${shop.category}`}
    >
      <div className="shop-card-v-img-wrap">
        {shop.photos?.length > 0 ? (
          <img
            src={`${API_URL}${shop.photos[0]}`}
            alt={shop.name}
            className="shop-card-v-img"
            loading="lazy"
          />
        ) : (
          <div className={`shop-card-v-placeholder ${CATEGORY_PLACEHOLDER_CLASS[shop.category] || 'placeholder-default'}`}>
            <span className="shop-card-v-initial">{initial}</span>
          </div>
        )}
        <span className="shop-card-v-category">
          {CATEGORY_ICONS[shop.category] || '🏪'} {shop.category}
        </span>
        {shop.hasGovtBadge && (
          <span className="shop-card-v-badge">
            <ShieldCheck size={10} /> Verified
          </span>
        )}
      </div>

      <div className="shop-card-v-body">
        <h3 className="shop-card-v-name">{shop.name}</h3>
        <div className="shop-card-v-location">
          <MapPin size={11} />
          {shop.area}, {shop.city}
        </div>
        <div className="shop-card-v-footer">
          <div className="shop-card-v-rating">
            <StarRow rating={shop.averageRating} size={12} />
            <span className="shop-card-v-rating-num">
              {shop.averageRating > 0 ? shop.averageRating.toFixed(1) : 'New'}
            </span>
            {shop.totalReviews > 0 && (
              <span className="shop-card-v-review-count">({shop.totalReviews})</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/* ─── Horizontal card (mobile + search results) ─────────────────────────────── */
export const ShopCardHorizontal = ({ shop }) => {
  const navigate = useNavigate();
  const initial = shop.name?.[0]?.toUpperCase() || '?';

  return (
    <article
      className="shop-card-h"
      onClick={() => navigate(`/shop/${shop._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/shop/${shop._id}`)}
      aria-label={`${shop.name}, ${shop.category}`}
    >
      <div className="shop-card-h-img-wrap">
        {shop.photos?.length > 0 ? (
          <img
            src={`${API_URL}${shop.photos[0]}`}
            alt={shop.name}
            className="shop-card-h-img"
            loading="lazy"
          />
        ) : (
          <div className={`shop-card-h-placeholder ${CATEGORY_PLACEHOLDER_CLASS[shop.category] || 'placeholder-default'}`}>
            <span>{initial}</span>
          </div>
        )}
      </div>

      <div className="shop-card-h-body">
        <div className="shop-card-h-top">
          <h3 className="shop-card-h-name">{shop.name}</h3>
          {shop.hasGovtBadge && (
            <span className="badge badge-govt" style={{ fontSize: 10, padding: '2px 7px' }}>
              <ShieldCheck size={9} /> Verified
            </span>
          )}
        </div>
        <span className="shop-card-h-category">
          {CATEGORY_ICONS[shop.category]} {shop.category}
        </span>
        <div className="shop-card-h-rating">
          <StarRow rating={shop.averageRating} size={12} />
          <span className="shop-card-h-rating-num">
            {shop.averageRating > 0 ? shop.averageRating.toFixed(1) : 'New'}
          </span>
          {shop.totalReviews > 0 && (
            <span className="shop-card-h-reviews">{shop.totalReviews} reviews</span>
          )}
        </div>
        <div className="shop-card-h-location">
          <MapPin size={11} />
          {shop.area}, {shop.city}
        </div>
      </div>
    </article>
  );
};

/* Default export for backward compat */
export default ShopCardVertical;
