import React from 'react';
import './SkeletonCard.css';

export const SkeletonShopCardVertical = () => (
  <div className="skeleton-card-v">
    <div className="skeleton skeleton-img-v" />
    <div className="skeleton-body">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-sub" />
      <div className="skeleton skeleton-stars" />
    </div>
  </div>
);

export const SkeletonShopCardHorizontal = () => (
  <div className="skeleton-card-h">
    <div className="skeleton skeleton-img-h" />
    <div className="skeleton-body-h">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-sub" />
      <div className="skeleton skeleton-stars" />
    </div>
  </div>
);

export const SkeletonFeedSection = () => (
  <div className="skeleton-feed-section">
    <div className="skeleton-section-header">
      <div className="skeleton skeleton-section-title" />
    </div>
    <div className="skeleton-scroll-row">
      {[1, 2, 3].map(i => <SkeletonShopCardVertical key={i} />)}
    </div>
  </div>
);

export const SkeletonReviewCard = () => (
  <div className="skeleton-review">
    <div className="skeleton-review-header">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton-review-meta">
        <div className="skeleton skeleton-name" />
        <div className="skeleton skeleton-date" />
      </div>
    </div>
    <div className="skeleton skeleton-text-line" />
    <div className="skeleton skeleton-text-line skeleton-text-short" />
  </div>
);
