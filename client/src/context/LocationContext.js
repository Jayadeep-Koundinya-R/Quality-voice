import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({ city: '', district: '', area: '' });
  // homeLocation = the GPS-detected or last GPS location, used to detect explorer mode
  const [homeLocation, setHomeLocation] = useState({ city: '', district: '', area: '' });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Load saved location from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('qv_location');
    if (saved) setLocation(JSON.parse(saved));

    const savedHome = localStorage.getItem('qv_home_location');
    if (savedHome) setHomeLocation(JSON.parse(savedHome));
  }, []);

  // isExplorerMode: true when the selected city differs from the GPS home city
  const isExplorerMode =
    homeLocation.city.trim().length > 0 &&
    location.city.trim().length > 0 &&
    location.city.trim().toLowerCase() !== homeLocation.city.trim().toLowerCase();

  // Manual location update — does NOT update homeLocation
  const updateLocation = (newLocation) => {
    setLocation(newLocation);
    localStorage.setItem('qv_location', JSON.stringify(newLocation));
  };

  // Reset back to home/GPS location
  const resetToHome = () => {
    if (homeLocation.city) {
      setLocation(homeLocation);
      localStorage.setItem('qv_location', JSON.stringify(homeLocation));
    }
  };

  // GPS detection — updates BOTH location and homeLocation
  const detectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by your browser');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          const detected = {
            city:     addr.city || addr.town || addr.village || '',
            district: addr.county || addr.state_district || '',
            area:     addr.suburb || addr.neighbourhood || addr.road || '',
          };
          // GPS sets both current location and home location
          setLocation(detected);
          setHomeLocation(detected);
          localStorage.setItem('qv_location', JSON.stringify(detected));
          localStorage.setItem('qv_home_location', JSON.stringify(detected));
        } catch {
          setGpsError('Could not detect location. Please set manually.');
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsError('Location access denied. Please set manually.');
        setGpsLoading(false);
      }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        homeLocation,
        isExplorerMode,
        updateLocation,
        resetToHome,
        detectGPS,
        gpsLoading,
        gpsError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
