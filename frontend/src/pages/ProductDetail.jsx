import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../utils/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const { addToCart, toggleWishlist, wishlist } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Image Selection State
  const [selectedImage, setSelectedImage] = useState('');

  // Cart/Order State
  const [quantity, setQuantity] = useState(1);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isInWishlist = wishlist?.products?.some(p => p._id.toString() === product?._id.toString());

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch main product details
        const prodRes = await api.get(`/api/products/slug/${slug}`);
        const prod = prodRes.data;
        setProduct(prod);
        setSelectedImage(prod.images[0]);

        // Fetch related products
        const relatedRes = await api.get(`/api/products/${prod._id}/related`);
        setRelatedProducts(relatedRes.data);

        // Fetch reviews
        const reviewsRes = await api.get(`/api/products/${prod._id}/reviews`);
        setReviews(reviewsRes.data);

      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  const handleAddToCart = async () => {
    const result = await addToCart(product._id, quantity);
    if (result.success) {
      toast.success(`${quantity} ${product.name} added to cart!`);
    } else {
      toast.error(result.error);
    }
  };

  const handleWishlistToggle = async () => {
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error('Please add a review comment');
    }

    try {
      setSubmittingReview(true);
      await api.post(`/api/products/${product._id}/reviews`, { rating, comment });
      
      toast.success('Review submitted successfully!');
      setComment('');
      
      // Refresh reviews and product aggregates
      const reviewsRes = await api.get(`/api/products/${product._id}/reviews`);
      setReviews(reviewsRes.data);

      const prodRes = await api.get(`/api/products/slug/${slug}`);
      setProduct(prodRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

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

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/shop" className="btn btn-primary-gradient">Back to Shop</Link>
      </Container>
    );
  }

  return (
    <Container className="my-3">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/shop" className="text-decoration-none">Shop</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Main product details block */}
      <Row className="gy-4 mb-5">
        {/* Product Image Gallery */}
        <Col md={6}>
          <div className="border rounded-3 p-3 bg-white mb-3 text-center d-flex align-items-center justify-content-center" style={{ height: '420px', overflow: 'hidden' }}>
            <img src={selectedImage} alt={product.name} className="img-fluid w-100 h-100" style={{ objectFit: 'contain' }} />
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="d-flex gap-2 justify-content-center">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`border rounded-2 p-1 bg-white cursor-pointer ${selectedImage === img ? 'border-primary border-2' : ''}`}
                  style={{ width: '70px', height: '70px', overflow: 'hidden', cursor: 'pointer' }}
                >
                  <img src={img} alt={`thumbnail-${idx}`} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </Col>

        {/* Product Info Description & Buy Actions */}
        <Col md={6}>
          <div className="ps-md-3">
            <span className="text-muted text-uppercase fw-semibold small mb-2 d-inline-block">
              {product.category?.name}
            </span>
            <h1 className="fw-bold mb-2">{product.name}</h1>
            
            <div className="d-flex align-items-center mb-4">
              <div className="rating-stars me-2 fs-5">
                {renderStars(product.rating)}
              </div>
              <span className="text-muted fs-6">({product.numReviews} customer reviews)</span>
            </div>

            <hr className="my-3 text-muted" />

            {/* Price section */}
            <div className="mb-4">
              {product.discountPrice > 0 ? (
                <div className="d-flex align-items-baseline gap-3">
                  <h2 className="text-primary fw-bold mb-0">${product.discountPrice}</h2>
                  <h4 className="text-muted text-decoration-line-through mb-0">${product.price}</h4>
                  <span className="badge bg-danger rounded-pill px-3 py-2">
                    Save ${product.price - product.discountPrice}
                  </span>
                </div>
              ) : (
                <h2 className="text-dark fw-bold">${product.price}</h2>
              )}
            </div>

            <p className="mb-4 text-muted lead" style={{ fontSize: '1.05rem' }}>{product.description}</p>

            {/* Stock indicator badge */}
            <div className="mb-4">
              {product.stock > 5 ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-2 fs-6">
                  <i className="bi bi-check-circle-fill me-1"></i> In Stock ({product.stock} available)
                </span>
              ) : product.stock > 0 ? (
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-2 fs-6">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i> Only {product.stock} units left!
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-2 fs-6">
                  <i className="bi bi-x-circle-fill me-1"></i> Out of Stock
                </span>
              )}
            </div>

            {/* Features Bullet List */}
            {product.features && product.features.length > 0 && (
              <div className="mb-4 p-3 bg-light rounded-3">
                <h6 className="fw-bold mb-2">Key Highlights:</h6>
                <ul className="mb-0 ps-3 text-muted small">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="mb-1">{feat}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buy / Quantity controls */}
            {product.stock > 0 && (
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center border rounded-3 bg-light px-2" style={{ height: '48px' }}>
                  <Button variant="link" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-decoration-none px-2 text-dark fs-5 py-0">-</Button>
                  <span className="px-3 fw-bold">{quantity}</span>
                  <Button variant="link" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="text-decoration-none px-2 text-dark fs-5 py-0">+</Button>
                </div>

                <Button onClick={handleAddToCart} className="btn-primary-gradient px-4 fs-6 py-2 d-flex align-items-center gap-2 h-100" style={{ height: '48px', borderRadius: '10px' }}>
                  <i className="bi bi-cart-plus fs-5"></i> Add to Cart
                </Button>
              </div>
            )}

            <div className="d-flex gap-2">
              <Button onClick={handleWishlistToggle} variant="outline-secondary" className="d-flex align-items-center gap-2 py-2 px-3" style={{ borderRadius: '10px' }}>
                <i className={`bi ${isInWishlist ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Reviews and Ratings Breakdown Section */}
      <Row className="gy-4 mb-5">
        <Col lg={7}>
          <h4 className="fw-bold mb-4">Customer Reviews</h4>
          {reviews.length === 0 ? (
            <Alert variant="info">No reviews yet. Be the first to write one!</Alert>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews.map((rev) => (
                <Card key={rev._id} className="border-0 shadow-sm p-3" style={{ borderRadius: '12px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-bold text-dark">{rev.userName}</div>
                    <small className="text-muted">{new Date(rev.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="rating-stars mb-2">
                    {renderStars(rev.rating)}
                  </div>
                  <p className="mb-0 text-muted small">{rev.comment}</p>
                </Card>
              ))}
            </div>
          )}
        </Col>

        {/* Submit Review Form */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#f8fafc' }}>
            <h5 className="fw-bold mb-3">Write a Customer Review</h5>
            {user ? (
              <Form onSubmit={handleReviewSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Rating</Form.Label>
                  <Form.Select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="5">5 ★ (Excellent)</option>
                    <option value="4">4 ★ (Very Good)</option>
                    <option value="3">3 ★ (Average)</option>
                    <option value="2">2 ★ (Poor)</option>
                    <option value="1">1 ★ (Terrible)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Review Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Describe your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ borderRadius: '8px' }}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary-gradient w-100"
                  style={{ borderRadius: '10px' }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </Form>
            ) : (
              <div className="text-center p-3">
                <p>You must be logged in to submit a review.</p>
                <Link to="/login" className="btn btn-primary-gradient px-4 py-2 text-decoration-none">Login Here</Link>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h4 className="fw-bold mb-4">Related Products</h4>
          <Row className="g-4">
            {relatedProducts.map((prod) => (
              <Col key={prod._id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={prod} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default ProductDetail;
