import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { ClipboardList, Clock, Cpu, Truck, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

const OrderHistory = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/orders/mine`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load orders');
      }

      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  const renderStatusBadge = (status) => {
    return (
      <span className={`order-badge badge-${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading order history details...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="catalog-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Your Purchases</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track your active orders and review purchase history.</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', color: 'var(--danger)', borderColor: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>Error loading orders: {error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-panel empty-state">
          <ClipboardList size={48} className="empty-state-icon" />
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet. Go back to the Storefront to browse products.</p>
          <a href="/" className="btn btn-primary mt-3">
            Browse Storefront
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const currentStep = getStatusStep(order.status);
            
            // Calculate tracker line width
            let progressWidth = '0%';
            if (currentStep === 2) progressWidth = '33%';
            else if (currentStep === 3) progressWidth = '66%';
            else if (currentStep === 4) progressWidth = '100%';

            return (
              <div key={order._id} className="glass-panel order-card">
                
                {/* Header info */}
                <div className="order-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span className="order-id">Order ID: {order._id}</span>
                      {renderStatusBadge(order.status)}
                    </div>
                    <span className="order-date">
                      Placed on: {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Total Paid</span>
                    <strong style={{ fontSize: '1.25rem', fontWeight: 800 }}>${order.totalPrice.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div className="order-tracker">
                  <div className="tracker-progress-line" style={{ width: progressWidth }} />

                  {/* Step 1: Placed */}
                  <div className={`tracker-step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}>
                    <div className="tracker-node">
                      <Clock size={16} />
                    </div>
                    <span className="tracker-label">Placed</span>
                  </div>

                  {/* Step 2: Processing */}
                  <div className={`tracker-step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
                    <div className="tracker-node">
                      <Cpu size={16} />
                    </div>
                    <span className="tracker-label">Processing</span>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className={`tracker-step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}`}>
                    <div className="tracker-node">
                      <Truck size={16} />
                    </div>
                    <span className="tracker-label">Shipped</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className={`tracker-step ${currentStep >= 4 ? 'completed' : ''} ${currentStep === 4 ? 'active' : ''}`}>
                    <div className="tracker-node">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="tracker-label">Delivered</span>
                  </div>
                </div>

                {/* Items and Address Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                  
                  {/* Items List */}
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Purchased Items</h4>
                    <div className="order-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <span style={{ color: 'var(--text-muted)' }}>
                            {item.name} <strong style={{ color: 'var(--text-main)' }}>x{item.quantity}</strong>
                          </span>
                          <strong style={{ color: 'var(--text-main)' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Shipping Destination</h4>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
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

export default OrderHistory;
