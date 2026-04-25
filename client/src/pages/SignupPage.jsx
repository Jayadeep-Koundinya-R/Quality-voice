import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mic2, Eye, EyeOff } from 'lucide-react';
import '../styles/Auth.css';

const getPasswordStrength = (pwd) => {
  if (pwd.length === 0) return null;
  if (pwd.length < 6) return 'weak';
  if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return 'medium';
  return 'strong';
};

// Validation functions
const validateName = (name) => {
  if (!name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
};

const validateEmail = (email) => {
  if (!email.trim()) return 'Email address is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

const validateMobile = (mobile) => {
  if (!mobile.trim()) return 'Mobile number is required';
  if (mobile.length < 10) return 'Please enter a valid 10-digit mobile number';
  if (!/^\d+$/.test(mobile)) return 'Mobile number should contain only digits';
  return null;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { theme } = useTheme();

  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, mobile: false });
  const [errors, setErrors] = useState({ name: null, email: null, password: null, mobile: null });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Force dark mode on mount
  useEffect(() => {
    const originalTheme = theme;
    document.documentElement.setAttribute('data-theme', 'dark');
    
    return () => {
      // Restore previous theme on unmount
      document.documentElement.setAttribute('data-theme', originalTheme);
    };
  }, [theme]);

  const strength = getPasswordStrength(form.password);

  // Validate single field
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name': return validateName(value);
      case 'email': return validateEmail(value);
      case 'password': return validatePassword(value);
      case 'mobile': return validateMobile(value);
      default: return null;
    }
  }, []);

  // Handle field blur - mark as touched and validate
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  // Handle input change - validate if already touched
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    
    // Validate on change if field was already touched
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  // Generate floating shapes for animated background
  const floatingShapes = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: ['circle', 'square', 'diamond'][i % 3],
      size: 30 + (i % 3) * 25,
      delay: i * 0.4,
      duration: 15 + (i % 4) * 3,
      left: 5 + (i * 11) % 85,
      top: 8 + (i * 10) % 75,
    })), []
  );

  // Generate particles
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: 2 + (i % 4) * 2,
      delay: i * 0.3,
      duration: 8 + (i % 5) * 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
    })), []
  );


  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const mobileError = validateMobile(form.mobile);
    
    setTouched({ name: true, email: true, password: true, mobile: true });
    setErrors({ 
      name: nameError, 
      email: emailError, 
      password: passwordError, 
      mobile: mobileError 
    });

    if (nameError || emailError || passwordError || mobileError) {
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      // New users go through onboarding first
      navigate('/onboarding');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background elements */}
      <div className="auth-gradient-orb auth-gradient-orb-1" aria-hidden="true" />
      <div className="auth-gradient-orb auth-gradient-orb-2" aria-hidden="true" />
      <div className="auth-gradient-orb auth-gradient-orb-3" aria-hidden="true" />
      
      {/* Floating geometric shapes */}
      {floatingShapes.map((shape) => (
        <div
          key={shape.id}
          className={`auth-floating-shape auth-floating-shape-${shape.type}`}
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="auth-particle"
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
      <div className="auth-grid-overlay" aria-hidden="true" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Mic2 size={22} strokeWidth={2.5} />
            </div>
            Quality<span>Voice</span>
          </div>
          <h2>Create your account</h2>
          <p>Join thousands of people rating their city</p>
        </div>

        {error && (
          <div className="error-msg" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignup} noValidate>
          <div className={`form-group ${touched.name && errors.name ? 'has-error' : ''}`}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="What should we call you?"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
              required
            />
            {touched.name && errors.name && (
              <span className="field-error">{errors.name}</span>
            )}
          </div>

          <div className={`form-group ${touched.email && errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              required
            />
            {touched.email && errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className={`form-group ${touched.password && errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <div className="password-field-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
            {strength && !errors.password && (
              <>
                <div className="password-strength">
                  <div className={`strength-bar ${strength === 'weak' ? 'weak' : strength === 'medium' ? 'medium' : 'strong'}`} />
                  <div className={`strength-bar ${strength === 'medium' ? 'medium' : strength === 'strong' ? 'strong' : ''}`} />
                  <div className={`strength-bar ${strength === 'strong' ? 'strong' : ''}`} />
                </div>
                <span className={`strength-label ${strength}`}>
                  {strength === 'weak' ? 'Weak password' : strength === 'medium' ? 'Could be stronger' : 'Strong password'}
                </span>
              </>
            )}
          </div>

          <div className={`form-group ${touched.mobile && errors.mobile ? 'has-error' : ''}`}>
            <label htmlFor="mobile">Mobile Number</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="10-digit number"
              value={form.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
              maxLength={10}
              required
            />
            {touched.mobile && errors.mobile && (
              <span className="field-error">{errors.mobile}</span>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating your account...' : 'Create Account'}
          </button>
        </form>

        {/* OAuth Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* OAuth Buttons */}
        <div className="oauth-buttons">
          <button type="button" className="oauth-btn oauth-btn-google" disabled={loading}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button type="button" className="oauth-btn oauth-btn-apple" disabled={loading}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
