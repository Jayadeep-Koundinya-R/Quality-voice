import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { MapPin, Navigation2, ArrowRight, Utensils, Wrench, ShoppingBag, Package } from 'lucide-react';
import '../styles/Onboarding.css';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal'
];

const INTERESTS = [
  { label: 'Food & Restaurants', icon: Utensils, value: 'Food' },
  { label: 'Services', icon: Wrench, value: 'Services' },
  { label: 'Shops', icon: ShoppingBag, value: 'Shops' },
  { label: 'Products', icon: Package, value: 'Products' },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { updateLocation, detectGPS, gpsLoading } = useLocation();

  const [step, setStep] = useState(1); // 1 = location, 2 = interests
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [gpsError, setGpsError] = useState('');

  const handleGPS = async () => {
    setGpsError('');
    try {
      await detectGPS();
      setStep(2);
    } catch {
      setGpsError('Could not detect location. Please enter manually.');
    }
  };

  const handleCitySelect = (c) => {
    setCity(c);
  };

  const handleNext = () => {
    if (!city) return;
    updateLocation({ city, district: '', area });
    setStep(2);
  };

  const toggleInterest = (val) => {
    setSelectedInterests((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleFinish = () => {
    localStorage.setItem('qv_onboarded', 'true');
    navigate('/home');
  };

  return (
    <div className="onboarding-page">
      {/* Progress dots */}
      <div className="onboarding-progress">
        <div className={`onboarding-dot ${step >= 1 ? 'active' : ''}`} />
        <div className={`onboarding-dot ${step >= 2 ? 'active' : ''}`} />
      </div>

      {step === 1 && (
        <div className="onboarding-step">
          <div className="onboarding-icon">
            <MapPin size={32} />
          </div>
          <h1>Where are you?</h1>
          <p>We'll show you the best shops and restaurants near you.</p>

          {gpsError && <div className="error-msg">{gpsError}</div>}

          <button
            className="onboarding-gps-btn"
            onClick={handleGPS}
            disabled={gpsLoading}
          >
            <Navigation2 size={18} />
            {gpsLoading ? 'Finding your location...' : 'Use my current location'}
          </button>

          <div className="onboarding-divider">or pick your city</div>

          <div className="city-grid">
            {CITIES.map((c) => (
              <button
                key={c}
                className={`city-chip ${city === c ? 'selected' : ''}`}
                onClick={() => handleCitySelect(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {city && (
            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="area-input">Your area / neighbourhood (optional)</label>
              <input
                id="area-input"
                type="text"
                placeholder="e.g. Koramangala, Bandra, Connaught Place"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          )}

          <button
            className="onboarding-next-btn"
            onClick={handleNext}
            disabled={!city}
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-step">
          <div className="onboarding-icon">
            <ShoppingBag size={32} />
          </div>
          <h1>What do you care about?</h1>
          <p>Pick the categories you want to see first in your feed.</p>

          <div className="interest-grid">
            {INTERESTS.map(({ label, icon: Icon, value }) => (
              <button
                key={value}
                className={`interest-card ${selectedInterests.includes(value) ? 'selected' : ''}`}
                onClick={() => toggleInterest(value)}
              >
                <div className="interest-icon">
                  <Icon size={24} />
                </div>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            className="onboarding-next-btn"
            onClick={handleFinish}
            style={{ marginTop: 32 }}
          >
            Take me to the app <ArrowRight size={18} />
          </button>

          <button
            className="onboarding-skip-btn"
            onClick={handleFinish}
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
