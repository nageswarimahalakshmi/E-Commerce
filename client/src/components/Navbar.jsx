import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, LogOut, ClipboardList, Shield, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = getCartCount();

  return (
    <nav className="navbar-glass">
      <div className="navbar-container">
        <Link to="/" className="nav-brand">
          <ShoppingBag size={28} className="text-gradient" />
          <span>Aethera</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
            Storefront
          </NavLink>

          <Link to="/cart" className="cart-icon-container nav-link">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <>
              <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ClipboardList size={18} /> My Orders
                </span>
              </NavLink>

              {user.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-pink)' }}>
                    <Shield size={18} /> Admin Panel
                  </span>
                </NavLink>
              )}

              <div className="nav-actions">
                <span className="username-tag">
                  <User size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {user.username}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="nav-actions">
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
