import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, payOrder } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Message from '../components/Message';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  const loadOrder = async () => {
    try {
      const { data } = await getOrderById(id);
      setOrder(data);
    } catch {
      setError('Order not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrder(); }, [id]);

  const handlePay = async () => {
    setPayLoading(true);
    try {
      await payOrder(id);
      await loadOrder();
    } catch {
      setError('Payment failed');
    } finally {
      setPayLoading(false);
    }
  };

  const statusColors = {
    Pending: '#f59e0b', Processing: '#3b82f6',
    Shipped: '#8b5cf6', Delivered: '#10b981', Cancelled: '#ef4444',
  };

  if (loading) return <Spinner message="Loading order..." />;
  if (error) return <div className="page-container"><Message type="error">{error}</Message></div>;

  return (
    <div className="page-container">
      <div className="order-confirmation-header">
        <div className="order-success-icon">✅</div>
        <h1>Order Confirmed!</h1>
        <p>Thank you, <strong>{user?.name}</strong>! Your order has been placed successfully.</p>
        <p className="order-id">Order ID: <code>{order._id}</code></p>
      </div>

      <div className="order-detail-layout">
        <div className="order-main">
          {/* Status */}
          <div className="order-card">
            <h2>Order Status</h2>
            <span className="status-badge" style={{ backgroundColor: statusColors[order.status] }}>
              {order.status}
            </span>
            <div className="order-dates">
              <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
              {order.isPaid && order.paidAt && <p>Paid: {new Date(order.paidAt).toLocaleString()}</p>}
              {order.deliveredAt && <p>Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>}
            </div>
          </div>

          {/* Items */}
          <div className="order-card">
            <h2>Order Items</h2>
            {order.orderItems.map((item, i) => (
              <div key={i} className="review-item">
                <img src={item.image} alt={item.name} width="60"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/60x60'; }} />
                <Link to={`/products/${item.product}`}>{item.name}</Link>
                <span>×{item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div className="order-card">
            <h2>Shipping Address</h2>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h2>Payment Summary</h2>
          <div className="summary-row"><span>Items</span><span>₹{order.itemsPrice.toLocaleString('en-IN')}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
          <div className="summary-row"><span>GST (18%)</span><span>₹{order.taxPrice.toLocaleString('en-IN')}</span></div>
          <hr />
          <div className="summary-row summary-total"><span>Total</span><span>₹{order.totalPrice.toLocaleString('en-IN')}</span></div>
          <div className="summary-row">
            <span>Payment</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="summary-row">
            <span>Status</span>
            <span style={{ color: order.isPaid ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
              {order.isPaid ? '✅ Paid' : '⏳ Pending'}
            </span>
          </div>

          {!order.isPaid && order.paymentMethod !== 'Cash on Delivery' && (
            <button className="btn-primary btn-full" onClick={handlePay} disabled={payLoading}>
              {payLoading ? 'Processing...' : '💳 Pay Now'}
            </button>
          )}

          <Link to="/my-orders" className="btn-outline btn-full" style={{ marginTop: '0.75rem', display: 'block', textAlign: 'center' }}>
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
