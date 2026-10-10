import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrderStats, getAllOrders } from '../../api/orderApi';
import { fetchProducts } from '../../api/productApi';
import { getAllUsers } from '../../api/authApi';
import Spinner from '../../components/Spinner';
import Message from '../../components/Message';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes, productsRes, usersRes] = await Promise.all([
          getOrderStats(),
          getAllOrders(),
          fetchProducts({ limit: 1 }),
          getAllUsers(),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
        setProductCount(productsRes.data.total);
        setUserCount(usersRes.data.length);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusColors = {
    Pending: '#f59e0b', Processing: '#3b82f6',
    Shipped: '#8b5cf6', Delivered: '#10b981', Cancelled: '#ef4444',
  };

  if (loading) return <Spinner message="Loading dashboard..." />;

  return (
    <div className="page-container">
      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening in your store.</p>
      </div>

      {error && <Message type="error">{error}</Message>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats?.totalOrders ?? 0}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card stat-yellow">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats?.pendingOrders ?? 0}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">🛍️</div>
          <div className="stat-info">
            <h3>{productCount}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card stat-indigo">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{userCount}</h3>
            <p>Registered Users</p>
          </div>
        </div>
        <div className="stat-card stat-teal">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats?.deliveredOrders ?? 0}</h3>
            <p>Delivered Orders</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="admin-quick-links">
        <Link to="/admin/products" className="quick-link-card">
          <span>🛍️</span>
          <strong>Manage Products</strong>
          <small>Add, edit, delete products</small>
        </Link>
        <Link to="/admin/orders" className="quick-link-card">
          <span>📋</span>
          <strong>Manage Orders</strong>
          <small>Update order statuses</small>
        </Link>
        <Link to="/products" className="quick-link-card">
          <span>🏪</span>
          <strong>View Store</strong>
          <small>See the storefront</small>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="view-all">View All →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <Message type="info">No orders yet.</Message>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td><code>{order._id.slice(-8).toUpperCase()}</code></td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td><strong>₹{order.totalPrice.toLocaleString('en-IN')}</strong></td>
                    <td>
                      <span style={{ color: order.isPaid ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        {order.isPaid ? '✅ Paid' : '⏳ Unpaid'}
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
    </div>
  );
}
