import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import Spinner from '../../components/Spinner';
import Message from '../../components/Message';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColors = {
  Pending: '#f59e0b', Processing: '#3b82f6',
  Shipped: '#8b5cf6', Delivered: '#10b981', Cancelled: '#ef4444',
};

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    getAllOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError('');
    setSuccess('');
    try {
      const { data } = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: data.status, deliveredAt: data.deliveredAt } : o)));
      setSuccess(`Order status updated to "${newStatus}"`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus ? o.status === filterStatus : true;
    const matchSearch = filterSearch
      ? o._id.toLowerCase().includes(filterSearch.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(filterSearch.toLowerCase())
      : true;
    return matchStatus && matchSearch;
  });

  // Summary counts
  const counts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  if (loading) return <Spinner message="Loading orders..." />;

  return (
    <div className="page-container">
      <div className="admin-header">
        <h1>📋 Manage Orders</h1>
        <p>{orders.length} total orders</p>
      </div>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}

      {/* Status summary pills */}
      <div className="status-summary">
        <button
          className={`status-pill ${filterStatus === '' ? 'active' : ''}`}
          onClick={() => setFilterStatus('')}
        >All ({orders.length})</button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            className={`status-pill ${filterStatus === s ? 'active' : ''}`}
            style={{ '--pill-color': statusColors[s] }}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
          >{s} ({counts[s]})</button>
        ))}
      </div>

      {/* Search */}
      <div className="admin-toolbar">
        <input
          type="text" placeholder="Search by Order ID or customer name..."
          value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {filtered.length === 0 ? (
        <Message type="info">No orders match your filter.</Message>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order._id}>
                  <td><code>{order._id.slice(-8).toUpperCase()}</code></td>
                  <td>
                    <div><strong>{order.user?.name || 'N/A'}</strong></div>
                    <small>{order.user?.email || ''}</small>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.orderItems.reduce((a, i) => a + i.quantity, 0)}</td>
                  <td><strong>₹{order.totalPrice.toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span style={{ color: order.isPaid ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {order.isPaid ? '✅ Yes' : '⏳ No'}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge"
                      style={{ backgroundColor: statusColors[order.status], color: '#fff', padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem' }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id || order.status === 'Cancelled'}
                      className="status-select"
                      style={{ borderColor: statusColors[order.status] }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {updatingId === order._id && <small> saving...</small>}
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
