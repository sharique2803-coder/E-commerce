import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import Message from '../components/Message';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { cartItems, cartTotal, emptyCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  // Credit / Debit card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  // UPI details
  const [upiId, setUpiId] = useState('');

  const shippingPrice = cartTotal > 500 ? 0 : 49;
  const taxPrice = parseFloat((cartTotal * 0.18).toFixed(2));
  const totalPrice = parseFloat((cartTotal + shippingPrice + taxPrice).toFixed(2));

  // Format card number with spaces every 4 digits
  const formatCardNumber = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry as MM/YY
  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shipping.street || !shipping.city || !shipping.state || !shipping.zipCode) {
      setError('Please fill all shipping fields');
      return;
    }
    setError('');
    setStep(1);
  };

  const handlePaymentContinue = () => {
    setError('');

    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      const rawNumber = cardDetails.cardNumber.replace(/\s/g, '');
      if (rawNumber.length < 16) { setError('Please enter a valid 16-digit card number'); return; }
      if (!cardDetails.cardName.trim()) { setError('Please enter the cardholder name'); return; }
      if (cardDetails.expiry.length < 5) { setError('Please enter a valid expiry date (MM/YY)'); return; }
      if (cardDetails.cvv.length < 3) { setError('Please enter a valid CVV'); return; }
    }

    if (paymentMethod === 'UPI') {
      if (!upiId.includes('@')) { setError('Please enter a valid UPI ID (e.g. name@upi)'); return; }
    }

    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const orderItems = cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const { data } = await createOrder({
        orderItems,
        shippingAddress: shipping,
        paymentMethod,
        itemsPrice: cartTotal,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      await emptyCart();
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Summary of entered payment for review step
  const getPaymentSummary = () => {
    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      const last4 = cardDetails.cardNumber.replace(/\s/g, '').slice(-4);
      return `${paymentMethod} ending in •••• ${last4}`;
    }
    if (paymentMethod === 'UPI') return `UPI — ${upiId}`;
    return 'Cash on Delivery';
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Checkout</h1>

      {/* Step indicator */}
      <div className="steps-indicator">
        {STEPS.map((s, i) => (
          <div key={s} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            <span className="step-number">{i < step ? '✓' : i + 1}</span>
            <span className="step-label">{s}</span>
          </div>
        ))}
      </div>

      {error && <Message type="error">{error}</Message>}

      <div className="checkout-layout">
        <div className="checkout-form">

          {/* ── Step 1: Shipping ── */}
          {step === 0 && (
            <form onSubmit={handleShippingSubmit} className="form-card">
              <h2>Shipping Address</h2>
              <div className="form-group">
                <label>Street Address *</label>
                <input className="form-control" value={shipping.street} required
                  onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                  placeholder="House No, Street, Area" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input className="form-control" value={shipping.city} required
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="Mumbai" />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input className="form-control" value={shipping.state} required
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    placeholder="Maharashtra" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input className="form-control" value={shipping.zipCode} required
                    onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                    placeholder="400001" />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input className="form-control" value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    placeholder="India" />
                </div>
              </div>
              <button type="submit" className="btn-primary btn-full">Continue to Payment →</button>
            </form>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 1 && (
            <div className="form-card">
              <h2>Payment Method</h2>

              {/* Payment method selector */}
              <div className="payment-options">
                {['Cash on Delivery', 'Credit Card', 'Debit Card', 'UPI'].map((method) => (
                  <label key={method} className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value={method}
                      checked={paymentMethod === method}
                      onChange={() => { setPaymentMethod(method); setError(''); }} />
                    <span>
                      {method === 'Cash on Delivery' && '💵 '}
                      {method === 'Credit Card' && '💳 '}
                      {method === 'Debit Card' && '🏦 '}
                      {method === 'UPI' && '📱 '}
                      {method}
                    </span>
                  </label>
                ))}
              </div>

              {/* ── Credit Card / Debit Card form ── */}
              {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                <div className="payment-details-form">
                  <div className="payment-card-visual">
                    <div className="card-chip">💳</div>
                    <div className="card-number-display">
                      {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="card-bottom">
                      <div>
                        <small>Card Holder</small>
                        <p>{cardDetails.cardName || 'YOUR NAME'}</p>
                      </div>
                      <div>
                        <small>Expires</small>
                        <p>{cardDetails.expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      className="form-control"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cardholder Name *</label>
                    <input
                      className="form-control"
                      value={cardDetails.cardName}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value.toUpperCase() })}
                      placeholder="AS ON CARD"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input
                        className="form-control"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        className="form-control"
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="•••"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <p className="payment-note">🔒 Your card details are encrypted and secure.</p>
                </div>
              )}

              {/* ── UPI form ── */}
              {paymentMethod === 'UPI' && (
                <div className="payment-details-form">
                  <div className="upi-logos">
                    <span title="Google Pay">GPay</span>
                    <span title="PhonePe">PhonePe</span>
                    <span title="Paytm">Paytm</span>
                    <span title="BHIM">BHIM</span>
                  </div>
                  <div className="form-group">
                    <label>UPI ID *</label>
                    <input
                      className="form-control"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                    />
                    <small style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                      e.g. mobilenumber@upi, name@okicici, name@ybl
                    </small>
                  </div>
                  <p className="payment-note">📱 A payment request will be sent to your UPI app after order placement.</p>
                </div>
              )}

              {/* ── Cash on Delivery info ── */}
              {paymentMethod === 'Cash on Delivery' && (
                <div className="payment-details-form">
                  <div className="cod-info">
                    <span className="cod-icon">🏠</span>
                    <div>
                      <h4>Pay when your order arrives</h4>
                      <p>Keep exact change ready. Our delivery partner will collect payment at your doorstep.</p>
                      <p style={{ color: 'var(--warning)', fontWeight: 600, marginTop: '0.5rem' }}>
                        ⚠️ Additional ₹49 COD fee may apply.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button className="btn-outline" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-primary" onClick={handlePaymentContinue}>
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 2 && (
            <div className="form-card">
              <h2>Review Your Order</h2>
              <div className="review-section">
                <h3>📦 Shipping To</h3>
                <p>{shipping.street}, {shipping.city}, {shipping.state} {shipping.zipCode}, {shipping.country}</p>
                <button className="btn-link" onClick={() => setStep(0)}>Edit</button>
              </div>
              <div className="review-section">
                <h3>💳 Payment</h3>
                <p>{getPaymentSummary()}</p>
                <button className="btn-link" onClick={() => setStep(1)}>Edit</button>
              </div>
              <div className="review-section">
                <h3>🛍️ Items</h3>
                {cartItems.map((item) => (
                  <div key={item.product} className="review-item">
                    <img src={item.image} alt={item.name} width="50"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/50x50'; }} />
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Placing Order...' : '✅ Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-summary">
          <h2>Summary</h2>
          {cartItems.map((item) => (
            <div key={item.product} className="summary-item">
              <span>{item.name} ×{item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span></div>
          <div className="summary-row"><span>GST (18%)</span><span>₹{taxPrice.toLocaleString('en-IN')}</span></div>
          <hr />
          <div className="summary-row summary-total"><span>Total</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
        </div>
      </div>
    </div>
  );
}
