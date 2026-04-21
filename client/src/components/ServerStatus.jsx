import React, { useState, useEffect } from 'react';
import { API_URL } from '../utils/api';

// Shows a banner if the server is unreachable
const ServerStatus = () => {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(4000) });
        if (res.ok) setOffline(false);
        else setOffline(true);
      } catch {
        setOffline(true);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!offline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#EF4444',
        color: 'white',
        textAlign: 'center',
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font)',
      }}
      role="alert"
    >
      Can't reach the server. Make sure it's running on port 5000.
    </div>
  );
};

export default ServerStatus;
