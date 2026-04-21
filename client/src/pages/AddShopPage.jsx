import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createShop } from '../utils/api';
import { useToast } from '../components/common/Toast';
import { ArrowLeft, Utensils, Wrench, ShoppingBag, Package, ImagePlus, X, ArrowRight, Check } from 'lucide-react';
import '../styles/AddShop.css';

const CATS = [
  { label: 'Food',     Icon: Utensils,    value: 'Food',     color: '#EA580C', bg: '#FFF7ED' },
  { label: 'Services', Icon: Wrench,      value: 'Services', color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Shops',    Icon: ShoppingBag, value: 'Shops',    color: '#16A34A', bg: '#F0FDF4' },
  { label: 'Products', Icon: Package,     value: 'Products', color: '#7C3AED', bg: '#F5F3FF' },
];

const STEP_LABELS = ['Basic Info', 'Location', 'Photos'];

const AddShopPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({ name: '', category: 'Food', address: '', city: '', district: '', area: '', description: '', phone: '' });
  const [photos, setPhotos]     = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const addPhotos = e => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) { setError('Max 5 photos'); return; }
    setPhotos(p => [...p, ...files]);
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removePhoto = i => {
    setPhotos(p => p.filter((_, j) => j !== i));
    setPreviews(p => { URL.revokeObjectURL(p[i]); return p.filter((_, j) => j !== i); });
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.address || !form.city || !form.district || !form.area)
      return setError('Please fill all required fields');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.forEach(p => fd.append('photos', p));
      const { data } = await createShop(fd);
      toast.success('Shop added successfully!');
      navigate(`/shop/${data.shop._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add shop. Try again.');
    } finally { setLoading(false); }
  };

  const goBack = () => step > 1 ? setStep(s => s - 1) : navigate(-1);

  return (
    <div className="addshop-page">
      <div className="addshop-container">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="addshop-header">
          <button className="addshop-back-btn" onClick={goBack} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="addshop-title">Add a Shop</h1>
            <p className="addshop-subtitle">Step {step} of 3 — {STEP_LABELS[step - 1]}</p>
          </div>
        </div>

        {/* ── PROGRESS STEPS ─────────────────────────────────────────────── */}
        <div className="addshop-progress">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <React.Fragment key={n}>
                <div className="addshop-step-wrap">
                  <div className={`addshop-step-circle ${done ? 'done' : active ? 'active' : ''}`}>
                    {done ? <Check size={14} strokeWidth={3} /> : n}
                  </div>
                  <span className={`addshop-step-label ${active ? 'active' : ''}`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`addshop-step-line ${done ? 'done' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── CARD ───────────────────────────────────────────────────────── */}
        <div className="addshop-card">
          {error && <div className="error-msg">{error}</div>}

          {/* STEP 1 — Basic Info */}
          {step === 1 && (
            <div className="addshop-step-content">
              <h2 className="addshop-step-title">Basic information</h2>

              <div className="form-group">
                <label className="form-label">Shop Name <span className="required">*</span></label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Anand Sweets"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <div className="addshop-cat-grid">
                  {CATS.map(({ label, Icon, value, color, bg }) => (
                    <button
                      key={value}
                      type="button"
                      className={`addshop-cat-tile ${form.category === value ? 'selected' : ''}`}
                      onClick={() => set('category', value)}
                      style={form.category === value
                        ? { borderColor: color, background: bg }
                        : {}}
                    >
                      <div
                        className="addshop-cat-icon"
                        style={{
                          background: form.category === value ? color : bg,
                          color: form.category === value ? '#fff' : color,
                        }}
                      >
                        <Icon size={22} strokeWidth={2} />
                      </div>
                      <span
                        className="addshop-cat-label"
                        style={{ color: form.category === value ? color : 'var(--text-secondary)' }}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="What does this shop offer?"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="Optional"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>

              <button
                className="addshop-continue-btn"
                onClick={() => { if (!form.name) return setError('Shop name is required'); setStep(2); }}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2 — Location */}
          {step === 2 && (
            <div className="addshop-step-content">
              <h2 className="addshop-step-title">Where is it located?</h2>

              <div className="form-group">
                <label className="form-label">Street Address <span className="required">*</span></label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Shop number, street name"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  autoFocus
                />
              </div>

              <div className="addshop-grid-2">
                <div className="form-group">
                  <label className="form-label">City <span className="required">*</span></label>
                  <input className="form-input" type="text" placeholder="e.g. Mumbai" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">District <span className="required">*</span></label>
                  <input className="form-input" type="text" placeholder="e.g. Andheri" value={form.district} onChange={e => set('district', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Area / Locality <span className="required">*</span></label>
                <input className="form-input" type="text" placeholder="e.g. Versova" value={form.area} onChange={e => set('area', e.target.value)} />
              </div>

              <button
                className="addshop-continue-btn"
                onClick={() => {
                  if (!form.address || !form.city || !form.district || !form.area)
                    return setError('All location fields are required');
                  setStep(3);
                }}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 3 — Photos */}
          {step === 3 && (
            <div className="addshop-step-content">
              <h2 className="addshop-step-title">Add photos</h2>
              <p className="addshop-step-sub">Photos help people recognise the shop. Up to 5.</p>

              <label htmlFor="shop-photos" className="addshop-upload-area">
                <ImagePlus size={36} color="var(--primary)" strokeWidth={1.5} />
                <span className="addshop-upload-text">Tap to add photos</span>
                <span className="addshop-upload-note">JPEG, PNG · Up to 5 photos</span>
                <input id="shop-photos" type="file" accept="image/*" multiple onChange={addPhotos} style={{ display: 'none' }} />
              </label>

              {previews.length > 0 && (
                <div className="addshop-preview-grid">
                  {previews.map((src, i) => (
                    <div key={i} className="addshop-preview-item">
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button
                        type="button"
                        className="addshop-remove-photo"
                        onClick={() => removePhoto(i)}
                        aria-label="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="addshop-continue-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Adding Shop…' : <><Check size={18} /> Add Shop</>}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddShopPage;
