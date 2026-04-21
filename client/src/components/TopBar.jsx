import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { MapPin, Search, ChevronDown, Navigation2, Settings } from 'lucide-react';
import '../styles/TopBar.css';

const TopBar = ({ showSearch = true }) => {
  const navigate = useNavigate();
  const { location, updateLocation, detectGPS, gpsLoading, gpsError } = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    city: location.city,
    district: location.district,
    area: location.area
  });

  const locationLabel = location.city
    ? `${location.area ? location.area + ', ' : ''}${location.city}`
    : 'Set location';

  const handleSave = () => {
    updateLocation(form);
    setShowModal(false);
  };

  const handleGPS = async () => {
    await detectGPS();
    setShowModal(false);
  };

  const openModal = () => {
    setForm({ city: location.city, district: location.district, area: location.area });
    setShowModal(true);
  };

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-logo">
          Quality<span>Voice</span>
        </div>

        <button
          className="top-bar-location"
          onClick={openModal}
          aria-label="Change location"
        >
          <MapPin size={14} color="var(--primary)" />
          <span className="top-bar-location-text">{locationLabel}</span>
          <ChevronDown size={13} className="top-bar-chevron" />
        </button>

        <div className="top-bar-actions">
          {showSearch && (
            <button
              className="icon-btn"
              onClick={() => navigate('/search')}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          )}
          <button
            className="icon-btn"
            onClick={() => navigate('/settings')}
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {showModal && (
        <div
          className="location-modal-overlay"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Set location"
        >
          <div
            className="location-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="location-modal-handle" />
            <h3>
              <MapPin size={18} color="var(--primary)" />
              Where are you?
            </h3>

            {gpsError && <div className="error-msg">{gpsError}</div>}

            <button
              className="btn-gps"
              onClick={handleGPS}
              disabled={gpsLoading}
            >
              <Navigation2 size={16} />
              {gpsLoading ? 'Detecting your location...' : 'Use my current location'}
            </button>

            <div className="location-or-divider" style={{ margin: '14px 0' }}>
              or enter manually
            </div>

            <div className="location-modal-actions">
              <div className="form-group">
                <label htmlFor="loc-city">City</label>
                <input
                  id="loc-city"
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="loc-district">District</label>
                <input
                  id="loc-district"
                  type="text"
                  placeholder="e.g. Andheri"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="loc-area">Area / Neighbourhood</label>
                <input
                  id="loc-area"
                  type="text"
                  placeholder="e.g. Versova"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                />
              </div>
              <button className="btn-primary" onClick={handleSave}>
                Save Location
              </button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
