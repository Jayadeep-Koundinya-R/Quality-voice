import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShop, getReviews, likeReview, getShops, API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { SkeletonReviewCard } from '../components/common/SkeletonCard';
import {
  ArrowLeft, MapPin, Flag, PenLine, MessageSquare,
  Heart, X, ChevronLeft, ChevronRight, ShieldCheck, Star, TrendingUp, Camera
} from 'lucide-react';
import ShareButton from '../components/common/ShareButton';
import DiscussionThreads from '../components/common/DiscussionThreads';
import '../styles/ShopDetail.css';

/* ── Lightbox ─────────────────────────────────────────────────────────────── */
const Lightbox = ({ photos, startIndex, onClose }) => {
  const [cur, setCur] = useState(startIndex);
  const prev = useCallback(() => setCur(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCur(i => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, prev, next]);

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lightbox-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
      <div className="lightbox-img-wrap" onClick={e => e.stopPropagation()}>
        <img src={`${API_URL}${photos[cur]}`} alt={`${cur + 1} of ${photos.length}`} className="lightbox-img" />
      </div>
      {photos.length > 1 && (
        <>
          <button className="lightbox-nav prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous"><ChevronLeft size={22} /></button>
          <button className="lightbox-nav next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next"><ChevronRight size={22} /></button>
          <div className="lightbox-counter">{cur + 1} / {photos.length}</div>
        </>
      )}
    </div>
  );
};

/* ── Star display ─────────────────────────────────────────────────────────── */
const Stars = ({ rating, size = 14 }) => (
  <span className="stars-row">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size} fill={i <= Math.round(rating) ? 'var(--accent)' : 'none'} color={i <= Math.round(rating) ? 'var(--accent)' : 'var(--border-strong)'} strokeWidth={1.5} />
    ))}
  </span>
);

