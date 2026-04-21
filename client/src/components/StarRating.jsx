import React from 'react';

const StarRating = ({ rating, size = 14 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`star ${i <= Math.round(rating) ? 'filled' : ''}`}
        style={{ fontSize: size }}
        aria-hidden="true"
      >
        ★
      </span>
    );
  }
  return (
    <span className="stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {stars}
    </span>
  );
};

export default StarRating;
