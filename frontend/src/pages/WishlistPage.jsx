import React, { useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { user } = useContext(AuthContext);
  const { wishlist, fetchWishlist, loading } = useContext(CartContext);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="my-3">
      <h2 className="fw-bold mb-4">My Wishlist</h2>

      {!user ? (
        <Card className="border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: '16px' }}>
          <i className="bi bi-heart display-3 mb-3 text-danger"></i>
          <h5>Login to View Wishlist</h5>
          <p className="mb-0">Keep track of products you want to buy later.</p>
          <Link to="/login" className="btn btn-primary-gradient mt-4 mx-auto px-4 py-2 text-decoration-none">
            Login Now
          </Link>
        </Card>
      ) : !wishlist?.products || wishlist.products.length === 0 ? (
        <Card className="border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: '16px' }}>
          <i className="bi bi-heart display-3 mb-3 text-danger"></i>
          <h5>Your Wishlist is Empty</h5>
          <p className="mb-0">Explore products and tap the heart icon to save them here.</p>
          <Link to="/shop" className="btn btn-primary-gradient mt-4 mx-auto px-4 py-2 text-decoration-none">
            Find Products
          </Link>
        </Card>
      ) : (
        <Row className="g-4">
          {wishlist.products.map((product) => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default WishlistPage;
