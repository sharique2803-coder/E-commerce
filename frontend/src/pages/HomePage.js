import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchCategories } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          fetchFeaturedProducts(),
          fetchCategories(),
        ]);
        setFeatured(featRes.data);
        setCategories(catRes.data);
      } catch {
        // silently fail — page still renders
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryIcons = {
    Electronics: '💻', Clothing: '👕', Sports: '⚽',
    'Home & Kitchen': '🏠', Beauty: '💄', Books: '📚',
    Toys: '🧸', Footwear: '👟', Accessories: '⌚',
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to <span className="hero-brand">ShopEase</span></h1>
          <p>Discover thousands of products at unbeatable prices. Fast shipping, easy returns.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary btn-lg">Shop Now</Link>
            <Link to="/register" className="btn-outline btn-lg">Join Free</Link>
          </div>
        </div>
        <div className="hero-badges">
          <div className="hero-badge">🚚 Free Shipping over ₹500</div>
          <div className="hero-badge">↩️ 30-Day Returns</div>
          <div className="hero-badge">🔒 Secure Payments</div>
          <div className="hero-badge">⭐ Top Rated Store</div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products" className="view-all">View All →</Link>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link key={cat} to={`/products?category=${cat}`} className="category-card">
              <span className="category-icon">{categoryIcons[cat] || '🛍️'}</span>
              <span className="category-name">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all">View All →</Link>
        </div>
        {loading ? (
          <Spinner message="Loading featured products..." />
        ) : featured.length === 0 ? (
          <p className="empty-msg">No featured products yet.</p>
        ) : (
          <div className="products-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>🎉 New Arrivals Every Week</h2>
          <p>Stay updated with our latest collections across all categories.</p>
          <Link to="/products" className="btn-primary">Explore Now</Link>
        </div>
      </section>
    </div>
  );
}
