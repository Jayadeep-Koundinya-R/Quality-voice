import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonFeedSection, SkeletonReviewCard } from '../components/common/SkeletonCard';
import { getFeed, markHelpful, API_URL } from '../utils/api';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare, Flag, Star, Plus, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import '../styles/Home.css';

/* ─── Category pills ─────────────────────────────────────────────────────────── */
const CATEGORIES = ['All', 'Food', 'Services', 'Shops', 'Products'];

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const timeAgo = dateStr => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const getAvatarGradient = name => {
  const c = (name || 'A')[0].toUpperCase();
  if (c <= 'F') return 'linear-gradient(135deg,#667eea,#764ba2)';
  if (c <= 'M') return 'linear-gradient(135deg,#f093fb,#f5576c)';
  if (c <= 'S') return 'linear-gradient(135deg,#43e97b,#38f9d7)';
  return 'linear-gradient(135deg,#fa709a,#fee140)';
};

const StarDisplay = ({ rating, size = 12 }) => (
  <span className="rf-stars">
    {[1,2,3,4,5].map(i => (
      <Star
        key={i}
        size={size}
        fill={i <= Math.round(rating) ? '#F59E0B' : 'none'}
        color={i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

/* ─── Review Feed Card ───────────────────────────────────────────────────────── */
const ReviewFeedCard = ({ review, currentUser, onNavigate }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [isHelpful, setIsHelpful] = useState(
    currentUser && review.helpfulBy?.some(id =>
      id === currentUser._id || id?.toString() === currentUser._id?.toString()
    )
  );
  const [marking, setMarking] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const initials = review.userId?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avatarGrad = getAvatarGradient(review.userId?.name);
  const reviewText = review.reviewText || '';
  const isLong = reviewText.length > 160;
  const displayText = isLong && !expanded ? reviewText.slice(0, 160) + '…' : reviewText;

  const handleHelpful = async () => {
    if (!currentUser || marking) return;
    setMarking(true);
    try {
      const { data } = await markHelpful(review._id);
      setHelpfulCount(data.helpfulCount);
      setIsHelpful(data.helpful);
    } catch {} finally { setMarking(false); }
  };

  return (
    <article className="rf-card">
      {/* ── Top row: avatar + name + meta ── */}
      <div className="rf-top">
        <div className="rf-avatar" style={{ background: avatarGrad }}>{initials}</div>
        <div className="rf-meta">
          <div className="rf-name-row">
            <span className="rf-username">{review.userId?.name || 'Anonymous'}</span>
            {review.isTravellerReview && (
              <span className="rf-traveller-tag">✈ Traveller from {review.reviewerHomeCity}</span>
            )}
          </div>
          <div className="rf-sub-row">
            <StarDisplay rating={review.starRating} />
            <span className="rf-time">{timeAgo(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* ── Photo (if any) ── */}
      {review.photos?.length > 0 && (
        <div
          className="rf-photo-wrap"
          onClick={() => onNavigate(`/shop/${review.shopId?._id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onNavigate(`/shop/${review.shopId?._id}`)}
        >
          <img
            src={`${API_URL}${review.photos[0]}`}
            alt="Review"
            className="rf-photo"
            loading="lazy"
          />
        </div>
      )}

      {/* ── Shop reference ── */}
      {review.shopId && (
        <button
          className="rf-shop-ref"
          onClick={() => onNavigate(`/shop/${review.shopId._id}`)}
        >
          <span className="rf-shop-ref-chip">Posted about</span>
          {review.shopId.name} · {review.shopId.category} · {review.shopId.city}
        </button>
      )}

      {/* ── Review text ── */}
      <p className="rf-text">
        {displayText}
        {isLong && (
          <button className="rf-read-more" onClick={() => setExpanded(e => !e)}>
            {expanded ? ' less' : ' more'}
          </button>
        )}
      </p>

      {/* ── Actions ── */}
      <div className="rf-actions">
        <button
          className={`rf-action-btn ${isHelpful ? 'rf-action-btn--active' : ''}`}
          onClick={handleHelpful}
          disabled={marking}
        >
          <Heart size={14} fill={isHelpful ? 'currentColor' : 'none'} />
          {helpfulCount > 0 ? helpfulCount : ''} Helpful
        </button>
        <button
          className="rf-action-btn"
          onClick={() => onNavigate(`/shop/${review.shopId?._id}`)}
        >
          <MessageSquare size={14} />
          Comment
        </button>
        <button
          className="rf-action-btn"
          onClick={() => review.shopId?._id && onNavigate(`/report/${review.shopId._id}`)}
        >
          <Flag size={14} />
          Report
        </button>
      </div>
    </article>
  );
};

/* ─── Trending shop card (compact, 180×220) ─────────────────────────────────── */
const TrendingCard = ({ shop }) => {
  const navigate = useNavigate();
  const initial = shop.name?.[0]?.toUpperCase() || '?';

  const GRADIENTS = {
    Food:     'linear-gradient(135deg,#f093fb,#f5576c)',
    Services: 'linear-gradient(135deg,#43e97b,#38f9d7)',
    Shops:    'linear-gradient(135deg,#4facfe,#00f2fe)',
    Products: 'linear-gradient(135deg,#fa709a,#fee140)',
  };
  const gradient = GRADIENTS[shop.category] || 'linear-gradient(135deg,#667eea,#764ba2)';

  return (
    <article
      className="trending-card"
      onClick={() => navigate(`/shop/${shop._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/shop/${shop._id}`)}
    >
      {/* Image / gradient area */}
      <div className="trending-card-img" style={{ background: gradient }}>
        {shop.photos?.length > 0 ? (
          <img src={`${API_URL}${shop.photos[0]}`} alt={shop.name} className="trending-card-photo" loading="lazy" />
        ) : (
          <span className="trending-card-initial">{initial}</span>
        )}
        <span className="trending-card-cat-badge">{shop.category}</span>
        {shop.hasGovtBadge && <span className="trending-card-verified">✓ Verified</span>}
      </div>

      {/* Body */}
      <div className="trending-card-body">
        <h3 className="trending-card-name">{shop.name}</h3>
        <p className="trending-card-loc">{shop.area}, {shop.city}</p>
        <div className="trending-card-footer">
          <div className="trending-card-rating">
            <Star size={11} fill="#F59E0B" color="#F59E0B" />
            <span>{shop.averageRating > 0 ? shop.averageRating.toFixed(1) : 'New'}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ─── Main page ──────────────────────────────────────────────────────────────── */
const HomePage = () => {
  const navigate = useNavigate();
  const { location, isExplorerMode, detectGPS } = useLocation();
  const { user } = useAuth();
  const loadMoreRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

  const [activeCategory, setActiveCategory] = useState('All');
  const [feed, setFeed] = useState({ trending: [], newShops: [], badgeShops: [], recentReviews: [] });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [page, setPage] = useState(1);
  const [paginationError, setPaginationError] = useState('');
  const [error, setError] = useState('');

  const { city } = location;

  const fetchFeedPage = useCallback(async ({ targetPage, replace }) => {
    if (!replace && (isLoadingMoreRef.current || !hasMoreReviews)) return;
    if (!replace) isLoadingMoreRef.current = true;
    setPaginationError('');
    replace ? setLoading(true) : setLoadingMore(true);
    setError('');
    try {
      const params = { page: targetPage, limit: 8 };
      if (city) params.city = city;
      if (activeCategory !== 'All') params.category = activeCategory.toLowerCase();
      const { data } = await getFeed(params);
      const incomingReviews = data.recentReviews || [];
      const hasMore = Boolean(data.pagination?.hasMore);
      setFeed(prev => ({
        trending: replace ? (data.trending || []) : prev.trending,
        newShops: replace ? (data.newShops || []) : prev.newShops,
        badgeShops: replace ? (data.badgeShops || []) : prev.badgeShops,
        recentReviews: replace
          ? incomingReviews
          : [...prev.recentReviews, ...incomingReviews.filter(
              r => !prev.recentReviews.some(existing => existing._id === r._id)
            )]
      }));
      setHasMoreReviews(hasMore);
      setPage(targetPage);
    } catch {
      if (replace) {
        setError('Could not load the feed. Check your connection and try again.');
      } else {
        setPaginationError('Could not load more reviews.');
      }
    } finally {
      replace ? setLoading(false) : setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [city, activeCategory, hasMoreReviews]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setLoadingMore(false);
    setPage(1);
    setHasMoreReviews(false);
    await fetchFeedPage({ targetPage: 1, replace: true });
  }, [fetchFeedPage]);

  useEffect(() => { if (!location.city) detectGPS(); }, []); // eslint-disable-line
  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => {
    if (loading || !hasMoreReviews || !loadMoreRef.current) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchFeedPage({ targetPage: page + 1, replace: false });
        }
      },
      { root: null, rootMargin: '240px 0px', threshold: 0.01 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchFeedPage, hasMoreReviews, loading, page]);

  const cityName = location.city || 'Your City';

  return (
    <div className="home-page">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="home-hero-compact">
        <div className="content-container">
          <div className="home-hero-card">
            <div>
              <p className="home-hero-eyebrow">
                {isExplorerMode ? 'City Explorer Mode' : 'Social city feed'}
              </p>
              <h1 className="home-hero-heading-compact">
                {isExplorerMode ? 'Exploring ' : 'What people are saying in '}
                <span className={`home-hero-city ${isExplorerMode ? 'home-hero-city--explorer' : ''}`}>
                  {cityName}
                </span>
              </h1>
              <p className="home-hero-sub">
                Scroll trending shops, real reviews, and neighborhood activity in one premium feed.
              </p>
            </div>
            <button className="home-hero-cta" onClick={() => navigate('/write-review')}>
              <Sparkles size={16} />
              Share your review
            </button>
          </div>
        </div>
      </section>

      <div className="content-container">
        {/* ── CATEGORY PILLS ───────────────────────────────────────────────── */}
        <nav className="cat-pills-row" aria-label="Filter by category">
          {CATEGORIES.map(label => (
            <button
              key={label}
              className={`cat-pill ${activeCategory === label ? 'cat-pill--active' : ''}`}
              onClick={() => setActiveCategory(label)}
              aria-pressed={activeCategory === label}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── ERROR ────────────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="error-msg" style={{ margin: '8px 0 16px' }}>
            {error}
            <button onClick={loadFeed} style={{ marginLeft: 12, fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              Retry
            </button>
          </div>
        )}

        {/* ── TRENDING NEARBY ──────────────────────────────────────────────── */}
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">
              <TrendingUp size={16} />
              Trending Nearby
            </h2>
            <button className="home-see-all" onClick={() => navigate('/search')}>
              See all <ArrowRight size={13} />
            </button>
          </div>

          {loading ? (
            <SkeletonFeedSection />
          ) : feed.trending?.length === 0 ? (
            <div className="home-empty-row">
              <p>No trending shops yet.</p>
              <button className="home-add-btn" onClick={() => navigate('/add-shop')}>
                <Plus size={14} /> Add a Shop
              </button>
            </div>
          ) : (
            <div className="trending-scroll">
              {feed.trending.map(shop => (
                <TrendingCard key={shop._id} shop={shop} />
              ))}
            </div>
          )}
        </section>

        {/* ── RECENT REVIEWS (social feed) ─────────────────────────────────── */}
        <section className="home-section" style={{ paddingBottom: 32 }}>
          <div className="home-section-header">
            <h2 className="home-section-title">
              <MessageSquare size={16} />
              Recent Reviews
            </h2>
            <button className="home-see-all" onClick={() => navigate('/write-review')}>
              Create <Plus size={13} />
            </button>
          </div>

          {loading ? (
            <div className="home-review-skeletons">
              {[1, 2, 3].map(i => <SkeletonReviewCard key={i} />)}
            </div>
          ) : !feed.recentReviews?.length ? (
            <div className="home-empty-state">
              <p className="home-empty-title">No reviews yet in {cityName}</p>
              <p className="home-empty-subtitle">Start the first local conversation and help neighbors discover great places.</p>
              <button className="home-add-btn" onClick={() => navigate('/write-review')}>
                Write a Review
              </button>
            </div>
          ) : (
            <>
              <div className="rf-list">
                {feed.recentReviews.map(review => (
                  <ReviewFeedCard
                    key={review._id}
                    review={review}
                    currentUser={user}
                    onNavigate={navigate}
                  />
                ))}
              </div>

              {paginationError && (
                <div className="home-pagination-error">
                  {paginationError}
                  <button onClick={() => fetchFeedPage({ targetPage: page + 1, replace: false })}>
                    Retry
                  </button>
                </div>
              )}

              {loadingMore && (
                <div className="home-loading-more">
                  <div className="spinner" />
                  <span>Loading more reviews...</span>
                </div>
              )}

              {!hasMoreReviews && feed.recentReviews.length > 0 && (
                <div className="home-end-feed">You are all caught up for now.</div>
              )}

              <div ref={loadMoreRef} className="home-feed-sentinel" aria-hidden="true" />
            </>
          )}
        </section>

      </div>
    </div>
  );
};

export default HomePage;
