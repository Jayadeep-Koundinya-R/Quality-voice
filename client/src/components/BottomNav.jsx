import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, Plus, Bell, User } from 'lucide-react';
import '../styles/BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  
  const NAV_ITEMS = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: null, icon: Plus, label: 'Review', isAdd: true },
    { path: '/notifications', icon: Bell, label: 'Alerts' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];
  const handleAddClick = () => {
    // Navigate to a generic "add review" page — user picks shop there
    navigate('/write-review');
  };

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item, idx) => {
        if (item.isAdd) {
          return (
            <button
              key="add"
              className="bottom-nav-add"
              onClick={handleAddClick}
              aria-label="Write a review"
            >
              <item.icon size={28} />
            </button>
          );
        }

        const isActive = pathname === item.path ||
          (item.path === '/home' && pathname === '/');

        if (item.path === '/profile' && user && (user.role === 'govt' || user.role === 'admin')) {
          return (
            <button
              key={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="bottom-nav-icon">
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="bottom-nav-icon">
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
