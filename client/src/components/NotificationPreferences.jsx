import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Heart, Award, ShoppingBag, Settings } from 'lucide-react';
import { useToast } from './common/Toast';
import '../styles/NotificationPreferences.css';

const NotificationPreferences = () => {
  const toast = useToast();
  const [preferences, setPreferences] = useState({
    newComments: true,
    helpfulVotes: true,
    badgeEarned: true,
    shopUpdates: true,
    followedUserReviews: true,
    promotions: false,
    weeklyDigest: true,
    pushNotifications: true,
    emailNotifications: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    }
  }, []);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      
      // TODO: Send to backend API when available
      // await updateNotificationPreferences(preferences);
      
      toast.success('Notification preferences saved!');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const PreferenceToggle = ({ icon: Icon, label, description, value, onChange }) => (
    <div className="pref-item">
      <div className="pref-header">
        <div className="pref-icon">
          <Icon size={18} />
        </div>
        <div className="pref-label-group">
          <div className="pref-label">{label}</div>
          <div className="pref-description">{description}</div>
        </div>
      </div>
      <label className="pref-toggle">
        <input
          type="checkbox"
          checked={value}
          onChange={onChange}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );

  return (
    <div className="notification-preferences">
      <div className="pref-header-section">
        <h2 className="pref-title">
          <Bell size={20} />
          Notification Preferences
        </h2>
        <p className="pref-subtitle">
          Customize how and when you receive notifications
        </p>
      </div>

      <div className="pref-sections">
        {/* Activity Notifications */}
        <div className="pref-section">
          <h3 className="pref-section-title">Activity Notifications</h3>
          <div className="pref-items">
            <PreferenceToggle
              icon={MessageSquare}
              label="New Comments"
              description="When someone comments on your review"
              value={preferences.newComments}
              onChange={() => handleToggle('newComments')}
            />
            <PreferenceToggle
              icon={Heart}
              label="Helpful Votes"
              description="When someone marks your review as helpful"
              value={preferences.helpfulVotes}
              onChange={() => handleToggle('helpfulVotes')}
            />
            <PreferenceToggle
              icon={Award}
              label="Badge Earned"
              description="When you earn a new achievement badge"
              value={preferences.badgeEarned}
              onChange={() => handleToggle('badgeEarned')}
            />
          </div>
        </div>

        {/* Content Notifications */}
        <div className="pref-section">
          <h3 className="pref-section-title">Content Notifications</h3>
          <div className="pref-items">
            <PreferenceToggle
              icon={ShoppingBag}
              label="Shop Updates"
              description="When shops you follow post updates"
              value={preferences.shopUpdates}
              onChange={() => handleToggle('shopUpdates')}
            />
            <PreferenceToggle
              icon={MessageSquare}
              label="Followed User Reviews"
              description="When users you follow post new reviews"
              value={preferences.followedUserReviews}
              onChange={() => handleToggle('followedUserReviews')}
            />
            <PreferenceToggle
              icon={Bell}
              label="Weekly Digest"
              description="Get a summary of activity once a week"
              value={preferences.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
            />
          </div>
        </div>

        {/* Delivery Method */}
        <div className="pref-section">
          <h3 className="pref-section-title">Delivery Method</h3>
          <div className="pref-items">
            <PreferenceToggle
              icon={Bell}
              label="Push Notifications"
              description="Receive notifications in your browser"
              value={preferences.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
            <PreferenceToggle
              icon={Settings}
              label="Email Notifications"
              description="Receive notifications via email"
              value={preferences.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
          </div>
        </div>

        {/* Marketing */}
        <div className="pref-section">
          <h3 className="pref-section-title">Marketing</h3>
          <div className="pref-items">
            <PreferenceToggle
              icon={ShoppingBag}
              label="Promotions & Offers"
              description="Receive promotional content and special offers"
              value={preferences.promotions}
              onChange={() => handleToggle('promotions')}
            />
          </div>
        </div>
      </div>

      <div className="pref-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
