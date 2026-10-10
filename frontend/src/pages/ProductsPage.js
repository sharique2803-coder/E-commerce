import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import Message from '../components/Message';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(keyword);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await fetchProducts(params);
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [keyword, category, page, minPrice, maxPrice]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = {};
    if (searchInput) p.keyword = searchInput;
    if (category) p.category = category;
    setSearchParams(p);
  };

  const handleCategory = (cat) => {
    const p = {};
    if (cat) p.category = cat;
    if (keyword) p.keyword = keyword;
    setSearchParams(p);
  };

  const handlePage = (newPage) => {
    const p = {};
    if (keyword) p.keyword = keyword;
    if (category) p.category = category;
    p.page = newPage;
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page">
      {/* Sidebar */}
      <aside className="products-sidebar">
        <div className="filter-section">
          <h3>Categories</h3>
          <button
            className={`filter-btn ${!category ? 'active' : ''}`}
            onClick={() => handleCategory('')}
          >All</button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategory(cat)}
            >{cat}</button>
          ))}
        </div>

        <div className="filter-section">
          <h3>Price Range</h3>
          <input
            type="number" placeholder="Min ₹" value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)} className="price-input"
          />
          <input
            type="number" placeholder="Max ₹" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)} className="price-input"
          />
          <button className="btn-primary btn-sm" onClick={loadProducts}>Apply</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="products-main">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text" placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary">Search</button>
          {(keyword || category) && (
            <button type="button" className="btn-outline"
              onClick={() => { setSearchInput(''); setSearchParams({}); }}>
              Clear
            </button>
          )}
        </form>

        {/* Result info */}
        <div className="results-info">
          {keyword && <span>Results for "<strong>{keyword}</strong>" — </span>}
          {category && <span>Category: <strong>{category}</strong> — </span>}
          <span>{pagination.total} product{pagination.total !== 1 ? 's' : ''} found</span>
        </div>

        {/* Products grid */}
        {loading ? (
          <Spinner message="Loading products..." />
        ) : error ? (
          <Message type="error">{error}</Message>
        ) : products.length === 0 ? (
          <Message type="info">No products found. Try a different search.</Message>
        ) : (
          <div className="products-grid">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="page-btn" disabled={page === 1}
              onClick={() => handlePage(page - 1)}>← Prev</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p} className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => handlePage(p)}>{p}</button>
            ))}
            <button
              className="page-btn" disabled={page === pagination.pages}
              onClick={() => handlePage(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
