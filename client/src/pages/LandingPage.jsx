import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Star, MapPin, Mic2, ArrowRight, Sparkles, Users, Building2, Search, MessageSquare, Award, Heart, Quote, ChevronLeft, ChevronRight, Target, TrendingUp, SearchCheck, PenLine, BadgeCheck, Mail, ExternalLink } from 'lucide-react';
import '../styles/Landing.css';

// Custom SVG Icon Components for Social Media
const TwitterXIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedinIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// Animated Counter Hook
const useAnimatedCounter = (endValue, isVisible, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * endValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isVisible, endValue, duration]);

  return count;
};

// Social Proof Stats Data
const socialProofStats = [
  {
    id: 1,
    icon: Users,
    value: 50000,
    suffix: '+',
    label: 'Active Users',
    description: 'Trusted reviewers across India',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#818cf8'
  },
  {
    id: 2,
    icon: MessageSquare,
    value: 120000,
    suffix: '+',
    label: 'Reviews Written',
    description: 'Genuine customer feedback',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f472b6'
  },
  {
    id: 3,
    icon: Building2,
    value: 25000,
    suffix: '+',
    label: 'Shops Rated',
    description: 'Local businesses reviewed',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#22d3ee'
  },
  {
    id: 4,
    icon: MapPin,
    value: 850,
    suffix: '+',
    label: 'Cities Covered',
    description: 'Pan-India presence',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#34d399'
  }
];

// Social Proof Card Component
const SocialProofCard = ({ stat, isVisible, index }) => {
  const count = useAnimatedCounter(stat.value, isVisible, 2000 + index * 300);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    }
    return num.toString();
  };

  return (
    <div 
      className={`social-proof-card ${isVisible ? 'visible' : ''}`}
      style={{ 
        '--stat-color': stat.color,
        '--stat-gradient': stat.gradient,
        animationDelay: `${index * 0.15}s`
      }}
    >
      <div className="social-proof-card-glow" />
      <div className="social-proof-card-icon">
        <stat.icon size={24} strokeWidth={1.5} />
      </div>
      <div className="social-proof-card-value">
        {formatNumber(count)}{stat.suffix}
      </div>
      <div className="social-proof-card-label">{stat.label}</div>
      <div className="social-proof-card-description">{stat.description}</div>
    </div>
  );
};

// Social Proof Section Component
const SocialProofSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="social-proof-section">
      <div className="social-proof-header">
        <div className="social-proof-badge">
          <TrendingUp size={14} />
          <span>Growing Every Day</span>
        </div>
        <h2 className="social-proof-title">
          Trusted by <span className="gradient-text">Millions</span>
        </h2>
        <p className="social-proof-subtitle">
          Join India's fastest-growing community of reviewers and discover local businesses
        </p>
      </div>
      
      <div className="social-proof-grid">
        {socialProofStats.map((stat, index) => (
          <SocialProofCard 
            key={stat.id} 
            stat={stat} 
            isVisible={isVisible}
            index={index}
          />
        ))}
      </div>

      <div className={`social-proof-cta ${isVisible ? 'visible' : ''}`}>
        <div className="social-proof-cta-content">
          <Target size={20} />
          <span>Ready to make your voice heard?</span>
        </div>
        <button className="social-proof-cta-button" onClick={() => window.location.href = '/signup'}>
          Get Started <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    avatar: 'P',
    rating: 5,
    excerpt: 'Quality Voice helped me discover amazing local restaurants that I never knew existed. The reviews are genuine and trustworthy!',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    name: 'Rahul Verma',
    location: 'Delhi, NCR',
    avatar: 'R',
    rating: 5,
    excerpt: 'As a small business owner, having my shop on Quality Voice has brought in so many new customers. The verification badge builds trust.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    name: 'Anjali Patel',
    location: 'Bangalore, Karnataka',
    avatar: 'A',
    rating: 5,
    excerpt: 'I love how easy it is to write reviews and help others make informed decisions. The community here is so supportive!',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Jaipur, Rajasthan',
    avatar: 'V',
    rating: 4,
    excerpt: 'Found the best AC repair service through Quality Voice. The detailed reviews saved me from getting scammed. Highly recommend!',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 5,
    name: 'Meera Nair',
    location: 'Kochi, Kerala',
    avatar: 'M',
    rating: 5,
    excerpt: 'The government verification feature is brilliant! I always look for that badge when choosing any service. It gives peace of mind.',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
];

