import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic2, Eye, EyeOff } from 'lucide-react';
import '../styles/Auth.css';

const getPasswordStrength = (pwd) => {
  if (pwd.length === 0) return null;
  if (pwd.length < 6) return 'weak';
  if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return 'medium';
  return 'strong';
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Please enter your full name');
    if (!form.email.trim()) return setError('Please enter your email address');
    if (form.password.length < 6) return setError('Password needs to be at least 6 characters');
    if (!form.mobile.trim() || form.mobile.length < 10) {
      return setError('Please enter a valid 10-digit mobile number');
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
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="What should we call you?"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
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
            {strength && (
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

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="10-digit number"
              value={form.mobile}
              onChange={handleChange}
              autoComplete="tel"
              maxLength={10}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating your account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
