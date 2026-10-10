import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await addItem(product._id, 1);
      alert('Added to cart!');
    } catch (err) {
      alert(err.message);
    }
  };

  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        <div className="product-image-wrapper">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Product'; }}
          />
          {product.isFeatured && <span className="badge-featured">Featured</span>}
          {product.countInStock === 0 && <span className="badge-out">Out of Stock</span>}
        </div>
        <div className="product-info">
          <p className="product-category">{product.category}</p>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-rating">
            <span className="stars">{stars}</span>
            <span className="review-count">({product.numReviews})</span>
          </div>
          <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
        </div>
      </Link>
      <button
        className={`btn-add-cart ${product.countInStock === 0 ? 'btn-disabled' : ''}`}
        onClick={handleAddToCart}
        disabled={product.countInStock === 0}
      >
        {product.countInStock === 0 ? 'Out of Stock' : '+ Add to Cart'}
      </button>
    </div>
  );
}
