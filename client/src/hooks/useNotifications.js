import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, getUnreadCount } from '../utils/api';

/**
 * Custom hook for managing real-time notifications
 * Implements polling mechanism for notification updates
 */
export const useNotifications = (enabled = true) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);
  const lastCheckRef = useRef(Date.now());

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setError(null);
      const { data } = await getNotifications();
      setNotifications(data.notifications || []);
      
      // Update unread count
      const unread = data.notifications?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
      
      lastCheckRef.current = Date.now();
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!enabled) return;
    
    try {
      const { data } = await getUnreadCount();
      // Backend returns { count }, not { unreadCount }
      setUnreadCount(data.count || data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [enabled]);

  // Start polling for new notifications
  const startPolling = useCallback((interval = 30000) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    // Initial fetch
    fetchNotifications();
    
    // Poll at specified interval
    pollIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, interval);
  }, [fetchNotifications]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Setup polling on mount
  useEffect(() => {
    if (enabled) {
      startPolling();
    }
    
    return () => stopPolling();
  }, [enabled, startPolling, stopPolling]);

  // Listen for visibility changes to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startPolling, stopPolling]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    refetchUnreadCount: fetchUnreadCount,
    startPolling,
    stopPolling
  };
};

export default useNotifications;
