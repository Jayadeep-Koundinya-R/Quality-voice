import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import '../styles/PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return; // Don't show again for 7 days
    }

    const handler = e => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay so it doesn't feel intrusive
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="pwa-prompt" role="dialog" aria-label="Install QualityVoice app">
      <div className="pwa-prompt-icon">
        <Smartphone size={24} />
      </div>
      <div className="pwa-prompt-content">
        <p className="pwa-prompt-title">Add to Home Screen</p>
        <p className="pwa-prompt-subtitle">
          Install QualityVoice for faster access and offline support
        </p>
      </div>
      <div className="pwa-prompt-actions">
        <button className="pwa-install-btn" onClick={handleInstall}>
          <Download size={15} />
          Install
        </button>
        <button className="pwa-dismiss-btn" onClick={handleDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
