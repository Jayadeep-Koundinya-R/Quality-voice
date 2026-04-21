import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShop, createReport } from '../utils/api';
import { ArrowLeft, Camera, ShieldAlert, CheckCircle2 } from 'lucide-react';

import '../styles/global.css';
import '../styles/Report.css';

const REASONS = [
  'Low quality product',
  'Unhygienic',
  'Fake reviews suspected',
  'Wrong information',
  'Other'
];

const ReportShopPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({ reason: '', description: '' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getShop(shopId)
      .then(({ data }) => setShop(data.shop))
      .catch(() => {});
  }, [shopId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.reason) return setError('Please select a reason');
    if (form.description.length < 30)
      return setError('Description must be at least 30 characters');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('shopId', shopId);
      formData.append('reason', form.reason);
      formData.append('description', form.description);
      if (photo) formData.append('photo', photo);

      await createReport(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="report-shell">
        <main className="report-success">
          <div className="report-success-icon"><CheckCircle2 size={54} /></div>
          <h2>
            Report Submitted
          </h2>
          <p>
            Thank you for helping keep the community safe. Government officials will review your report.
          </p>
          <button className="btn btn-primary" onClick={() => navigate(`/shop/${shopId}`)}>
            Back to Shop
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="report-shell">
      <main className="report-page">
        <div className="report-header">
          <button
            className="report-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2>Report Shop</h2>
            {shop && <div className="report-shop-name">{shop.name}</div>}
          </div>
        </div>

        <form className="report-form" onSubmit={handleSubmit} noValidate>
          <div className="report-warning">
            <ShieldAlert size={16} />
            <span>
              False reports are taken seriously. Only report genuine quality or safety issues.
              Your report will be reviewed by government officials.
            </span>
          </div>

          {error && <div className="error-msg" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="reason">Reason for Report *</label>
            <select
              id="reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            >
              <option value="">Select a reason...</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description * <span className="report-description-hint">
                (min. 30 characters)
              </span>
            </label>
            <textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="report-description-input"
              maxLength={1000}
              required
            />
            <div className={`report-char-count ${form.description.length >= 30 ? 'ok' : ''}`}>
              {form.description.length}/1000
              {form.description.length < 30 && ` (${30 - form.description.length} more needed)`}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="report-photo">Photo Evidence (optional)</label>
            <label
              htmlFor="report-photo"
              className="report-photo-upload"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Report evidence"
                  className="report-photo-preview"
                />
              ) : (
                <>
                  <div className="report-photo-icon"><Camera size={28} /></div>
                  <div className="report-photo-text">
                    Tap to add photo evidence
                  </div>
                </>
              )}
              <input
                id="report-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
                aria-label="Upload evidence photo"
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </main>
      
    </div>
  );
};

export default ReportShopPage;

