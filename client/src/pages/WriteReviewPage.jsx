import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShop, createReview, getShops } from '../utils/api';
import { useToast } from '../components/common/Toast';
import { Star, ImagePlus, ArrowLeft, X, Check } from 'lucide-react';
import '../styles/WriteReview.css';

const LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];
const TIPS = ['Mention food quality, taste, or freshness', 'Talk about cleanliness and hygiene', 'Describe the service speed and staff attitude', 'Was the price fair for what you got?'];

const WriteReviewPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep]               = useState(1);
  const [shop, setShop]               = useState(null);
  const [shopSearch, setShopSearch]   = useState('');
  const [shopResults, setShopResults] = useState([]);
  const [selectedId, setSelectedId]   = useState(shopId || '');
  const [starRating, setStarRating]   = useState(0);
  const [hoverStar, setHoverStar]     = useState(0);
  const [reviewText, setReviewText]   = useState('');
  const [photos, setPhotos]           = useState([]);
  const [previews, setPreviews]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    if (shopId) getShop(shopId).then(({ data }) => setShop(data.shop)).catch(() => {});
  }, [shopId]);

  useEffect(() => {
    if (shopId || shopSearch.length < 2) { setShopResults([]); return; }
    const t = setTimeout(async () => {
      try { const { data } = await getShops({ search: shopSearch, limit: 5 }); setShopResults(data.shops); }
      catch { setShopResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [shopSearch, shopId]);

  const addPhotos = e => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) { setError('Max 5 photos'); return; }
    setPhotos(p => [...p, ...files]);
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
    setError('');
  };

  const removePhoto = i => {
    setPhotos(p => p.filter((_,j) => j !== i));
    setPreviews(p => { URL.revokeObjectURL(p[i]); return p.filter((_,j) => j !== i); });
  };

  const handleSubmit = async () => {
    setError('');
    const targetId = shopId || selectedId;
    if (!targetId) return setError('Please select a shop');
    if (starRating === 0) return setError('Please select a star rating');
    if (reviewText.length < 20) return setError('Review must be at least 20 characters');
    if (photos.length === 0) return setError('At least one photo is required');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('shopId', targetId); fd.append('starRating', starRating); fd.append('reviewText', reviewText);
      photos.forEach(p => fd.append('photos', p));
      await createReview(fd);
      toast.success('Review submitted! Thanks for helping the community.');
      navigate(`/shop/${targetId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Try again.');
    } finally { setLoading(false); }
  };

  const displayShop = shop || (selectedId && shopResults.find(s => s._id === selectedId));
  const canNext1 = shopId ? true : !!selectedId;
  const canNext2 = starRating > 0 && reviewText.length >= 20;

  return (
    <div className="write-review-page">
      <div className="content-container">
        {/* Header */}
        <div className="wr-header">
          <button className="wr-back" onClick={() => step > 1 ? setStep(s => s-1) : navigate(-1)} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="wr-title">Write a Review</h1>
            {displayShop && <p className="wr-shop-name">{displayShop.name}</p>}
          </div>
        </div>

        {/* Progress */}
        <div className="wr-progress">
          {[1,2,3].map(n => (
            <React.Fragment key={n}>
              <div className={`wr-step ${step >= n ? 'done' : ''} ${step === n ? 'active' : ''}`}>
                {step > n ? <Check size={13} /> : n}
              </div>
              {n < 3 && <div className={`wr-line ${step > n ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {/* Step 1 — Select Shop */}
        {step === 1 && (
          <div className="wr-step-content">
            <h2 className="wr-step-title">Which shop are you reviewing?</h2>
            {shopId ? (
              <div className="wr-selected-shop">
                <div className="wr-selected-name">{displayShop?.name || 'Loading…'}</div>
                <div className="wr-selected-meta">{displayShop?.category} · {displayShop?.area}, {displayShop?.city}</div>
              </div>
            ) : selectedId && displayShop ? (
              <div className="wr-selected-shop">
                <div className="wr-selected-name">{displayShop.name}</div>
                <div className="wr-selected-meta">{displayShop.category} · {displayShop.area}, {displayShop.city}</div>
                <button className="wr-clear-shop" onClick={() => { setSelectedId(''); setShopSearch(''); }}>Change</button>
              </div>
            ) : (
              <div className="wr-shop-search">
                <input className="form-input" type="text" placeholder="Search for a shop…" value={shopSearch} onChange={e => setShopSearch(e.target.value)} autoFocus />
                {shopResults.length > 0 && (
                  <div className="wr-shop-results">
                    {shopResults.map(s => (
                      <button key={s._id} className="wr-shop-result" onClick={() => { setSelectedId(s._id); setShopSearch(s.name); setShopResults([]); }}>
                        <strong>{s.name}</strong>
                        <span>{s.area}, {s.city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button className="btn btn-primary btn-full" style={{marginTop:24}} onClick={() => setStep(2)} disabled={!canNext1}>Continue</button>
          </div>
        )}

        {/* Step 2 — Rate + Review */}
        {step === 2 && (
          <div className="wr-step-content">
            <h2 className="wr-step-title">How was your experience?</h2>

            <div className="wr-stars-wrap">
              <div className="wr-stars">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" className="wr-star-btn" onClick={() => setStarRating(n)} onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)} aria-label={`${n} stars`}>
                    <Star size={40} fill={n <= (hoverStar||starRating) ? 'var(--accent)' : 'none'} color={n <= (hoverStar||starRating) ? 'var(--accent)' : 'var(--border-strong)'} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
              {(hoverStar||starRating) > 0 && <div className="wr-star-label">{LABELS[hoverStar||starRating]}</div>}
            </div>

            <div className="form-group" style={{marginBottom:8}}>
              <label className="form-label">Your review</label>
              <textarea className="form-input wr-textarea" placeholder="Share your experience in detail…" value={reviewText} onChange={e => setReviewText(e.target.value)} maxLength={1000} rows={5} />
              <div className={`wr-char-count ${reviewText.length >= 20 ? 'ok' : ''}`}>
                {reviewText.length}/1000 {reviewText.length < 20 && `· ${20-reviewText.length} more needed`}
              </div>
            </div>

            <div className="wr-tip">
              <strong>Tip:</strong> {TIPS[Math.floor(Math.random() * TIPS.length)]}
            </div>

            <button className="btn btn-primary btn-full" style={{marginTop:20}} onClick={() => setStep(3)} disabled={!canNext2}>Continue</button>
          </div>
        )}

        {/* Step 3 — Photos */}
        {step === 3 && (
          <div className="wr-step-content">
            <h2 className="wr-step-title">Add photo proof</h2>
            <p className="wr-step-sub">At least 1 photo is required. This helps others trust your review.</p>

            <label className="wr-upload-area" htmlFor="review-photos">
              <ImagePlus size={36} color="var(--primary)" strokeWidth={1.5} />
              <span className="wr-upload-text">Tap to add photos</span>
              <span className="wr-upload-note">JPEG, PNG, WebP · Max 5MB · Up to 5 photos</span>
              <input id="review-photos" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={addPhotos} style={{display:'none'}} />
            </label>

            {previews.length > 0 && (
              <div className="wr-preview-grid">
                {previews.map((src, i) => (
                  <div key={i} className="wr-preview-item">
                    <img src={src} alt={`Preview ${i+1}`} />
                    <button type="button" className="wr-remove-photo" onClick={() => removePhoto(i)} aria-label="Remove"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary btn-full" style={{marginTop:24}} onClick={handleSubmit} disabled={loading || photos.length === 0}>
              {loading ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteReviewPage;
