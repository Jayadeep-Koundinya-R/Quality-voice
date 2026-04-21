import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Star, MapPin, Mic2, ArrowRight } from 'lucide-react';
import '../styles/Landing.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      {/* Decorative blobs */}
      <div className="landing-blob landing-blob-1" aria-hidden="true" />
      <div className="landing-blob landing-blob-2" aria-hidden="true" />

      <div className="landing-content">
        {/* Logo */}
        <div className="landing-logo">
          <div className="landing-logo-icon" aria-hidden="true">
            <Mic2 size={32} strokeWidth={2.5} />
          </div>
          <h1>Quality<span>Voice</span></h1>
        </div>

        {/* Tagline */}
        <p className="landing-tagline">
          Your honest review can help someone make a better choice — and push bad businesses to do better.
        </p>

        {/* Feature pills */}
        <div className="feature-pills">
          <div className="feature-pill">
            <Star size={13} />
            Real reviews
          </div>
          <div className="feature-pill">
            <ShieldCheck size={13} />
            Govt verified
          </div>
          <div className="feature-pill">
            <MapPin size={13} />
            Near you
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="landing-actions">
          <button
            className="btn-landing-primary"
            onClick={() => navigate('/signup')}
          >
            Get started — it's free
            <ArrowRight size={18} />
          </button>
          <button
            className="btn-landing-secondary"
            onClick={() => navigate('/login')}
          >
            I already have an account
          </button>
        </div>

        {/* Social proof */}
        <div className="social-proof">
          <div className="social-proof-avatars" aria-hidden="true">
            {['R', 'P', 'A', 'S'].map((l, i) => (
              <div key={i} className="social-proof-avatar">{l}</div>
            ))}
          </div>
          <span>10,000+ people already rating their city</span>
        </div>
      </div>

      <p className="landing-footer">
        🇮🇳 Built for India · Every voice counts
      </p>
    </main>
  );
};

export default LandingPage;
