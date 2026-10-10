import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          🛒 ShopEase
        </Link>

        {/* Search shortcut */}
        <Link to="/products" className="navbar-search-btn">
          🔍 Search Products
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          <Link to="/products" className="nav-link">Products</Link>

          {/* Cart */}
          <Link to="/cart" className="nav-link cart-link">
            🛍️ Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="user-dropdown">
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                👤 {user.name.split(' ')[0]} ▾
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                  <Link to="/my-orders" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                  {isAdmin && (
                    <>
                      <hr />
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}>Admin Dashboard</Link>
                      <Link to="/admin/products" onClick={() => setDropdownOpen(false)}>Manage Products</Link>
                      <Link to="/admin/orders" onClick={() => setDropdownOpen(false)}>Manage Orders</Link>
                    </>
                  )}
                  <hr />
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
