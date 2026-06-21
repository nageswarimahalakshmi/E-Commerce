import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 || subtotal === 0 ? 0.0 : 15.0;
  const tax = subtotal * 0.08; // 8% sales tax
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <ShoppingCart size={64} className="empty-state-icon" />
        <h2 className="mb-2">Your Shopping Cart is Empty</h2>
        <p className="mb-3">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="btn btn-primary">
          Browse Storefront
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="cart-title mb-3">Shopping Cart Review</h1>
      
      <div className="cart-layout">
        {/* Left: Cart Items List */}
        <div className="glass-panel cart-items-container">
          {cartItems.map((item) => (
            <div key={item.product} className="cart-item">
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                }}
              />
              
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>Unit Price: ${item.price.toFixed(2)}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  In Stock limit: {item.stockCount}
                </p>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => updateQuantity(item.product, item.quantity - 1)}
                  className="quantity-btn"
                  style={{ width: '28px', height: '28px', fontSize: '1rem' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 700, width: '20px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product, item.quantity + 1)}
                  disabled={item.quantity >= item.stockCount}
                  className="quantity-btn"
                  style={{ width: '28px', height: '28px', fontSize: '1rem' }}
                >
                  +
                </button>
              </div>

              <div className="cart-item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                onClick={() => removeFromCart(item.product)}
                className="btn btn-danger"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Panel */}
        <div className="glass-panel cart-summary">
          <h3 className="summary-title">Summary</h3>
          
          <div className="summary-row">
            <span>Items Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Estimated Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>

          <div className="summary-row" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Free shipping on orders over $150.</span>
          </div>
          
          <div className="summary-row">
            <span>Sales Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          
          <div className="summary-row total">
            <span>Total Cost</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="mt-3">
            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
