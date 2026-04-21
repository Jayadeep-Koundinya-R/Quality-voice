import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home, Search, PenLine, Bell, User, LayoutDashboard,
  Settings, Mic2, Moon, Sun, Plus, LogOut
} from 'lucide-react';
import '../styles/DesktopLayout.css';

const DesktopLayout = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Explore' },
    { path: '/write-review', icon: PenLine, label: 'Write Review' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (user?.role === 'govt' || user?.role === 'admin') {
    navItems.push({ path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="desktop-layout">
      {/* Left Sidebar */}
      <aside className="desktop-sidebar">
        <div className="desktop-sidebar-logo">
          <div className="desktop-logo-icon">
            <Mic2 size={20} strokeWidth={2.5} />
          </div>
          Quality<span>Voice</span>
        </div>

        <nav>
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = pathname === path || (path === '/home' && pathname === '/');
            return (
              <button
                key={path}
                className={`desktop-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(path)}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="desktop-nav-icon">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {label}
              </button>
            );
          })}

          <button
            className="desktop-nav-item desktop-add-btn"
            onClick={() => navigate('/add-shop')}
          >
            <div className="desktop-nav-icon desktop-nav-icon-add">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            Add a Shop
          </button>
        </nav>

        <div className="desktop-sidebar-bottom">
          <button className="desktop-nav-item" onClick={toggleTheme}>
            <div className="desktop-nav-icon">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="desktop-nav-item" onClick={() => navigate('/settings')}>
            <div className="desktop-nav-icon">
              <Settings size={18} />
            </div>
            Settings
          </button>
          <button className="desktop-nav-item desktop-logout" onClick={handleLogout}>
            <div className="desktop-nav-icon">
              <LogOut size={18} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Center feed */}
      <main className="desktop-feed">
        {/* Desktop top bar inside feed */}
        <div className="desktop-feed-header">
          <div className="desktop-feed-header-inner">
            <h2 className="desktop-feed-title">
              {pathname === '/home' ? 'Your Feed' :
               pathname === '/search' ? 'Explore' :
               pathname === '/notifications' ? 'Notifications' :
               pathname === '/profile' ? 'Profile' :
               pathname === '/dashboard' ? 'Dashboard' :
               pathname.startsWith('/shop') ? 'Shop' :
               pathname === '/settings' ? 'Settings' : 'QualityVoice'}
            </h2>
          </div>
        </div>
        {children}
      </main>

      {/* Right panel */}
      <aside className="desktop-right-panel">
        {/* User card */}
        {user && (
          <div className="desktop-user-card">
            <div className="desktop-user-avatar">
              {user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div className="desktop-user-name">{user.name}</div>
              <div className="desktop-user-email">{user.email}</div>
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="desktop-right-section">
          <div className="desktop-right-title">About QualityVoice</div>
          <p className="desktop-right-text">
            A community platform where real people rate local shops, restaurants, and services — and government officials can verify quality.
          </p>
        </div>

        <div className="desktop-right-section">
          <div className="desktop-right-title">How it works</div>
          <div className="desktop-how-item">
            <span className="desktop-how-num">1</span>
            <span>Find a shop near you</span>
          </div>
          <div className="desktop-how-item">
            <span className="desktop-how-num">2</span>
            <span>Write an honest review with a photo</span>
          </div>
          <div className="desktop-how-item">
            <span className="desktop-how-num">3</span>
            <span>Help others make better choices</span>
          </div>
        </div>

        <div className="desktop-right-footer">
          © 2025 QualityVoice · Made for India 🇮🇳
        </div>
      </aside>
    </div>
  );
};

export default DesktopLayout;