/* ── Review Card ──────────────────────────────────────────────────────────── */
const ReviewCard = ({ review: init, currentUser, navigate }) => {
  const [review, setReview]         = useState(init);
  const [showComments, setShow]     = useState(false);
  const [lbIndex, setLbIndex]       = useState(null);
  const [liking, setLiking]         = useState(false);

  const isLiked = currentUser && review.likes?.some(id => id === currentUser._id || id?.toString() === currentUser._id?.toString());

  const handleLike = async () => {
    if (!currentUser || liking) return;
    setLiking(true);
    try {
      const { data } = await likeReview(review._id);
      setReview(p => ({ ...p, likeCount: data.likeCount, likes: data.liked ? [...(p.likes||[]), currentUser._id] : (p.likes||[]).filter(id => id !== currentUser._id) }));
    } catch {} finally { setLiking(false); }
  };

  const initials = review.userId?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <>
      <article className="review-card">
        <div className="review-header">
          <div className="review-avatar">
            {review.userId?.avatar ? <img src={`${API_URL}${review.userId.avatar}`} alt="" /> : initials}
          </div>
          <div className="review-meta">
            <button 
              className="review-author-link" 
              onClick={() => navigate(`/profile/${review.userId?._id}`)}
            >
              {review.userId?.name || 'Anonymous'}
            </button>
              {review.userId?.isVerifiedBadge && (
                <span className="badge badge-primary" style={{fontSize:10,padding:'2px 6px'}}>Govt</span>
              )}
              {review.isTravellerReview && (
                <span className="traveller-tag">
                  ✈ Traveller from {review.reviewerHomeCity}
                </span>
              )}
            <div className="review-date">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
          <Stars rating={review.starRating} size={13} />
        </div>

        <p className="review-text">{review.reviewText}</p>

        {review.photos?.length > 0 && (
          <div className="review-photos">
            {review.photos.map((p, i) => (
              <button key={i} className="review-photo-btn" onClick={() => setLbIndex(i)} aria-label={`View photo ${i+1}`}>
                <img src={`${API_URL}${p}`} alt="" className="review-photo" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="review-actions">
          <button className={`review-action ${isLiked ? 'liked' : ''}`} onClick={handleLike} disabled={liking}>
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
            {review.likeCount > 0 ? review.likeCount : ''} {isLiked ? 'Liked' : 'Like'}
          </button>
          <button className="review-action" onClick={() => setShow(p => !p)}>
            <MessageSquare size={14} />
            {showComments ? 'Hide' : 'Comment'}
          </button>
        </div>

        {showComments && (
          <div className="comments-wrap">
            <DiscussionThreads reviewId={review._id} />
          </div>
        )}
      </article>
      {lbIndex !== null && <Lightbox photos={review.photos} startIndex={lbIndex} onClose={() => setLbIndex(null)} />}
    </>
  );
};

/* ── Rating Distribution Chart ── */
const RatingDistribution = ({ reviews }) => {
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.starRating) === star).length
  }));
  const max = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="rating-distribution">
      <div className="rating-distribution-title">Rating Breakdown</div>
      {counts.map(({ star, count }) => (
        <div key={star} className="rating-dist-row">
          <span className="rating-dist-label">{star}</span>
          <Star size={10} fill="var(--accent)" color="var(--accent)" />
          <div className="rating-dist-bar-wrap">
            <div className="rating-dist-bar" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="rating-dist-count">{count}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Related Shops ── */
const RelatedShops = ({ currentShop }) => {
  const navigate = useNavigate();
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getShops({ category: currentShop.category, limit: 6 });
        setRelated((data.shops || []).filter(s => s._id !== currentShop._id).slice(0, 5));
      } catch {}
    };
    load();
  }, [currentShop._id, currentShop.category]);

  if (related.length === 0) return null;

  return (
    <div className="related-shops-section">
      <h3 className="related-shops-title">
        <TrendingUp size={16} /> Similar Places
      </h3>
      <div className="related-shops-scroll">
        {related.map(shop => (
          <div
            key={shop._id}
            className="related-shop-card"
            onClick={() => navigate(`/shop/${shop._id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(`/shop/${shop._id}`)}
          >
            {shop.photos?.length > 0 ? (
              <img src={`${API_URL}${shop.photos[0]}`} alt={shop.name} className="related-shop-img" loading="lazy" />
            ) : (
              <div className="related-shop-placeholder">{shop.name?.[0]?.toUpperCase()}</div>
            )}
            <div className="related-shop-body">
              <div className="related-shop-name">{shop.name}</div>
              <div className="related-shop-meta">
                <Star size={10} fill="var(--accent)" color="var(--accent)" />
                {shop.averageRating > 0 ? shop.averageRating.toFixed(1) : 'New'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────────────── */
const ShopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const toast = useToast();

  const [shop, setShop]         = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [sortedReviews, setSortedReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('newest');
  const [tab, setTab]           = useState('reviews');
  const [loading, setLoading]   = useState(true);
  const [revLoading, setRevLoad]= useState(true);
  const [error, setError]       = useState('');
  const [coverLb, setCoverLb]   = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset;
      setParallaxOffset(offset * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sort reviews when sort option or reviews change
  useEffect(() => {
    const sorted = [...reviews];
    if (reviewSort === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (reviewSort === 'highest') sorted.sort((a, b) => b.starRating - a.starRating);
    else if (reviewSort === 'lowest') sorted.sort((a, b) => a.starRating - b.starRating);
    setSortedReviews(sorted);
  }, [reviews, reviewSort]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setRevLoad(true);
      try {
        const [sr, rr] = await Promise.all([getShop(id), getReviews(id)]);
        setShop(sr.data.shop);
        setReviews(rr.data.reviews);
      } catch { setError('Could not load this shop. Try again.'); }
      finally { setLoading(false); setRevLoad(false); }
    };
    load();
  }, [id]);



  if (loading) return (
    <div className="shop-detail-page">
      <div className="content-container">
        <div className="spinner-wrap"><div className="spinner" /></div>
      </div>
    </div>
  );

  if (error || !shop) return (
    <div className="shop-detail-page">
      <div className="content-container" style={{padding:'32px 16px'}}>
        <div className="error-msg">{error || 'Shop not found'}</div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{marginTop:12}}>← Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="shop-detail-page">
      {/* ── Cover ── */}
      <div className="shop-cover-wrap">
        {shop.photos?.length > 0 ? (
          <button className="shop-cover-btn" onClick={() => setCoverLb(true)} aria-label="View cover photo">
            <img 
              src={`${API_URL}${shop.photos[0]}`} 
              alt={shop.name} 
              className="shop-cover-img" 
              style={{ transform: `translateY(${parallaxOffset}px)` }}
            />
          </button>
        ) : (
          <div className="shop-cover-placeholder">
            <span className="shop-cover-initial">{shop.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
        {/* Overlay gradient + info */}
        <div className="shop-cover-overlay">
          <div className="content-container">
            <h1 className="shop-cover-name">{shop.name}</h1>
            <div className="shop-cover-meta">
              <span className="shop-cover-category">{shop.category}</span>
              <span className="shop-cover-loc"><MapPin size={12} /> {shop.area}, {shop.city}</span>
            </div>
          </div>
        </div>
        <button className="shop-back-btn" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={18} /></button>
      </div>

      <div className="content-container">
        <div className="shop-proof-grid">
          <div className="shop-proof-card">
            <span className="shop-proof-label">Overall Rating</span>
            <div className="shop-proof-value">{shop.averageRating > 0 ? shop.averageRating.toFixed(1) : '—'}</div>
          </div>
          <div className="shop-proof-card">
            <span className="shop-proof-label">Total Reviews</span>
            <div className="shop-proof-value">{shop.totalReviews || 0}</div>
          </div>
          <div className="shop-proof-card">
            <span className="shop-proof-label">Photos</span>
            <div className="shop-proof-value">{shop.photos?.length || 0}</div>
          </div>
        </div>

        {/* ── Rating summary ── */}
        <div className="shop-rating-row">
          <span className="shop-rating-big">{shop.averageRating > 0 ? shop.averageRating.toFixed(1) : '—'}</span>
          <div className="shop-rating-detail">
            <Stars rating={shop.averageRating} size={16} />
            <span className="shop-review-count">{shop.totalReviews} {shop.totalReviews === 1 ? 'review' : 'reviews'}</span>
            {reviews.filter(r => r.isTravellerReview).length > 0 && (
              <span className="shop-traveller-count">
                ✈ {reviews.filter(r => r.isTravellerReview).length} traveller {reviews.filter(r => r.isTravellerReview).length === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>
          {shop.hasGovtBadge && (
            <span className="badge badge-govt" style={{marginLeft:'auto'}}>
              <ShieldCheck size={11} /> Verified by Government
            </span>
          )}
        </div>

        {/* ── Rating Distribution ── */}
        {reviews.length > 0 && <RatingDistribution reviews={reviews} />}

        {/* ── Actions ── */}
        <div className="shop-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/write-review/${shop._id}`)}>
            <PenLine size={15} /> Write a Review
          </button>
          <button className="btn btn-danger-outline" onClick={() => navigate(`/report/${shop._id}`)}>
            <Flag size={15} /> Report
          </button>
          <ShareButton 
            title="Share"
            content={`Check out ${shop.name} on Quality Voice`}
            url={window.location.href}
            variant="ghost"
          />
        </div>

        {/* ── Tabs ── */}
        <div className="shop-tabs">
          <button className={`shop-tab ${tab==='reviews'?'active':''}`} onClick={() => setTab('reviews')}>Reviews ({reviews.length})</button>
          <button className={`shop-tab ${tab==='about'?'active':''}`} onClick={() => setTab('about')}>About</button>
        </div>

        {/* ── Reviews ── */}
        {tab === 'reviews' ? (
          <div className="reviews-list">
            <div className="shop-stream-head">
              <h3><TrendingUp size={16} /> Community Review Stream</h3>
              <span><Camera size={14} /> {reviews.filter(r => r.photos?.length > 0).length} with photos</span>
            </div>

            {/* Sort options */}
            {reviews.length > 1 && (
              <div className="review-sort-row">
                {[
                  { value: 'newest', label: 'Newest' },
                  { value: 'highest', label: 'Highest' },
                  { value: 'lowest', label: 'Lowest' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    className={`review-sort-btn ${reviewSort === opt.value ? 'active' : ''}`}
                    onClick={() => setReviewSort(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {revLoading ? (
              [1,2,3].map(i => <SkeletonReviewCard key={i} />)
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><PenLine size={26} /></div>
                <h3>No reviews yet</h3>
                <p>Be the first to review this place.</p>
                <button className="btn btn-primary" style={{marginTop:12,maxWidth:200}} onClick={() => navigate(`/write-review/${shop._id}`)}>Write First Review</button>
              </div>
            ) : sortedReviews.map(r => <ReviewCard key={r._id} review={r} currentUser={currentUser} navigate={navigate} />)}

            {/* Related shops */}
            {!revLoading && <RelatedShops currentShop={shop} />}
          </div>
        ) : (
          <div className="shop-about">
            {[
              shop.description && ['About', shop.description],
              ['Category', shop.category],
              ['Address', shop.address],
              ['Area', shop.area],
              ['City', shop.city],
              ['District', shop.district],
              shop.phone && ['Phone', <a href={`tel:${shop.phone}`} style={{color:'var(--primary)'}}>{shop.phone}</a>],
              ['Added', new Date(shop.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} className="about-row">
                <span className="about-label">{label}</span>
                <span className="about-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {coverLb && shop.photos?.length > 0 && <Lightbox photos={shop.photos} startIndex={0} onClose={() => setCoverLb(false)} />}
    </div>
  );
};

export default ShopDetailPage;
