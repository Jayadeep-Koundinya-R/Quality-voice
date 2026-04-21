import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShop, getReviews, getComments, createComment, likeReview, API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { SkeletonReviewCard } from '../components/common/SkeletonCard';
import {
  ArrowLeft, MapPin, Flag, PenLine, MessageSquare,
  Heart, Share2, X, ChevronLeft, ChevronRight, ShieldCheck, Star, TrendingUp, Camera
} from 'lucide-react';
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
const ReviewCard = ({ review: init, currentUser }) => {
  const [review, setReview]         = useState(init);
  const [showComments, setShow]     = useState(false);
  const [comments, setComments]     = useState([]);
  const [text, setText]             = useState('');
  const [loadingC, setLoadingC]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const loadComments = async () => {
    if (showComments) { setShow(false); return; }
    setLoadingC(true);
    try { const { data } = await getComments(review._id); setComments(data.comments); }
    catch { setComments([]); }
    finally { setLoadingC(false); setShow(true); }
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try { const { data } = await createComment({ reviewId: review._id, commentText: text }); setComments(p => [...p, data.comment]); setText(''); }
    catch {} finally { setSubmitting(false); }
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
            <div className="review-author">
              {review.userId?.name || 'Anonymous'}
              {review.userId?.isVerifiedBadge && (
                <span className="badge badge-primary" style={{fontSize:10,padding:'2px 6px'}}>Govt</span>
              )}
              {review.isTravellerReview && (
                <span className="traveller-tag">
                  ✈ Traveller from {review.reviewerHomeCity}
                </span>
              )}
            </div>
            <div className="review-date">{new Date(review.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
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
          <button className="review-action" onClick={loadComments}>
            <MessageSquare size={14} />
            {loadingC ? 'Loading…' : showComments ? 'Hide' : 'Comment'}
          </button>
        </div>

        {showComments && (
          <div className="comments-wrap">
            {comments.length === 0 && <p className="no-comments">No comments yet — be the first.</p>}
            {comments.map(c => (
              <div key={c._id} className="comment">
                <div className="comment-avatar">{c.userId?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?'}</div>
                <div className="comment-bubble">
                  <span className="comment-author">{c.userId?.name||'User'}</span>
                  <span className="comment-body">{c.commentText}</span>
                </div>
              </div>
            ))}
            <form className="comment-form" onSubmit={handleComment}>
              <input className="comment-input" type="text" placeholder="Write a comment…" value={text} onChange={e=>setText(e.target.value)} maxLength={300} aria-label="Comment" />
              <button type="submit" className="comment-send" disabled={submitting||!text.trim()} aria-label="Send"><PenLine size={13} /></button>
            </form>
          </div>
        )}
      </article>
      {lbIndex !== null && <Lightbox photos={review.photos} startIndex={lbIndex} onClose={() => setLbIndex(null)} />}
    </>
  );
};

/* ── Main Page ────────────────────────────────────────────────────────────── */
const ShopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [shop, setShop]         = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [tab, setTab]           = useState('reviews');
  const [loading, setLoading]   = useState(true);
  const [revLoading, setRevLoad]= useState(true);
  const [error, setError]       = useState('');
  const [coverLb, setCoverLb]   = useState(false);

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: shop?.name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

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
            <img src={`${API_URL}${shop.photos[0]}`} alt={shop.name} className="shop-cover-img" />
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

        {/* ── Actions ── */}
        <div className="shop-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/write-review/${shop._id}`)}>
            <PenLine size={15} /> Write a Review
          </button>
          <button className="btn btn-danger-outline" onClick={() => navigate(`/report/${shop._id}`)}>
            <Flag size={15} /> Report
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleShare} aria-label="Share">
            <Share2 size={15} />
          </button>
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
            {revLoading ? (
              [1,2,3].map(i => <SkeletonReviewCard key={i} />)
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><PenLine size={26} /></div>
                <h3>No reviews yet</h3>
                <p>Be the first to review this place.</p>
                <button className="btn btn-primary" style={{marginTop:12,maxWidth:200}} onClick={() => navigate(`/write-review/${shop._id}`)}>Write First Review</button>
              </div>
            ) : reviews.map(r => <ReviewCard key={r._id} review={r} currentUser={user} />)}
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
