import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orderApi';
import Spinner from '../components/Spinner';
import Message from '../components/Message';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    Pending: '#f59e0b', Processing: '#3b82f6',
    Shipped: '#8b5cf6', Delivered: '#10b981', Cancelled: '#ef4444',
  };

  if (loading) return <Spinner message="Loading your orders..." />;

  return (
    <div className="page-container">
      <h1 className="page-title">My Orders</h1>

      {error && <Message type="error">{error}</Message>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '3rem' }}>📦</span>
          <h2>No orders yet</h2>
          <p>When you place an order, it will appear here.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td><code>{order._id.slice(-8).toUpperCase()}</code></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.orderItems.reduce((a, i) => a + i.quantity, 0)}</td>
                  <td><strong>₹{order.totalPrice.toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span style={{ color: order.isPaid ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {order.isPaid ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge"
                      style={{ backgroundColor: statusColors[order.status], color: '#fff', padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem' }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/orders/${order._id}`} className="btn-outline btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
