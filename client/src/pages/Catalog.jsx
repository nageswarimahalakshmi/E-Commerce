import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../context/AuthContext';
import { Search, ShoppingCart, Plus, Minus, Tag, AlertCircle } from 'lucide-react';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState(null);
  
  const { addToCart, cartItems } = useCart();

  const categories = ['All', 'Audio', 'Wearables', 'Accessories', 'Home Theater', 'Home Appliances', 'Soft Toys'];

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/products`;
      const params = [];
      if (category && category !== 'All') {
        params.push(`category=${encodeURIComponent(category)}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load products');
      }

      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProductsWithSearch();
  };

  const fetchProductsWithSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/products?search=${encodeURIComponent(search)}`;
      if (category && category !== 'All') {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load search results');
      }

      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProductCartQty = (productId) => {
    const item = cartItems.find((ci) => ci.product === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div>
      {/* Hero Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Future Electronics. Today.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Explore our signature catalog of luxury wireless gadgets, smart accessories, and premium biometric wearables.
        </p>
      </div>

      {/* Catalog Search and Categories Filter */}
      <div className="catalog-header">
        <form onSubmit={handleSearchSubmit} className="catalog-search-bar">
          <Search size={18} className="catalog-search-icon" />
          <input
            type="text"
            className="catalog-search-input"
            placeholder="Search catalog by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="catalog-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSearch(''); // clear search when category changes
              }}
              className={`category-tab ${category === cat || (cat === 'All' && !category) ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '2rem' }}>
          <AlertCircle size={20} />
          <span>Error loading catalog: {error}</span>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: '380px', animation: 'pulse 1.5s infinite', background: 'rgba(255, 255, 255, 0.02)' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel empty-state">
          <Tag size={48} className="empty-state-icon" />
          <h3>No Products Found</h3>
          <p>We couldn't find any products matching your selection.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const cartQty = getProductCartQty(product._id);
            const isOutOfStock = product.stockCount === 0;
            const isLowStock = product.stockCount > 0 && product.stockCount <= 5;
            const reachedMaxQty = cartQty >= product.stockCount;

            return (
              <div key={product._id} className="glass-panel product-card">
                <div className="product-image-container">
                  <span className="product-category-badge">{product.category}</span>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>

                <div className="product-body">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-footer">
                    <span className="product-price">${product.price.toFixed(2)}</span>

                    {/* Stock Alert Label */}
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {isOutOfStock ? (
                        <span style={{ color: 'var(--danger)' }}>Sold Out</span>
                      ) : isLowStock ? (
                        <span style={{ color: 'var(--warning)' }}>Only {product.stockCount} left!</span>
                      ) : (
                        <span style={{ color: 'var(--success)' }}>In Stock</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={isOutOfStock || reachedMaxQty}
                      className={`btn btn-primary ${isOutOfStock || reachedMaxQty ? 'btn-disabled' : ''}`}
                      style={{ flexGrow: 1, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      <ShoppingCart size={16} />
                      {reachedMaxQty ? 'Limit Reached' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    
                    <a
                      href={`/product/${product._id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;
