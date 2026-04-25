import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { 
  ArrowLeft, Check, Sparkles, Shield, BarChart3, 
  Crown, Gem, Rocket, Gift, Smartphone 
} from 'lucide-react';
import '../styles/Premium.css';

const TIER_CARDS = [
  {
    id: 'free',
    name: 'Standard',
    price: 'Free',
    desc: 'For casual explorers',
    icon: <Rocket size={24} className="tier-icon" />,
    features: [
      'Write reviews & upload photos',
      'Basic search & filters',
      'Follow your friends',
      'Standard badges'
    ],
    btnText: 'Current Plan',
    active: true,
    premium: false
  },
  {
    id: 'pro',
    name: 'Pro Member',
    price: '₹149',
    period: '/mo',
    desc: 'For power contributors',
    icon: <Gem size={24} className="tier-icon" />,
    features: [
      'Everything in Standard',
      'Ad-free experience',
      'Advanced analytics dashboard',
      'Exclusive "Pro" profile badge',
      'Early access to new features'
    ],
    btnText: 'Upgrade to Pro',
    active: false,
    premium: true,
    highlight: true
  },
  {
    id: 'business',
    name: 'Local Business',
    price: '₹499',
    period: '/mo',
    desc: 'For shop owners',
    icon: <Crown size={24} className="tier-icon" />,
    features: [
      'Verify your shop listing',
      'Reply to reviews officially',
      'Customer sentiment analysis',
      'Priority support access',
      'Custom promo banners'
    ],
    btnText: 'Go Business',
    active: false,
    premium: true
  }
];

const PremiumPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleUpgrade = (tier) => {
    if (tier.active) return;
    toast.success(`Redirecting to payment for ${tier.name} plan...`);
    // Simulate payment flow
    setTimeout(() => {
      toast.info("This is a demo. In production, this would open Stripe/Razorpay.");
    }, 2000);
  };

  return (
    <div className="premium-page">
      <div className="content-container">
        {/* Header */}
        <header className="premium-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div className="premium-hero">
            <div className="premium-badge">
              <Sparkles size={14} /> <span>Premium</span>
            </div>
            <h1>Unlock the full potential</h1>
            <p>Go beyond reviews with advanced tools and exclusive community benefits.</p>
          </div>
        </header>

        {/* Tier Grid */}
        <div className="tier-grid">
          {TIER_CARDS.map((tier) => (
            <div key={tier.id} className={`tier-card ${tier.highlight ? 'tier-card--highlight' : ''}`}>
              {tier.highlight && <div className="tier-card-tag">Best Value</div>}
              <div className="tier-card-header">
                <div className="tier-icon-wrap" style={{ 
                  background: tier.highlight ? 'var(--brand)' : 'var(--bg3)',
                  color: tier.highlight ? 'white' : 'var(--text1)'
                }}>
                  {tier.icon}
                </div>
                <div className="tier-name">{tier.name}</div>
                <div className="tier-price">
                  <span className="price-val">{tier.price}</span>
                  {tier.period && <span className="price-period">{tier.period}</span>}
                </div>
                <p className="tier-desc">{tier.desc}</p>
              </div>

              <ul className="tier-features">
                {tier.features.map((f, i) => (
                  <li key={i}>
                    <div className="feature-check">
                      <Check size={12} />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`tier-btn ${tier.highlight ? 'btn-primary' : 'btn-outline'}`}
                disabled={tier.active}
                onClick={() => handleUpgrade(tier)}
              >
                {tier.btnText}
              </button>
            </div>
          ))}
        </div>

        {/* Benefit Section */}
        <section className="premium-benefits">
          <h2 className="section-title">Exclusive Benefits</h2>
          <div className="benefit-list">
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
                <Shield size={20} />
              </div>
              <div className="benefit-text">
                <h3>Priority Support</h3>
                <p>Premium members get 24/7 dedicated support from our local community team.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                <BarChart3 size={20} />
              </div>
              <div className="benefit-text">
                <h3>Advanced Analytics</h3>
                <p>Deep dive into your contribution stats and see your impact on local shops.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}>
                <Gift size={20} />
              </div>
              <div className="benefit-text">
                <h3>Early Access</h3>
                <p>Be the first to try out experimental features before they roll out to everyone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Device Sync Info */}
        <div className="premium-sync-banner">
          <Smartphone size={24} />
          <div className="sync-banner-text">
            <h4>Sync across all your devices</h4>
            <p>One subscription works on mobile, web, and tablet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
