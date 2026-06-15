import React, { useContext } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useContext(CartContext);

  const isInWishlist = wishlist?.products?.some(p => p._id.toString() === product._id.toString());

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const result = await addToCart(product._id, 1);
    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    const result = await toggleWishlist(product._id);
    if (result.success) {
      if (result.isInWishlist) {
        toast.success(`${product.name} added to wishlist!`);
      } else {
        toast.info(`${product.name} removed from wishlist.`);
      }
    } else {
      toast.error(result.error);
    }
  };

  // Calculate discount percentage
  const discountPercent = product.discountPrice > 0 && product.price > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
      } else if (i - 0.5 <= rating) {
        stars.push(<i key={i} className="bi bi-star-half text-warning"></i>);
      } else {
        stars.push(<i key={i} className="bi bi-star text-warning"></i>);
      }
    }
    return stars;
  };

  return (
    <Card className="shopez-card h-100 position-relative animate-fade-in-up">
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="badge-discount">
          -{discountPercent}% OFF
        </span>
      )}

      {/* Wishlist Heart Toggle */}
      <button
        onClick={handleWishlistToggle}
        className="btn position-absolute top-0 end-0 m-3 rounded-circle shadow-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 10,
          border: 'none',
          padding: '0.4rem 0.5rem',
          lineHeight: 1
        }}
      >
        <i className={`bi ${isInWishlist ? 'bi-heart-fill text-danger' : 'bi-heart'} fs-5`}></i>
      </button>

      {/* Product Image Link */}
      <Link to={`/product/${product.slug}`} className="product-image-container d-block" style={{ height: '220px' }}>
        <Card.Img
          variant="top"
          src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.png'}
          alt={product.name}
          className="w-100 h-100"
        />
      </Link>

      <Card.Body className="d-flex flex-column p-3">
        <span className="text-muted text-uppercase mb-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
          {product.category?.name || 'Product'}
        </span>
        
        <Card.Title as={Link} to={`/product/${product.slug}`} className="text-decoration-none text-dark h6 mb-2 text-truncate-2" style={{ height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.name}
        </Card.Title>

        <div className="d-flex align-items-center mb-3">
          <div className="rating-stars me-2">
            {renderStars(product.rating)}
          </div>
          <small className="text-muted">({product.numReviews})</small>
        </div>

        <div className="mt-auto d-flex align-items-center justify-content-between">
          <div className="d-flex flex-column">
            {product.discountPrice > 0 ? (
              <>
                <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.8rem' }}>
                  ₹{product.price}
                </span>
                <span className="text-primary fw-bold fs-5">
                  ₹{product.discountPrice}
                </span>
              </>
            ) : (
              <span className="text-dark fw-bold fs-5">
                ₹{product.price}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            variant="primary"
            className="btn-primary-gradient py-2 px-3 d-flex align-items-center gap-2"
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <i className="bi bi-cart-plus fs-6"></i> Add
              </>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