// Testimonial Card Component
const TestimonialCard = ({ testimonial, isActive }) => {
  return (
    <div className={`testimonial-card ${isActive ? 'active' : ''}`}>
      <div className="testimonial-quote-icon">
        <Quote size={24} />
      </div>
      <p className="testimonial-excerpt">{testimonial.excerpt}</p>
      <div className="testimonial-rating">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            fill={i < testimonial.rating ? '#fbbf24' : 'none'}
            color={i < testimonial.rating ? '#fbbf24' : '#6b7280'}
          />
        ))}
      </div>
      <div className="testimonial-author">
        <div 
          className="testimonial-avatar" 
          style={{ background: testimonial.gradient }}
        >
          {testimonial.avatar}
        </div>
        <div className="testimonial-info">
          <span className="testimonial-name">{testimonial.name}</span>
          <span className="testimonial-location">{testimonial.location}</span>
        </div>
      </div>
    </div>
  );
};

// Testimonials Section Component
const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  useEffect(() => {
    if (!isAutoRotating) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const handlePrev = () => {
    setIsAutoRotating(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoRotating(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleDotClick = (index) => {
    setIsAutoRotating(false);
    setActiveIndex(index);
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <h2 className="testimonials-title">
          What Our <span className="gradient-text">Users Say</span>
        </h2>
        <p className="testimonials-subtitle">
          Join thousands of happy users who trust Quality Voice for authentic reviews
        </p>
      </div>
      
      <div 
        className="testimonials-carousel"
        onMouseEnter={() => setIsAutoRotating(false)}
        onMouseLeave={() => setIsAutoRotating(true)}
      >
        <button 
          className="testimonial-nav testimonial-nav-prev" 
          onClick={handlePrev}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="testimonials-track">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className={`testimonial-slide ${index === activeIndex ? 'active' : ''} ${index === (activeIndex - 1 + testimonials.length) % testimonials.length ? 'prev' : ''} ${index === (activeIndex + 1) % testimonials.length ? 'next' : ''}`}
            >
              <TestimonialCard 
                testimonial={testimonial} 
                isActive={index === activeIndex}
              />
            </div>
          ))}
        </div>
        
        <button 
          className="testimonial-nav testimonial-nav-next" 
          onClick={handleNext}
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="testimonials-dots">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`testimonial-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

// How It Works data - 3-step process
const howItWorksSteps = [
  {
    id: 1,
    icon: SearchCheck,
    title: 'Discover',
    description: 'Search for local businesses in your area. Browse verified shops with genuine reviews from real customers.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#818cf8'
  },
  {
    id: 2,
    icon: PenLine,
    title: 'Review',
    description: 'Share your experience by writing detailed reviews. Add photos and ratings to help others make informed decisions.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f472b6'
  },
  {
    id: 3,
    icon: BadgeCheck,
    title: 'Verify',
    description: 'Look for the government verification badge on trusted businesses. Earn rewards as a trusted community reviewer.',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#34d399'
  }
];

// How It Works Step Card Component
const HowItWorksStep = ({ step, isVisible, index }) => {
  return (
    <div 
      className={`how-it-works-step ${isVisible ? 'visible' : ''}`}
      style={{ 
        '--step-color': step.color,
        '--step-gradient': step.gradient,
        animationDelay: `${index * 0.2}s`
      }}
    >
      <div className="how-it-works-step-number">{step.id}</div>
      <div className="how-it-works-step-illustration">
        <div className="how-it-works-step-icon">
          <step.icon size={32} strokeWidth={1.5} />
        </div>
        <div className="how-it-works-step-glow" />
      </div>
      <h3 className="how-it-works-step-title">{step.title}</h3>
      <p className="how-it-works-step-description">{step.description}</p>
      {index < howItWorksSteps.length - 1 && (
        <div className="how-it-works-connector">
          <ArrowRight size={20} />
        </div>
      )}
    </div>
  );
};

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const navigationLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ];

  const socialLinks = [
    { 
      icon: TwitterXIcon, 
      label: 'X (Twitter)', 
      href: 'https://twitter.com/qualityvoice',
      color: '#000000'
    },
    { 
      icon: InstagramIcon, 
      label: 'Instagram', 
      href: 'https://instagram.com/qualityvoice',
      color: '#E4405F'
    },
    { 
      icon: FacebookIcon, 
      label: 'Facebook', 
      href: 'https://facebook.com/qualityvoice',
      color: '#1877F2'
    },
    { 
      icon: LinkedinIcon, 
      label: 'LinkedIn', 
      href: 'https://linkedin.com/company/qualityvoice',
      color: '#0A66C2'
    },
    { 
      icon: Mail, 
      label: 'Email', 
      href: 'mailto:hello@qualityvoice.in',
      color: '#EA4335'
    },
  ];

  return (
    <footer className="landing-footer-section">
      <div className="footer-glow" />
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Mic2 size={24} strokeWidth={2.5} />
            </div>
            <span className="footer-logo-text">Quality<span className="gradient-text">Voice</span></span>
          </div>
          <p className="footer-tagline">
            Your voice matters. Shape your city's story by sharing authentic reviews and helping others make better choices.
          </p>
          <div className="footer-social">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="footer-social-link"
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                style={{ '--social-color': social.color }}
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="footer-nav">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            {navigationLinks.map((link, index) => (
              <li key={index}>
                <a href={link.href} className="footer-link">
                  {link.label}
                  <ExternalLink size={12} className="footer-link-icon" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Links */}
        <div className="footer-nav">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            {legalLinks.map((link, index) => (
              <li key={index}>
                <a href={link.href} className="footer-link">
                  {link.label}
                  <ExternalLink size={12} className="footer-link-icon" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact CTA */}
        <div className="footer-contact">
          <h4 className="footer-heading">Get in Touch</h4>
          <p className="footer-contact-text">
            Have questions or suggestions? We'd love to hear from you.
          </p>
          <a href="mailto:hello@qualityvoice.in" className="footer-contact-button">
            Contact Us
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="footer-copyright">
            © {currentYear} Quality Voice. All rights reserved.
          </p>
          <p className="footer-made-with">
            Made with <Heart size={14} className="footer-heart" /> for India
          </p>
        </div>
      </div>
    </footer>
  );
};

// How It Works Section Component
const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="how-it-works-section">
      <div className="how-it-works-header">
        <h2 className="how-it-works-title">
          How It <span className="gradient-text">Works</span>
        </h2>
        <p className="how-it-works-subtitle">
          Get started in three simple steps
        </p>
      </div>
      
      <div className="how-it-works-steps">
        {howItWorksSteps.map((step, index) => (
          <HowItWorksStep 
            key={step.id} 
            step={step} 
            isVisible={isVisible}
            index={index}
          />
        ))}
      </div>

      <div className={`how-it-works-cta ${isVisible ? 'visible' : ''}`}>
        <button className="how-it-works-cta-button" onClick={() => window.location.href = '/signup'}>
          Start Exploring <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate floating shapes for the animated background
  const floatingShapes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    type: ['circle', 'square', 'triangle'][i % 3],
    size: 40 + (i % 3) * 30,
    delay: i * 0.5,
    duration: 15 + (i % 4) * 3,
    left: 5 + (i * 8) % 90,
    top: 5 + (i * 7) % 85,
    opacity: 0.03 + (i % 4) * 0.02,
  }));

  // Generate particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: 2 + (i % 3) * 2,
    delay: i * 0.3,
    duration: 8 + (i % 5) * 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
  }));

  // Feature highlights data - 6 key features
  const features = [
    {
      icon: Search,
      title: 'Discover Trusted Shops',
      description: 'Find verified businesses with genuine reviews from real customers in your city.',
      color: '#818cf8',
      animation: 'float',
    },
    {
      icon: MessageSquare,
      title: 'Share Your Voice',
      description: 'Write detailed reviews with photos to help others make informed decisions.',
      color: '#34d399',
      animation: 'pulse',
    },
    {
      icon: ShieldCheck,
      title: 'Govt Verified Badges',
      description: 'Trust shops with official government verification badges for authenticity.',
      color: '#fbbf24',
      animation: 'glow',
    },
    {
      icon: Award,
      title: 'Earn Rewards',
      description: 'Earn points, badges, and climb the leaderboard as you contribute reviews.',
      color: '#f472b6',
      animation: 'bounce',
    },
    {
      icon: Heart,
      title: 'Support Local Business',
      description: 'Help your community thrive by sharing honest feedback and supporting local shops.',
      color: '#f87171',
      animation: 'heartbeat',
    },
    {
      icon: Users,
      title: 'Build Your Reputation',
      description: 'Become a trusted reviewer and connect with a community that values your voice.',
      color: '#60a5fa',
      animation: 'wave',
    },
  ];

  // Scroll animation observer
  const sectionRef = useRef(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main className="landing-page">
      {/* Animated background layer */}
      <div className="hero-background">
        {/* Gradient orbs */}
        <div className="gradient-orb gradient-orb-1" aria-hidden="true" />
        <div className="gradient-orb gradient-orb-2" aria-hidden="true" />
        <div className="gradient-orb gradient-orb-3" aria-hidden="true" />
        
        {/* Floating geometric shapes */}
        {floatingShapes.map((shape) => (
          <div
            key={shape.id}
            className={`floating-shape floating-shape-${shape.type}`}
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              animationDelay: `${shape.delay}s`,
              animationDuration: `${shape.duration}s`,
              opacity: shape.opacity,
            }}
            aria-hidden="true"
          />
        ))}

        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
            aria-hidden="true"
          />
        ))}

        {/* Grid overlay */}
        <div className="grid-overlay" aria-hidden="true" />
      </div>

      <div className={`landing-content ${isVisible ? 'visible' : ''}`}>
        {/* Logo with glow effect */}
        <div className="landing-logo">
          <div className="landing-logo-icon" aria-hidden="true">
            <Mic2 size={32} strokeWidth={2.5} />
          </div>
          <h1 className="hero-title">
            Quality<span className="gradient-text">Voice</span>
          </h1>
        </div>

        {/* Headline */}
        <h2 className={`hero-headline ${isVisible ? 'visible' : ''}`}>
          Your Voice Matters.
          <br />
          <span className="headline-accent">Shape Your City's Story</span>
        </h2>

        {/* Tagline */}
        <p className={`landing-tagline ${isVisible ? 'visible' : ''}`}>
          Discover trusted reviews, share your experiences, and help others make better choices. 
          Join thousands of Indians building a more transparent marketplace.
        </p>

        {/* Feature pills */}
        <div className={`feature-pills ${isVisible ? 'visible' : ''}`}>
          <div className="feature-pill">
            <Star size={14} />
            Real Reviews
          </div>
          <div className="feature-pill">
            <ShieldCheck size={14} />
            Govt Verified
          </div>
          <div className="feature-pill">
            <MapPin size={14} />
            Near You
          </div>
          <div className="feature-pill">
            <Building2 size={14} />
            50K+ Shops
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={`landing-actions ${isVisible ? 'visible' : ''}`}>
          <button
            className="btn-landing-primary"
            onClick={() => navigate('/signup')}
          >
            <span>Get Started</span>
            <Sparkles size={18} />
            <ArrowRight size={18} />
          </button>
          <button
            className="btn-landing-secondary"
            onClick={() => navigate('/login')}
          >
            <span>Sign In</span>
          </button>
        </div>

        {/* Social proof */}
        <div className={`social-proof ${isVisible ? 'visible' : ''}`}>
          <div className="social-proof-avatars" aria-hidden="true">
            {['A', 'S', 'R', 'P', 'M'].map((letter, i) => (
              <div key={i} className="social-proof-avatar" style={{ background: `linear-gradient(135deg, hsl(${260 + i * 20}, 70%, 60%), hsl(${280 + i * 20}, 70%, 50%))` }}>
                {letter}
              </div>
            ))}
          </div>
          <span>Join <strong>50,000+</strong> reviewers across India</span>
        </div>

        {/* Stats row */}
        <div className={`stats-row ${isVisible ? 'visible' : ''}`}>
          <div className="stat-item">
            <Users size={20} />
            <span className="stat-value">50K+</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <Building2 size={20} />
            <span className="stat-value">25K+</span>
            <span className="stat-label">Shops Rated</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <Star size={20} />
            <span className="stat-value">100K+</span>
            <span className="stat-label">Reviews</span>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <section 
          ref={sectionRef}
          className={`feature-highlights ${featuresVisible ? 'visible' : ''}`}
        >
          <h2 className="feature-highlights-title">
            Why <span className="gradient-text">Quality Voice</span>?
          </h2>
          <p className="feature-highlights-subtitle">
            Everything you need to discover and review local businesses
          </p>
          
          <div className="feature-cards">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card feature-card-${feature.animation}`}
                style={{ 
                  '--feature-color': feature.color,
                  animationDelay: `${index * 0.15}s`
                }}
              >
                <div className="feature-card-icon">
                  <feature.icon size={28} strokeWidth={1.5} className={`feature-icon-animated feature-icon-${feature.animation}`} />
                </div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-description">{feature.description}</p>
                <div className="feature-card-glow" />
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof Section - Task 1.2.3 */}
        <SocialProofSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* How It Works Section - Task 1.2.5 */}
        <HowItWorksSection />

        {/* Footer - Task 1.2.6 */}
        <Footer />
      </div>
    </main>
  );
};

export default LandingPage;