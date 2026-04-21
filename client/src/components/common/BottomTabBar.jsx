import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Plus, Bell, User } from 'lucide-react';
import './BottomTabBar.css';

const TABS = [
  { path: '/home',          icon: Home,   label: 'Home' },
  { path: '/search',        icon: Search, label: 'Explore' },
  { path: '/write-review',  icon: Plus,   label: null,    isAdd: true },
  { path: '/notifications', icon: Bell,   label: 'Alerts' },
  { path: '/profile',       icon: User,   label: 'Profile' },
];

const BottomTabBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-tab-bar" aria-label="Main navigation">
      {TABS.map(({ path, icon: Icon, label, isAdd }) => {
        const isActive = pathname === path || (path === '/home' && pathname === '/');

        if (isAdd) {
          return (
            <button
              key={path}
              className="tab-add-btn"
              onClick={() => navigate(path)}
              aria-label="Write a review"
            >
              <div className="tab-add-circle">
                <Icon size={24} strokeWidth={2.5} />
              </div>
            </button>
          );
        }

        return (
          <button
            key={path}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && <div className="tab-active-dot" />}
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              className="tab-icon"
            />
            <span className="tab-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
