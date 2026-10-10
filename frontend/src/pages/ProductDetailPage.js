import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, createReview } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Message from '../components/Message';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchProductById(id);
        setProduct(data);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAddingToCart(true);
    try {
      await addItem(product._id, qty);
      setCartMsg('Added to cart!');
      setTimeout(() => setCartMsg(''), 3000);
    } catch (err) {
      setCartMsg(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setReviewLoading(true);
    setReviewMsg('');
    try {
      await createReview(id, { rating, comment });
      setReviewMsg('Review submitted!');
      setComment('');
      setRating(5);
      // Reload product to show new review
      const { data } = await fetchProductById(id);
      setProduct(data);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Spinner message="Loading product..." />;
  if (error) return <div className="page-container"><Message type="error">{error}</Message></div>;

  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>

      <div className="product-detail">
        {/* Image */}
        <div className="product-detail-image">
          <img
            src={product.image} alt={product.name}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=Product'; }}
          />
          {product.isFeatured && <span className="badge-featured">Featured</span>}
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <p className="product-category">{product.category} · {product.brand}</p>
          <h1>{product.name}</h1>

          <div className="product-rating-large">
            <span className="stars">{stars(product.rating)}</span>
            <span>{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          <p className="product-price-large">₹{product.price.toLocaleString('en-IN')}</p>

          <p className="product-description">{product.description}</p>

          <div className="stock-info">
            {product.countInStock > 0 ? (
              <span className="in-stock">✅ In Stock ({product.countInStock} left)</span>
            ) : (
              <span className="out-stock">❌ Out of Stock</span>
            )}
          </div>

          {product.countInStock > 0 && (
            <div className="qty-section">
              <label>Quantity:</label>
              <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="qty-select">
                {Array.from({ length: Math.min(product.countInStock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          {cartMsg && <Message type={cartMsg.includes('Added') ? 'success' : 'error'}>{cartMsg}</Message>}

          <button
            className="btn-primary btn-lg btn-full"
            onClick={handleAddToCart}
            disabled={product.countInStock === 0 || addingToCart}
          >
            {addingToCart ? 'Adding...' : product.countInStock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
          </button>

          <button
            className="btn-outline btn-lg btn-full"
            onClick={() => { handleAddToCart().then(() => navigate('/cart')); }}
            disabled={product.countInStock === 0}
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        {product.reviews.length === 0 ? (
          <Message type="info">No reviews yet. Be the first to review!</Message>
        ) : (
          <div className="reviews-list">
            {product.reviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-header">
                  <strong>{r.name}</strong>
                  <span className="stars">{stars(r.rating)}</span>
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Write review */}
        {user ? (
          <div className="review-form-wrapper">
            <h3>Write a Review</h3>
            {reviewMsg && <Message type={reviewMsg.includes('submitted') ? 'success' : 'error'}>{reviewMsg}</Message>}
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label>Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-control">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..." required rows={4} className="form-control"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={reviewLoading}>
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <Message type="info">
            Please <a href="/login">login</a> to write a review.
          </Message>
        )}
      </div>
    </div>
  );
}
