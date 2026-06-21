import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../context/AuthContext';
import { ChevronLeft, ShoppingCart, Info, AlertTriangle } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Product not found');
        }

        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQtyChange = (type) => {
    if (!product) return;
    if (type === 'dec' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    } else if (type === 'inc') {
      const cartQty = getProductCartQty(product._id);
      if (quantity + cartQty < product.stockCount) {
        setQuantity((prev) => prev + 1);
      }
    }
  };

  const getProductCartQty = (productId) => {
    const item = cartItems.find((ci) => ci.product === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setQuantity(1); // Reset local selection quantity
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading product detail details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="glass-panel empty-state">
        <AlertTriangle size={48} className="empty-state-icon" style={{ color: 'var(--danger)' }} />
        <h3>Product Not Found</h3>
        <p>{error || 'The requested product could not be loaded.'}</p>
        <Link to="/" className="btn btn-secondary mt-3">
          <ChevronLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const cartQty = getProductCartQty(product._id);
  const totalWanted = cartQty + quantity;
  const isOutOfStock = product.stockCount === 0;
  const reachedMaxQty = cartQty >= product.stockCount;

  return (
    <div>
      <Link to="/" className="btn btn-secondary mb-3" style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}>
        <ChevronLeft size={16} /> Back to Catalog
      </Link>

      <div className="glass-panel details-layout" style={{ padding: '2.5rem' }}>
        {/* Left: Product Image */}
        <div className="details-image-panel">
          <img
            src={product.image}
            alt={product.name}
            className="details-image"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60';
            }}
          />
        </div>

        {/* Right: Product Specs & Actions */}
        <div className="details-info-panel">
          <span className="details-category">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>
          
          <div className="details-price">${product.price.toFixed(2)}</div>
          
          <p className="details-description">{product.description}</p>

          <div className="details-stock-status">
            <div className={`status-indicator ${isOutOfStock ? 'status-outstock' : 'status-instock'}`} />
            <span>
              {isOutOfStock
                ? 'Temporarily Sold Out'
                : 'In Stock (Available: ' + (product.stockCount - cartQty) + ' of ' + product.stockCount + ')'}
            </span>
          </div>

          {!isOutOfStock && !reachedMaxQty && (
            <div className="quantity-selector">
              <span className="form-label" style={{ margin: 0, fontWeight: 700 }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => handleQtyChange('dec')} className="quantity-btn">
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button onClick={() => handleQtyChange('inc')} className="quantity-btn">
                  +
                </button>
              </div>
            </div>
          )}

          {cartQty > 0 && (
            <div
              className="glass-panel"
              style={{
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Info size={16} style={{ color: 'var(--primary-hover)' }} />
              <span>You currently have <strong>{cartQty}</strong> of this item in your cart.</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || reachedMaxQty}
              className={`btn btn-primary ${isOutOfStock || reachedMaxQty ? 'btn-disabled' : ''}`}
              style={{ flexGrow: 1, padding: '0.9rem' }}
            >
              <ShoppingCart size={20} />
              {reachedMaxQty
                ? 'Maximum Available Qty In Cart'
                : isOutOfStock
                ? 'Out of Stock'
                : 'Add to Cart ($' + (product.price * quantity).toFixed(2) + ')'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
