import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mic2, Eye, EyeOff } from 'lucide-react';
import '../styles/Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, needsOnboarding } = useAuth();
  const { theme } = useTheme();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Force dark mode on mount
  useEffect(() => {
    const originalTheme = theme;
    document.documentElement.setAttribute('data-theme', 'dark');
    
    return () => {
      // Restore previous theme on unmount
      document.documentElement.setAttribute('data-theme', originalTheme);
    };
  }, [theme]);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) return setError('Please enter your email');
    if (!form.password) return setError('Please enter your password');

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(needsOnboarding() ? '/onboarding' : '/home');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Wrong email or password. Give it another try.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
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
            <h2>Reset your password</h2>
            <p>We'll send a reset link to your email</p>
          </div>

          {forgotSent ? (
            <div className="success-msg">
              Check your inbox — we've sent a reset link if that email is registered.
            </div>
          ) : (
            <div className="auth-form">
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <button
                className="auth-submit-btn"
                onClick={() => setForgotSent(true)}
              >
                Send Reset Link
              </button>
            </div>
          )}

          <div className="auth-footer">
            <button className="auth-link" onClick={() => { setShowForgot(false); setForgotSent(false); }}>
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h2>Welcome back</h2>
          <p>Good to see you again — sign in to continue</p>
        </div>

        {error && (
          <div className="error-msg" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
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
          </div>

          <div className="auth-forgot-row">
            <button
              type="button"
              className="auth-link"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing you in...' : 'Sign In'}
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
          New here?{' '}
          <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
