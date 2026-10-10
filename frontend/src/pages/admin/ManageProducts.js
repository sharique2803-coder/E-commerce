import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../api/productApi';
import Spinner from '../../components/Spinner';
import Message from '../../components/Message';

const EMPTY_FORM = {
  name: '', description: '', price: '', category: '',
  image: '', countInStock: '', brand: '', isFeatured: false,
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // Search
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.keyword = search;
      const { data } = await fetchProducts(params);
      setProducts(data.products);
      setPages(data.pages);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [page, search]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      countInStock: product.countInStock,
      brand: product.brand,
      isFeatured: product.isFeatured,
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...form, price: Number(form.price), countInStock: Number(form.countInStock) };
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(payload);
        setSuccess('Product created successfully!');
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setSuccess(`"${name}" deleted.`);
      loadProducts();
    } catch {
      setError('Failed to delete product');
    }
  };

  return (
    <div className="page-container">
      <div className="admin-header">
        <h1>🛍️ Manage Products</h1>
        <button className="btn-primary" onClick={openCreate}>+ Add New Product</button>
      </div>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}

      {/* Search */}
      <div className="admin-toolbar">
        <input
          type="text" placeholder="Search products..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
      </div>

      {loading ? <Spinner message="Loading products..." /> : (
        <>
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No products found</td></tr>
                ) : products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img src={p.image} alt={p.name} width="50" height="50"
                        style={{ objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/50x50'; }} />
                    </td>
                    <td><strong>{p.name}</strong><br /><small>{p.brand}</small></td>
                    <td>{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span style={{ color: p.countInStock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        {p.countInStock > 0 ? p.countInStock : 'Out'}
                      </span>
                    </td>
                    <td>{p.isFeatured ? '⭐ Yes' : 'No'}</td>
                    <td className="action-btns">
                      <button className="btn-outline btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(p._id, p.name)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input className="form-control" name="brand" value={form.brand} onChange={handleFormChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea className="form-control" name="description" value={form.description}
                  onChange={handleFormChange} rows={3} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input className="form-control" name="price" type="number" min="0" step="0.01"
                    value={form.price} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Stock Qty *</label>
                  <input className="form-control" name="countInStock" type="number" min="0"
                    value={form.countInStock} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <input className="form-control" name="category" value={form.category}
                    onChange={handleFormChange} placeholder="e.g. Electronics" required />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input className="form-control" name="image" value={form.image} onChange={handleFormChange}
                  placeholder="https://..." />
                {form.image && (
                  <img src={form.image} alt="preview" width="80" style={{ marginTop: '0.5rem', borderRadius: '6px' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleFormChange} />
                  &nbsp; Featured Product
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
