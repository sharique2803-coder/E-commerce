import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>🛒 ShopEase</h3>
          <p>Your one-stop online store for quality products at great prices.</p>
        </div>
        <div className="footer-links">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=Electronics">Electronics</Link>
          <Link to="/products?category=Clothing">Clothing</Link>
          <Link to="/products?category=Sports">Sports</Link>
        </div>
        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/profile">My Profile</Link>
          <Link to="/my-orders">My Orders</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div className="footer-links">
          <h4>Info</h4>
          <span>Easy 30-day returns</span>
          <span>Secure payments</span>
          <span>24/7 support</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ShopEase. All rights reserved.</p>
      </div>
    </footer>
  );
}
