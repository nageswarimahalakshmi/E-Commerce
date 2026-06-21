import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, API_BASE } from '../context/AuthContext';
import { CreditCard, Truck, CheckCircle2, ChevronLeft, ArrowRight, AlertTriangle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  
  // Card mock state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  if (cartItems.length === 0 && !successOrder) {
    return <Navigate to="/" replace />;
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0.0 : 15.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      setError('Please fill in all shipping details.');
      return;
    }
    if (!cardNumber || !cardExpiry || !cardCvc) {
      setError('Please fill in payment details.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product: item.product,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: {
            address,
            city,
            postalCode,
            country
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      setSuccessOrder(data);
      clearCart(); // clear items
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {successOrder ? (
        /* Success Screen */
        <div className="glass-panel modal-container" style={{ margin: '4rem auto', textAlign: 'center' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--success)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.4))' }} />
          <h2 className="mb-2" style={{ fontWeight: 800 }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Thank you for shopping with Aethera. Your order has been placed and is currently <strong>Pending</strong>.
          </p>
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              marginBottom: '2rem',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order ID:</span>
              <strong style={{ color: 'var(--primary-hover)' }}>{successOrder._id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Amount Charged:</span>
              <strong style={{ color: 'var(--text-main)' }}>${successOrder.totalPrice.toFixed(2)}</strong>
            </div>
          </div>
          <button onClick={() => navigate('/orders')} className="btn btn-primary" style={{ width: '100%' }}>
            Go to Order History
          </button>
        </div>
      ) : (
        /* Checkout Forms */
        <form onSubmit={handleSubmit}>
          <h1 className="cart-title mb-3">Order Checkout</h1>

          {error && (
            <div
              className="glass-panel"
              style={{
                padding: '1rem',
                color: 'var(--danger)',
                borderColor: 'var(--danger)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="cart-layout">
            {/* Left: Input Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Shipping Information Card */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                  <Truck size={20} className="text-gradient" />
                  1. Shipping Information
                </h3>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Nebula Way, Apt 4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Neo Metropolis"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      required
                      placeholder="90210"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Payment details Card */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                  <CreditCard size={20} className="text-gradient" />
                  2. Secure Card Payment
                </h3>

                <div className="form-group">
                  <label className="form-label">Credit Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="•••• •••• •••• ••••"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiration Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Security Code (CVV)</label>
                    <input
                      type="text"
                      required
                      placeholder="•••"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary panel */}
            <div className="glass-panel cart-summary">
              <h3 className="summary-title">Checkout Order Summary</h3>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Sales Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Order Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn btn-primary ${isSubmitting ? 'btn-disabled' : ''}`}
                  style={{ width: '100%', gap: '0.5rem' }}
                >
                  {isSubmitting ? 'Processing Payment...' : `Authorize Charge of $${total.toFixed(2)}`}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
                
                <a
                  href="/cart"
                  className="btn btn-secondary mt-2"
                  style={{ width: '100%', display: 'inline-flex' }}
                >
                  <ChevronLeft size={16} /> Return to Cart
                </a>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Checkout;
