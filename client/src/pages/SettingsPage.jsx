import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Moon, Sun, Bell, Shield, Globe, ChevronRight,
  Info, LogOut, Trash2, Lock, Heart, Sparkles
} from 'lucide-react';
import '../styles/Settings.css';

/* ─── Toggle Switch ──────────────────────────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, label }) => (
  <button
    className={`toggle-switch ${checked ? 'on' : ''}`}
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    type="button"
  >
    <span className="toggle-thumb" />
  </button>
);

/* ─── Settings Row ───────────────────────────────────────────────────────────── */
const SettingsRow = ({ iconBg, iconColor, icon, label, description, right, onClick, danger, last }) => (
  <>
    <div
      className={`settings-row ${danger ? 'settings-row--danger' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
    >
      <div className="settings-row-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="settings-row-body">
        <span className="settings-row-label">{label}</span>
        {description && <span className="settings-row-desc">{description}</span>}
      </div>
      <div className="settings-row-right" onClick={e => e.stopPropagation()}>
        {right !== undefined ? right : <ChevronRight size={15} color="var(--text3)" />}
      </div>
    </div>
    {!last && <div className="settings-row-divider" />}
  </>
);

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
const SettingsPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="settings-page">
      <div className="content-container">

        {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
        <div className="settings-page-header">
          <h1 className="settings-page-title">Settings</h1>
        </div>

        {/* ── PROFILE CARD ───────────────────────────────────────────────── */}
        <div
          className="settings-profile-card"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate('/profile')}
        >
          <div className="settings-profile-avatar">{initials}</div>
          <div className="settings-profile-info">
            <div className="settings-profile-name">{user?.name}</div>
            <div className="settings-profile-email">{user?.email}</div>
          </div>
          <ChevronRight size={16} color="var(--text3)" />
        </div>

        {/* ── PREMIUM UPGRADE ────────────────────────────────────────────── */}
        <div className="settings-premium-card" onClick={() => navigate('/premium')}>
          <div className="premium-card-glow" />
          <div className="premium-card-content">
            <div className="premium-card-icon">
              <Sparkles size={20} fill="white" />
            </div>
            <div className="premium-card-info">
              <div className="premium-card-title">QualityVoice Premium</div>
              <div className="premium-card-desc">Ad-free, exclusive badges & advanced tools</div>
            </div>
            <div className="premium-card-badge">PRO</div>
          </div>
        </div>

        {/* ── APPEARANCE ─────────────────────────────────────────────────── */}
        <div className="settings-section">
          <p className="settings-section-title">Appearance</p>
          <div className="settings-group">
            <SettingsRow
              iconBg="rgba(124,58,237,0.12)"
              iconColor="#7C3AED"
              icon={isDark ? <Moon size={16} /> : <Sun size={16} />}
              label="Dark Mode"
              description={isDark ? 'Currently using dark theme' : 'Currently using light theme'}
              right={<ToggleSwitch checked={isDark} onChange={toggleTheme} label="Toggle dark mode" />}
              onClick={toggleTheme}
              last
            />
          </div>
        </div>

        {/* ── NOTIFICATIONS ──────────────────────────────────────────────── */}
        <div className="settings-section">
          <p className="settings-section-title">Notifications</p>
          <div className="settings-group">
            <SettingsRow
              iconBg="rgba(91,79,232,0.12)"
              iconColor="var(--brand)"
              icon={<Bell size={16} />}
              label="Push Notifications"
              description="Reviews, likes, and badge alerts"
              right={<ToggleSwitch checked={notifications} onChange={() => setNotifications(p => !p)} label="Toggle notifications" />}
              onClick={() => setNotifications(p => !p)}
              last
            />
          </div>
        </div>

        {/* ── PRIVACY & LOCATION ─────────────────────────────────────────── */}
        <div className="settings-section">
          <p className="settings-section-title">Privacy & Location</p>
          <div className="settings-group">
            <SettingsRow
              iconBg="rgba(5,150,105,0.12)"
              iconColor="var(--green)"
              icon={<Globe size={16} />}
              label="Location Access"
              description="Used to show shops near you"
              right={<ToggleSwitch checked={locationAccess} onChange={() => setLocationAccess(p => !p)} label="Toggle location" />}
              onClick={() => setLocationAccess(p => !p)}
            />
            <SettingsRow
              iconBg="rgba(234,88,12,0.12)"
              iconColor="#EA580C"
              icon={<Lock size={16} />}
              label="Change Password"
              description="Update your account password"
              onClick={() => {}}
            />
            <SettingsRow
              iconBg="rgba(100,116,139,0.12)"
              iconColor="#64748B"
              icon={<Shield size={16} />}
              label="Privacy Policy"
              description="How we handle your data"
              onClick={() => {}}
              last
            />
          </div>
        </div>

        {/* ── ABOUT ──────────────────────────────────────────────────────── */}
        <div className="settings-section">
          <p className="settings-section-title">About</p>
          <div className="settings-group">
            <SettingsRow
              iconBg="rgba(37,99,235,0.12)"
              iconColor="#2563EB"
              icon={<Info size={16} />}
              label="App Version"
              description="QualityVoice v1.0.0"
              right={<span className="settings-version-badge">v1.0.0</span>}
              onClick={() => {}}
              last
            />
          </div>
        </div>

        {/* ── ACCOUNT ────────────────────────────────────────────────────── */}
        <div className="settings-section">
          <p className="settings-section-title">Account</p>
          <div className="settings-group">
            <SettingsRow
              iconBg="rgba(220,38,38,0.10)"
              iconColor="var(--red)"
              icon={<LogOut size={16} />}
              label="Sign Out"
              description="You can always sign back in"
              danger
              onClick={handleLogout}
            />
            <SettingsRow
              iconBg="rgba(185,28,28,0.12)"
              iconColor="#B91C1C"
              icon={<Trash2 size={16} />}
              label="Delete Account"
              description="Permanently remove your account"
              danger
              onClick={() => {}}
              last
            />
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <div className="settings-footer">
          <span>Made with</span>
          <Heart size={13} fill="var(--red)" color="var(--red)" />
          <span>for India 🇮🇳</span>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
