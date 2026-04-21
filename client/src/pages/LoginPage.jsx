import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic2, Eye, EyeOff } from 'lucide-react';
import '../styles/Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, needsOnboarding } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

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

        <div className="auth-footer">
          New here?{' '}
          <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
