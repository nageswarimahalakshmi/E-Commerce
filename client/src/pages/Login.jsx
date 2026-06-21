import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide all credentials.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = await login(email, password);
      // If admin, go to admin panel, else go home
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper shortcut for testing
  const autoFill = (testRole) => {
    if (testRole === 'admin') {
      setEmail('admin@example.com');
      setPassword('password123');
    } else {
      setEmail('user@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="glass-panel form-container">
      <h2 className="form-title">Welcome Back</h2>
      <p className="form-subtitle">Log in to check out and track your orders</p>

      {error && (
        <div
          className="glass-panel"
          style={{
            padding: '0.75rem 1rem',
            color: 'var(--danger)',
            borderColor: 'var(--danger)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Mail size={14} /> Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Key size={14} /> Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn btn-primary ${isSubmitting ? 'btn-disabled' : ''}`}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          <LogIn size={18} />
          {isSubmitting ? 'Verifying...' : 'Sign In'}
        </button>
      </form>

      {/* Quick Credentials Seeding Box */}
      <div
        className="glass-panel"
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.02)',
          fontSize: '0.85rem'
        }}
      >
        <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          ⚡ Sandbox Test Credentials:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => autoFill('user')}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flexGrow: 1 }}
          >
            Load User (Customer)
          </button>
          <button
            onClick={() => autoFill('admin')}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flexGrow: 1, borderColor: 'rgba(236,72,153,0.3)' }}
          >
            Load Admin Dashboard
          </button>
        </div>
      </div>

      <div className="form-footer-link">
        Don't have an account? <Link to="/register">Sign Up Free</Link>
      </div>
    </div>
  );
};

export default Login;
