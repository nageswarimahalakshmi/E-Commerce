import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Key, User, Shield, AlertTriangle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all registration inputs.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await register(username, email, password, role);
      
      // If admin was checked, go directly to admin dashboard, else storefront
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different username/email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel form-container">
      <h2 className="form-title">Join Aethera</h2>
      <p className="form-subtitle">Create an account to order and track shipments</p>

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
            <User size={14} /> Full Username
          </label>
          <input
            type="text"
            required
            placeholder="e.g. john_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Mail size={14} /> Email Address
          </label>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Key size={14} /> Password (min 6 chars)
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

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Shield size={14} /> Account Role (Sandbox Mode)
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="form-input"
          >
            <option value="user">Customer (Regular User)</option>
            <option value="admin">Store Administrator (Full Access)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn btn-primary ${isSubmitting ? 'btn-disabled' : ''}`}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          <UserPlus size={18} />
          {isSubmitting ? 'Creating Profile...' : 'Sign Up Free'}
        </button>
      </form>

      <div className="form-footer-link">
        Already have an account? <Link to="/login">Sign In Instead</Link>
      </div>
    </div>
  );
};

export default Register;
