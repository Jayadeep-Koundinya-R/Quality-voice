import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--bg1)',
          color: 'var(--text1)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--red)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Something went wrong</h1>
          <p style={{ color: 'var(--text2)', marginBottom: '32px', maxWidth: '400px', lineHeight: '1.6' }}>
            An unexpected error occurred. Don't worry, your data is safe. Try refreshing the page or returning home.
          </p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'var(--brand)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={18} /> Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/home'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'var(--bg2)',
                color: 'var(--text1)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Home size={18} /> Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
