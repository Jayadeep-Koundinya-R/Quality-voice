import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { getProfile, updateProfile, getUserProfile, followUser, unfollowUser, checkFollow, API_URL } from '../utils/api';
import {
  ShieldCheck, LayoutDashboard, MapPin,
  Upload, Star, Settings, Edit2, Plus, DoorOpen, ChevronRight,
} from 'lucide-react';
import FollowersList from '../components/common/FollowersList';
import InviteFriends from '../components/common/InviteFriends';
import '../styles/Profile.css';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, logout, refreshUser } = useAuth();
  const toast = useToast();

  const [targetUser, setTargetUser] = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [editForm, setEditForm]     = useState({
    name: '', mobile: '',
    city: '', district: '', area: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setPreview] = useState('');
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');

  const isOwnProfile = !id || id === currentUser?._id || id?.toString() === currentUser?._id?.toString();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isOwnProfile) {
          const { data } = await getProfile();
          setTargetUser(data.user);
          setReviews(data.reviews || []);
          setEditForm({
            name: data.user.name || '',
            mobile: data.user.mobile || '',
            city: data.user.location?.city || '',
            district: data.user.location?.district || '',
            area: data.user.location?.area || ''
          });
        } else {
          const { data } = await getUserProfile(id);
          setTargetUser(data.user);
          setReviews(data.reviews || []);
          
          const followCheck = await checkFollow(id);
          setIsFollowing(followCheck.data.isFollowing);
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isOwnProfile, refreshUser]);

  const handleFollow = async () => {
    if (!currentUser || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setIsFollowing(false);
        toast.success('Unfollowed user');
      } else {
        await followUser(id);
        setIsFollowing(true);
        toast.success('Following user');
      }
      // Refresh to update follower count
      const { data } = await getUserProfile(id);
      setTargetUser(data.user);
    } catch (err) {
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const initials = targetUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.starRating, 0) / reviews.length).toFixed(1)
    : '—';
  const shopsCount = new Set(reviews.map(r => r.shopId?._id)).size;
  const followersCount = targetUser?.followers?.length || 0;
  const followingCount = targetUser?.following?.length || 0;

  const handleSave = async e => {
    e.preventDefault();
    setSaveError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      await updateProfile(fd);
      await refreshUser();
      setShowEdit(false);
      toast.success('Profile updated!');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="profile-page">

      {/* ── HERO CARD ────────────────────────────────────────────────────── */}
      <div className="profile-hero-card">
        <div className="profile-hero-banner" />
        <div className="profile-hero-body">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-ring">
              {targetUser?.avatar
                ? <img src={`${API_URL}${targetUser.avatar}`} alt={targetUser.name} />
                : <span>{initials}</span>}
            </div>
          </div>
          <h1 className="profile-name">{targetUser?.name}</h1>
          <p className="profile-email">{isOwnProfile ? currentUser?.email : ''}</p>
          {targetUser?.location?.city && (
            <p className="profile-location">
              <MapPin size={12} />
              {targetUser.location.area && `${targetUser.location.area}, `}{targetUser.location.city}
            </p>
          )}
          <div className="profile-badges">
            {targetUser?.role === 'govt'  && <span className="badge badge-success"><ShieldCheck size={11} /> Govt Official</span>}
            {targetUser?.role === 'admin' && <span className="badge" style={{ background: '#7c3aed', color: 'white' }}>Admin</span>}
            {targetUser?.isVerifiedBadge  && <span className="badge badge-govt"><ShieldCheck size={11} /> Verified</span>}
          </div>
        </div>
      </div>

      <div className="content-container">
        <div className="profile-layout-grid">
          {/* ── SIDEBAR (Stats + Actions + Menu) ── */}
          <aside className="profile-sidebar">
            {/* Stats Grid 1 */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <span className="profile-stat-label">Reviews</span>
                <div className="profile-stat-value">{reviews.length}</div>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-label">Avg Rating</span>
                <div className="profile-stat-value profile-stat-value--amber">{avgRating}</div>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-label">Shops</span>
                <div className="profile-stat-value">{shopsCount}</div>
              </div>
            </div>

            {/* Social Stats Grid */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card" onClick={() => setShowFollowers(true)} style={{cursor:'pointer'}}>
                <span className="profile-stat-label">Followers</span>
                <div className="profile-stat-value profile-stat-value--blue">
                  {followersCount}
                </div>
              </div>
              <div className="profile-stat-card" onClick={() => setShowFollowing(true)} style={{cursor:'pointer'}}>
                <span className="profile-stat-label">Following</span>
                <div className="profile-stat-value profile-stat-value--blue">
                  {followingCount}
                </div>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-label">Points</span>
                <div className="profile-stat-value profile-stat-value--green">{reviews.length * 10 + shopsCount * 20}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-action-btns">
              {isOwnProfile ? (
                <>
                  <button className="profile-btn-outline" onClick={() => setShowEdit(true)}>
                    <Edit2 size={14} /> Edit Profile
                  </button>
                  <button className="profile-btn-filled" onClick={() => navigate('/add-shop')}>
                    <Plus size={14} /> Add a Shop
                  </button>
                </>
              ) : (
                <button 
                  className={`profile-btn-filled ${isFollowing ? 'profile-btn-outline' : ''}`} 
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {isFollowing ? (
                    <>Unfollow</>
                  ) : (
                    <><UserPlus size={14} /> Follow</>
                  )}
                </button>
              )}
            </div>

            {isOwnProfile && (
              <div className="profile-menu-group">
                {(currentUser?.role === 'govt' || currentUser?.role === 'admin') && (
                  <button className="profile-menu-row" onClick={() => navigate('/dashboard')}>
                    <div className="profile-menu-icon" style={{ background: 'rgba(5,150,105,0.12)', color: 'var(--green)' }}>
                      <LayoutDashboard size={15} />
                    </div>
                    <span className="profile-menu-label">Govt Dashboard</span>
                    <ChevronRight size={15} className="profile-menu-chevron" />
                  </button>
                )}
                <button className="profile-menu-row" onClick={() => navigate('/settings')}>
                  <div className="profile-menu-icon" style={{ background: 'rgba(91,79,232,0.10)', color: 'var(--brand)' }}>
                    <Settings size={15} />
                  </div>
                  <span className="profile-menu-label">Settings</span>
                  <ChevronRight size={15} className="profile-menu-chevron" />
                </button>
                <button className="profile-menu-row" onClick={() => setShowInvite(true)}>
                  <div className="profile-menu-icon" style={{ background: 'rgba(245,158,11,0.10)', color: 'var(--amber)' }}>
                    <Gift size={15} />
                  </div>
                  <span className="profile-menu-label">Invite Friends</span>
                  <ChevronRight size={15} className="profile-menu-chevron" />
                </button>
                <button className="profile-menu-row profile-menu-row--danger" onClick={handleLogout}>
                  <div className="profile-menu-icon" style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--red)' }}>
                    <DoorOpen size={15} />
                  </div>
                  <span className="profile-menu-label">Sign Out</span>
                </button>
              </div>
            )}
          </aside>

          {/* ── MAIN CONTENT (Reviews) ── */}
          <main className="profile-main">
            <div className="profile-reviews-section">
          <div className="profile-reviews-header">
            <h2 className="profile-reviews-heading">
              <MessageSquare size={16} /> My Reviews
            </h2>
            {reviews.length > 0 && (
              <span className="profile-reviews-count">{reviews.length} total</span>
            )}
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : reviews.length === 0 ? (
            <div className="profile-empty-reviews">
              <TrendingUp size={28} />
              <p className="profile-empty-title">No reviews yet</p>
              <p className="profile-empty-sub">Start reviewing shops in your area to build your profile.</p>
              <button className="profile-btn-filled" style={{ marginTop: 4 }} onClick={() => navigate('/write-review')}>
                Write your first review
              </button>
            </div>
          ) : reviews.map(review => (
            <div
              key={review._id}
              className="profile-review-card"
              onClick={() => navigate(`/shop/${review.shopId?._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/shop/${review.shopId?._id}`)}
            >
              <div className="profile-review-top">
                <span className="profile-review-shop">{review.shopId?.name || 'Shop'}</span>
                <span className="profile-review-stars">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={11}
                      fill={i <= review.starRating ? 'var(--amber)' : 'none'}
                      color={i <= review.starRating ? 'var(--amber)' : 'var(--text3)'}
                      strokeWidth={1.5}
                    />
                  ))}
                </span>
              </div>
              <div className="profile-review-meta">{review.shopId?.category} · {review.shopId?.city}</div>
              <p className="profile-review-text">
                {review.reviewText.length > 120 ? review.reviewText.slice(0, 120) + '…' : review.reviewText}
              </p>
              <div className="profile-review-date">
                {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
            </div>
          </main>
        </div>
      </div>

      {/* ── EDIT MODAL ───────────────────────────────────────────────────── */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)} role="dialog" aria-modal="true">
          <div className="edit-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="edit-sheet-title">Edit Profile</h3>
            {saveError && <div className="error-msg">{saveError}</div>}
            <form onSubmit={handleSave} className="edit-sheet-form">
              <div className="edit-avatar-wrap">
                <label htmlFor="av-upload" className="edit-avatar-label">
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad)', color: 'white', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto', border: '2px dashed var(--brand)' }}>
                      {avatarPreview
                      ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : targetUser?.avatar
                        ? <img src={`${API_URL}${targetUser.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span>{initials}</span>}
                  </div>
                  <span className="edit-avatar-text"><Upload size={13} /> Change Photo</span>
                  <input id="av-upload" type="file" accept="image/*"
                    onChange={e => { const f = e.target.files[0]; if (f) { setAvatarFile(f); setPreview(URL.createObjectURL(f)); } }}
                    style={{ display: 'none' }} />
                </label>
              </div>

              {[['Full Name', 'name', 'text'], ['Mobile', 'mobile', 'tel']].map(([label, name, type]) => (
                <div key={name} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} value={editForm[name]}
                    onChange={e => setEditForm({ ...editForm, [name]: e.target.value })} />
                </div>
              ))}

              <div className="edit-grid-2">
                {[['City', 'city'], ['District', 'district']].map(([label, name]) => (
                  <div key={name} className="form-group">
                    <label className="form-label">{label}</label>
                    <input className="form-input" type="text" value={editForm[name]}
                      onChange={e => setEditForm({ ...editForm, [name]: e.target.value })} />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Area</label>
                <input className="form-input" type="text" value={editForm.area}
                  onChange={e => setEditForm({ ...editForm, area: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowEdit(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── FOLLOWERS MODAL ──────────────────────────────────────────────── */}
      {showFollowers && (
        <div className="modal-overlay" onClick={() => setShowFollowers(false)} role="dialog" aria-modal="true">
          <div className="edit-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="edit-sheet-title">Followers</h3>
            <FollowersList type="followers" />
          </div>
        </div>
      )}

      {/* ── FOLLOWING MODAL ──────────────────────────────────────────────── */}
      {showFollowing && (
        <div className="modal-overlay" onClick={() => setShowFollowing(false)} role="dialog" aria-modal="true">
          <div className="edit-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="edit-sheet-title">Following</h3>
            <FollowersList type="following" />
          </div>
        </div>
      )}
      {/* ── INVITE MODAL ─────────────────────────────────────────────────── */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)} role="dialog" aria-modal="true">
          <div className="edit-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 className="edit-sheet-title" style={{ margin: 0 }}>Invite Friends</h3>
              <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                <X size={20} />
              </button>
            </div>
            <InviteFriends />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
