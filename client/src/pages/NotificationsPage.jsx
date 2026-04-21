import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllRead, markOneRead } from '../utils/api';
import { MessageSquare, Heart, ShieldCheck, CheckCheck, Bell } from 'lucide-react';
import '../styles/Notifications.css';

/* ─── Config ─────────────────────────────────────────────────────────────────── */
const ICONS = {
  comment:         { icon: MessageSquare, color: '#4F46E5', bg: '#EEF2FF' },
  like:            { icon: Heart,         color: '#EF4444', bg: '#FEF2F2' },
  badge:           { icon: ShieldCheck,   color: '#10B981', bg: '#ECFDF5' },
  report_reviewed: { icon: CheckCheck,    color: '#F59E0B', bg: '#FEF3C7' },
};

const timeAgo = dateStr => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const notificationText = n => {
  const actor = n.actorId?.name || 'Someone';
  switch (n.type) {
    case 'comment':         return { title: `${actor} commented on your review`, body: n.commentText ? `"${n.commentText}"` : '', shop: n.shopId?.name };
    case 'like':            return { title: `${actor} liked your review`, body: '', shop: n.shopId?.name };
    case 'badge':           return { title: 'Your shop got a Govt Badge!', body: 'A government official verified this shop.', shop: n.shopId?.name };
    case 'report_reviewed': return { title: 'Your report was reviewed', body: 'A government official looked into your report.', shop: n.shopId?.name };
    default:                return { title: 'New notification', body: '', shop: '' };
  }
};

/* ─── Group notifications by recency ────────────────────────────────────────── */
const groupNotifications = notifications => {
  const now = Date.now();
  const today = [], thisWeek = [], earlier = [];
  notifications.forEach(n => {
    const diff = now - new Date(n.createdAt).getTime();
    const hours = diff / 3600000;
    if (hours < 24) today.push(n);
    else if (hours < 168) thisWeek.push(n);
    else earlier.push(n);
  });
  return [
    { label: 'Today', items: today },
    { label: 'This Week', items: thisWeek },
    { label: 'Earlier', items: earlier },
  ].filter(g => g.items.length > 0);
};

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getNotifications();
        setNotifications(data.notifications);
      } catch {
        setError('Could not load notifications right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleTap = async n => {
    if (!n.read) {
      await markOneRead(n._id);
      setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
    }
    if (n.shopId?._id) navigate(`/shop/${n.shopId._id}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const groups = groupNotifications(notifications);

  return (
    <div className="notifications-page">
      <div className="content-container">

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div className="notif-header">
          <div>
            <h1 className="notif-title">Notifications</h1>
            {unreadCount > 0 && (
              <p className="notif-unread-count">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all-btn" onClick={handleMarkAllRead}>
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
        </div>

        {/* ── LOADING ──────────────────────────────────────────────────── */}
        {loading && <div className="spinner-wrap"><div className="spinner" /></div>}

        {/* ── ERROR ────────────────────────────────────────────────────── */}
        {error && <div className="error-msg">{error}</div>}

        {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
        {!loading && !error && notifications.length === 0 && (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <Bell size={32} strokeWidth={1.5} />
            </div>
            <h2 className="notif-empty-title">All caught up!</h2>
            <p className="notif-empty-sub">
              When someone likes or comments on your review, you'll see it here.
            </p>
          </div>
        )}

        {/* ── GROUPED LIST ─────────────────────────────────────────────── */}
        {!loading && !error && groups.map(({ label, items }) => (
          <div key={label} className="notif-group">
            <p className="notif-group-label">{label}</p>
            <div className="notif-list">
              {items.map(n => {
                const { icon: Icon, color, bg } = ICONS[n.type] || ICONS.comment;
                const { title, body, shop } = notificationText(n);
                return (
                  <button
                    key={n._id}
                    className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}
                    onClick={() => handleTap(n)}
                  >
                    {/* Icon */}
                    <div className="notif-icon" style={{ background: bg }}>
                      <Icon size={18} color={color} />
                    </div>

                    {/* Content */}
                    <div className="notif-content">
                      <p className="notif-item-title">{title}</p>
                      {body && <p className="notif-item-body">{body}</p>}
                      {shop && <p className="notif-item-shop">{shop}</p>}
                      <p className="notif-item-time">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && <div className="notif-dot" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default NotificationsPage;
