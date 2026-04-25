import React from 'react';
import { useLocation } from 'react-router-dom';

const GlobalBackground = () => {
  const location = useLocation();
  
  // Disable global background on pages that have their own custom backgrounds
  const hideOnPaths = ['/'];
  if (hideOnPaths.includes(location.pathname)) return null;

  return (
    <div className="global-bg-orbs" aria-hidden="true">
      <div className="global-orb orb-1" />
      <div className="global-orb orb-2" />
      <div className="global-orb orb-3" />
      <div className="global-orb orb-4" />
    </div>
  );
};

export default GlobalBackground;
