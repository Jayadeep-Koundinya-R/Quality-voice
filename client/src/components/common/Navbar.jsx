import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation as useLocCtx } from '../../context/LocationContext';

import {
  Search, Bell, ChevronDown, Moon, Sun,
  User, Settings, LogOut, LayoutDashboard, X, Navigation2, Mic2
} from 'lucide-react';
import './Navbar.css';

/* ─── Location Modal ─────────────────────────────────────────────────────────── */
const LocationModal = ({ onClose }) => {
  const { location, updateLocation, detectGPS, gpsLoading, gpsError } = useLocCtx();
  const [form, setForm] = useState({ city: location.city, district: location.district, area: location.area });

  const handleSave = () => { updateLocation(form); onClose(); };
  const handleGPS = async () => { await detectGPS(); onClose(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={e => e.stopPropagation()}>
        <div className="location-modal-header">
          <h3>Set your location</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {gpsError && <div className="error-msg">{gpsError}</div>}

        <button className="gps-btn" onClick={handleGPS} disabled={gpsLoading}>
          <Navigation2 size={16} />
          {gpsLoading ? 'Detecting...' : 'Use my current location'}
        </button>

        <div className="modal-divider">or enter manually</div>

        <div className="location-form">
          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-input" placeholder="e.g. Mumbai" value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="location-form-row">
            <div className="form-group">
              <label className="form-label">District</label>
              <input className="form-input" placeholder="e.g. Andheri" value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Area</label>
              <input className="form-input" placeholder="e.g. Versova" value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleSave}>Save Location</button>
        </div>
      </div>
    </div>
  );
};

/* ─── User Dropdown ──────────────────────────────────────────────────────────── */
const UserMenu = ({ user, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const go = path => { navigate(path); onClose(); };
  const handleLogout = () => { logout(); navigate('/'); onClose(); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="user-menu">
      {/* Header */}
      <div className="user-menu-header">
        <div className="user-menu-avatar">{initials}</div>
        <div className="user-menu-info">
          <div className="user-menu-name">{user?.name}</div>
          <div className="user-menu-email">{user?.email}</div>
        </div>
      </div>

      <div className="user-menu-divider" />

      <button className="user-menu-item" onClick={() => go('/profile')}>
        <User size={15} /> Profile
      </button>
      {(user?.role === 'govt' || user?.role === 'admin') && (
        <button className="user-menu-item" onClick={() => go('/dashboard')}>
          <LayoutDashboard size={15} /> Dashboard
        </button>
      )}
      <button className="user-menu-item" onClick={() => go('/settings')}>
        <Settings size={15} /> Settings
      </button>
      <button className="user-menu-item" onClick={toggleTheme}>
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div className="user-menu-divider" />

      <button className="user-menu-item user-menu-item--danger" onClick={handleLogout}>
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  );
};

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, isExplorerMode, resetToHome } = useLocCtx();

  const [showLocation, setShowLocation] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const userMenuRef = useRef(null);

  const locationLabel = location.city
    ? `${location.area ? location.area + ', ' : ''}${location.city}`
    : 'Set location';

  useEffect(() => {
    const handler = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <button className="navbar-logo" onClick={() => navigate('/home')} aria-label="Go home">
            <div className="navbar-logo-icon">
              <Mic2 size={17} strokeWidth={2.5} />
            </div>
            <span className="navbar-logo-text">
              Quality<em>Voice</em>
            </span>
          </button>

          {/* ── Desktop search ────────────────────────────────────────────── */}
          <form className="navbar-search" onSubmit={handleSearch} role="search">
            <Search size={16} className="navbar-search-icon" />
            <input
              className="navbar-search-input"
              type="search"
              placeholder="Search shops, food, services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
          </form>

          {/* ── Right actions ─────────────────────────────────────────────── */}
          <div className="navbar-actions">

            {/* Location pill — desktop */}
            <button
              className={`navbar-location-pill ${isExplorerMode ? 'navbar-location-pill--explorer' : ''}`}
              onClick={() => setShowLocation(true)}
            >
              <span className="navbar-location-dot" />
              <span className="navbar-location-text">{locationLabel}</span>
              <ChevronDown size={11} />
            </button>

            {/* Mobile search */}
            <button
              className="navbar-icon-btn navbar-mobile-search"
              onClick={() => setShowMobileSearch(true)}
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Notifications */}
            <button
              className="navbar-icon-btn"
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>

            {/* Avatar */}
            <div className="navbar-user-wrap" ref={userMenuRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setShowUserMenu(p => !p)}
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                {initials}
              </button>
              {showUserMenu && (
                <UserMenu user={user} onClose={() => setShowUserMenu(false)} />
              )}
            </div>

          </div>
        </div>

        {/* ── Explorer mode banner ──────────────────────────────────────── */}
        {isExplorerMode && (
          <button className="explorer-banner" onClick={resetToHome}>
            ✈ Exploring {location.city} · Tap to return to your area
          </button>
        )}
      </header>

      {/* Explorer banner sits fixed just below the navbar */}
      {isExplorerMode && (
        <div className="explorer-banner-spacer" />
      )}

      {/* Mobile full-screen search */}
      {showMobileSearch && (
        <div className="mobile-search-overlay">
          <form className="mobile-search-form" onSubmit={handleSearch}>
            <Search size={18} className="mobile-search-icon" />
            <input
              className="mobile-search-input"
              type="search"
              placeholder="Search shops, areas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              aria-label="Search"
            />
            <button type="button" className="mobile-search-cancel" onClick={() => setShowMobileSearch(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Location modal */}
      {showLocation && <LocationModal onClose={() => setShowLocation(false)} />}
    </>
  );
};

export default Navbar;
