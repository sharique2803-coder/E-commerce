import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';

export default function CartPage() {
  const { cartItems, cartTotal, updateItem, removeItem, emptyCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shippingPrice = cartTotal > 500 ? 0 : 49;
  const taxPrice = parseFloat((cartTotal * 0.18).toFixed(2)); // 18% GST
  const orderTotal = parseFloat((cartTotal + shippingPrice + taxPrice).toFixed(2));

  const handleQuantityChange = async (productId, qty) => {
    try {
      await updateItem(productId, Number(qty));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-container cart-empty">
        <div className="empty-cart">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary btn-lg">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</h1>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.product} className="cart-item">
              <img
                src={item.image} alt={item.name} className="cart-item-image"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Product'; }}
              />
              <div className="cart-item-details">
                <Link to={`/products/${item.product}`} className="cart-item-name">{item.name}</Link>
                <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')} each</p>
              </div>
              <div className="cart-item-qty">
                <select
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.product, e.target.value)}
                  className="qty-select"
                  disabled={loading}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="cart-item-subtotal">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
              <button
                className="cart-remove-btn" onClick={() => handleRemove(item.product)}
                aria-label={`Remove ${item.name}`} disabled={loading}
              >✕</button>
            </div>
          ))}

          <div className="cart-actions">
            <Link to="/products" className="btn-outline">← Continue Shopping</Link>
            <button className="btn-outline btn-danger" onClick={emptyCart} disabled={loading}>
              🗑️ Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shippingPrice === 0 ? <span className="free-shipping">FREE</span> : `₹${shippingPrice}`}</span>
          </div>
          <div className="summary-row">
            <span>GST (18%)</span>
            <span>₹{taxPrice.toLocaleString('en-IN')}</span>
          </div>
          {cartTotal < 500 && (
            <Message type="info">Add ₹{(500 - cartTotal).toLocaleString('en-IN')} more for free shipping!</Message>
          )}
          <hr />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{orderTotal.toLocaleString('en-IN')}</span>
          </div>
          <button className="btn-primary btn-full btn-lg" onClick={handleCheckout}>
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
