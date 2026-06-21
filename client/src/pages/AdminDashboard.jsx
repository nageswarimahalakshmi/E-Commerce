import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { Shield, ShoppingBag, ClipboardList, Plus, Edit, Trash2, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formStock, setFormStock] = useState('10');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'products') {
        const response = await fetch(`${API_BASE}/products`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not fetch products');
        setProducts(data);
      } else {
        const response = await fetch(`${API_BASE}/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not fetch orders');
        setOrders(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to delete product');
      
      showToast(`Product "${name}" deleted!`, 'success');
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedProductId(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCategory('Audio');
    setFormImage('');
    setFormStock('10');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setSelectedProductId(product._id);
    setFormName(product.name);
    setFormDesc(product.description);
    setFormPrice(product.price.toString());
    setFormCategory(product.category);
    setFormImage(product.image);
    setFormStock(product.stockCount.toString());
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formDesc || !formPrice || !formCategory || !formStock) {
      alert('Please fill out all fields.');
      return;
    }

    const payload = {
      name: formName,
      description: formDesc,
      price: parseFloat(formPrice),
      category: formCategory,
      image: formImage || undefined,
      stockCount: parseInt(formStock)
    };

    try {
      let url = `${API_BASE}/products`;
      let method = 'POST';

      if (modalMode === 'edit') {
        url += `/${selectedProductId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Product operation failed');

      showToast(`Product successfully ${modalMode === 'add' ? 'created' : 'updated'}!`);
      setIsModalOpen(false);
      fetchData(); // reload list
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to update order status');

      showToast(`Order status updated to ${newStatus}!`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-layout">
      {/* Toast Alert Notification */}
      {toast && (
        <div className={`alert-toast ${toast.type}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="glass-panel admin-sidebar">
        <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-pink)', marginBottom: '1rem' }}>
          <Shield size={20} />
          <strong style={{ fontSize: '1.1rem' }}>Admin Tools</strong>
        </div>

        <button
          onClick={() => setActiveTab('products')}
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          <ShoppingBag size={18} />
          Products Catalog
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <ClipboardList size={18} />
          Orders Manager
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="glass-panel admin-content">
        
        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div>
            <div className="admin-section-title">
              <h2>Store Products Inventory</h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                  <RefreshCw size={16} />
                </button>
                <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Create Product
                </button>
              </div>
            </div>

            {error && (
              <div className="glass-panel" style={{ padding: '1rem', color: 'var(--danger)', borderColor: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>Error: {error}</span>
              </div>
            )}

            {loading ? (
              <p>Loading inventory data...</p>
            ) : products.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No products in database. Seeding data is recommended.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Qty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id}>
                        <td>
                          <img
                            src={p.image}
                            alt={p.name}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&auto=format&fit=crop&q=60';
                            }}
                          />
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{p.name}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</p>
                        </td>
                        <td>{p.category}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>
                          <span style={{ color: p.stockCount === 0 ? 'var(--danger)' : p.stockCount <= 5 ? 'var(--warning)' : 'var(--text-main)', fontWeight: 600 }}>
                            {p.stockCount} {p.stockCount <= 5 ? '(Low)' : ''}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => openEditModal(p)} className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Edit product">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p._id, p.name)} className="btn btn-danger" style={{ padding: '0.4rem' }} title="Delete product">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div>
            <div className="admin-section-title">
              <h2>Customer Transactions & Orders</h2>
              <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                <RefreshCw size={16} />
              </button>
            </div>

            {error && (
              <div className="glass-panel" style={{ padding: '1rem', color: 'var(--danger)', borderColor: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>Error: {error}</span>
              </div>
            )}

            {loading ? (
              <p>Loading transactions...</p>
            ) : orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No customer orders placed yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID & User</th>
                      <th>Date</th>
                      <th>Line Items</th>
                      <th>Total Cost</th>
                      <th>Shipping Target</th>
                      <th>Tracking Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--primary-hover)', fontWeight: 700, display: 'block' }}>
                            {o._id}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            👤 {o.user?.username || 'Guest'} ({o.user?.email || 'N/A'})
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {o.items.map((item, idx) => (
                              <div key={idx}>
                                • {item.name} <strong style={{ color: 'var(--text-main)' }}>x{item.quantity}</strong>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>${o.totalPrice.toFixed(2)}</strong>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                          <p>{o.shippingAddress.address}</p>
                          <p>{o.shippingAddress.city}, {o.shippingAddress.postalCode}</p>
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            className="status-dropdown"
                            style={{
                              borderColor:
                                o.status === 'Delivered' ? 'var(--success)' :
                                o.status === 'Shipped' ? 'var(--primary)' :
                                o.status === 'Processing' ? 'var(--accent-cyan)' : 'var(--warning)',
                              color:
                                o.status === 'Delivered' ? 'var(--success)' :
                                o.status === 'Shipped' ? 'var(--primary-hover)' :
                                o.status === 'Processing' ? 'var(--accent-cyan)' : 'var(--warning)'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Product Form Dialog Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-container">
            <button onClick={() => setIsModalOpen(false)} className="modal-close">
              <X size={20} />
            </button>

            <h3 className="form-title" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              {modalMode === 'add' ? 'Create New Catalog Item' : 'Update Catalog Item'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Watch Active"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Provide detailed description..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="199.99"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Inventory Qty</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="form-input"
                >
                  <option value="Audio">Audio</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home Theater">Home Theater</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Soft Toys">Soft Toys</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  Save Product details
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
