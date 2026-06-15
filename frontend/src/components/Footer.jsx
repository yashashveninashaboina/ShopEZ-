import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-5 py-5 bg-dark text-white-50" style={{ borderTop: '4px solid #4f46e5' }}>
      <Container>
        <Row className="gy-4">
          <Col md={4} className="pe-md-5">
            <h5 className="text-white fw-bold mb-3">ShopEZ</h5>
            <p className="mb-4">
              Your ultimate online shopping destination. Shop the best deals on Electronics, Clothing, Sports, Books, Home, and Kitchen accessories.
            </p>
            <div className="d-flex gap-3 fs-5">
              <a href="#" className="text-white-50 hover-text-primary"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white-50 hover-text-primary"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-white-50 hover-text-primary"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white-50 hover-text-primary"><i className="bi bi-linkedin"></i></a>
            </div>
          </Col>
          
          <Col xs={6} md={2}>
            <h6 className="text-white fw-semibold mb-3">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/" className="text-white-50 text-decoration-none hover-link">Home</Link></li>
              <li><Link to="/shop" className="text-white-50 text-decoration-none hover-link">Shop</Link></li>
              <li><Link to="/cart" className="text-white-50 text-decoration-none hover-link">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="text-white-50 text-decoration-none hover-link">My Wishlist</Link></li>
            </ul>
          </Col>
          
          <Col xs={6} md={2}>
            <h6 className="text-white fw-semibold mb-3">Support</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="#" className="text-white-50 text-decoration-none hover-link">FAQ</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-link">Shipping & Delivery</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-link">Return Policy</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none hover-link">Privacy Policy</a></li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h6 className="text-white fw-semibold mb-3">Subscribe to Newsletter</h6>
            <p>Get the latest updates on new products, special deals, and promotions.</p>
            <Form onSubmit={(e) => e.preventDefault()} className="d-flex gap-2">
              <Form.Control
                type="email"
                placeholder="Enter your email"
                className="bg-secondary text-white border-0"
                style={{ borderRadius: '8px' }}
                required
              />
              <Button variant="primary" type="submit" style={{ borderRadius: '8px', background: 'var(--primary-gradient)', border: 'none' }}>
                Subscribe
              </Button>
            </Form>
          </Col>
        </Row>
        
        <hr className="my-4 border-secondary" />
        
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">&copy; {new Date().getFullYear()} ShopEZ. All rights reserved.</p>
          </Col>
          <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 text-white fs-4">
              <i className="bi bi-credit-card"></i>
              <i className="bi bi-wallet2"></i>
              <i className="bi bi-shield-check"></i>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
