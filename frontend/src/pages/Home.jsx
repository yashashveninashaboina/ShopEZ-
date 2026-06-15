import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data.slice(0, 5));

        // Fetch products (all) to filter locally or query specifically
        const prodRes = await api.get('/api/products?pageSize=8');
        const prods = prodRes.data.products;

        // Filter featured deals (products with discountPrice > 0)
        const deals = prods.filter(p => p.discountPrice > 0).slice(0, 4);
        setFeaturedProducts(deals.length > 0 ? deals : prods.slice(0, 4));

        // New arrivals (first 4 products by date, which is already default query sorting)
        setNewArrivals(prods.slice(0, 4));
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?search=${encodeURIComponent(keyword.trim())}`);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="my-2">
      {/* Premium Hero Section */}
      <div className="hero-section text-center text-md-start mb-5 animate-fade-in-up">
        <Row className="align-items-center gy-4">
          <Col md={7}>
            <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: 1.15 }}>
              Elevate Your Everyday <br />
              <span style={{ background: 'linear-gradient(90deg, #d946ef 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Shopping Experience
              </span>
            </h1>
            <p className="lead mb-4 opacity-75">
              Discover verified products, premium accessories, and tailored collections. Fast delivery, secure payments, and hassle-free returns.
            </p>
            <Form onSubmit={handleSearchSubmit} className="d-flex w-75 max-w-sm mb-3">
              <Form.Control
                type="search"
                placeholder="What are you looking for today?"
                className="me-2 py-3 shadow-lg border-0"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ borderRadius: '12px', paddingLeft: '1.5rem', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <Button type="submit" className="btn-accent-gradient px-4 py-3" style={{ borderRadius: '12px' }}>
                Search
              </Button>
            </Form>
            <div className="d-flex gap-3">
              <Button as={Link} to="/shop" className="btn-primary-gradient px-4 py-2">
                Shop Now
              </Button>
              <Button as={Link} to="/shop?sort=discount" variant="outline-light" className="px-4 py-2" style={{ borderRadius: '10px' }}>
                Explore Deals
              </Button>
            </div>
          </Col>
          <Col md={5} className="d-none d-md-block text-center position-relative">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=500&auto=format&fit=crop"
              alt="Hero shopping illustration"
              className="img-fluid rounded-4 shadow-lg"
              style={{ border: '2px solid rgba(255,255,255,0.1)', transform: 'rotate(2deg)', maxWidth: '85%' }}
            />
          </Col>
        </Row>
      </div>

      {/* Category circle bubbles (Amazon style) */}
      <div className="mb-5 animate-fade-in-up">
        <h4 className="mb-4 text-center text-md-start">Browse by Category</h4>
        <div className="d-flex justify-content-center justify-content-md-start gap-4 flex-wrap">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/shop?category=${cat.slug}`} className="category-item">
              <div className="category-circle">
                <img src={cat.image} alt={cat.name} />
              </div>
              <span className="small mt-2 fw-semibold text-center">{cat.name}</span>
            </Link>
          ))}
          <Link to="/shop" className="category-item">
            <div className="category-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e2e8f0' }}>
              <i className="bi bi-arrow-right fs-4 text-primary"></i>
            </div>
            <span className="small mt-2 fw-semibold">View All</span>
          </Link>
        </div>
      </div>

      {/* Trust Badges */}
      <Row className="g-4 mb-5 text-center text-md-start animate-fade-in-up">
        <Col md={4}>
          <div className="p-3 border rounded-3 bg-white d-flex align-items-center gap-3 h-100 shadow-sm">
            <i className="bi bi-truck fs-1 text-primary"></i>
            <div>
              <h6 className="mb-1 fw-bold">Free Shipping</h6>
              <p className="mb-0 text-muted small">On all orders above $100</p>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="p-3 border rounded-3 bg-white d-flex align-items-center gap-3 h-100 shadow-sm">
            <i className="bi bi-shield-check fs-1 text-success"></i>
            <div>
              <h6 className="mb-1 fw-bold">Secure Checkout</h6>
              <p className="mb-0 text-muted small">Stripe integrated card processing</p>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="p-3 border rounded-3 bg-white d-flex align-items-center gap-3 h-100 shadow-sm">
            <i className="bi bi-arrow-counterclockwise fs-1 text-danger"></i>
            <div>
              <h6 className="mb-1 fw-bold">Easy Returns</h6>
              <p className="mb-0 text-muted small">30 days refund and return policy</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Featured Deals Section */}
      <div className="mb-5 animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Featured Offers</h3>
          <Link to="/shop?sort=discount" className="text-decoration-none fw-semibold">View All Deals <i className="bi bi-chevron-right small"></i></Link>
        </div>
        <Row className="g-4">
          {featuredProducts.map((product) => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </div>

      {/* New Arrivals Section */}
      <div className="mb-4 animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">New Arrivals</h3>
          <Link to="/shop?sort=newest" className="text-decoration-none fw-semibold">Explore Catalog <i className="bi bi-chevron-right small"></i></Link>
        </div>
        <Row className="g-4">
          {newArrivals.map((product) => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default Home;
