import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const AppNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItemsCount, wishlistCount } = useContext(CartContext);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?search=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <Navbar expand="lg" className="sticky-top mb-4 shadow-sm" style={{ backdropFilter: 'blur(15px)', backgroundColor: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="bi bi-bag-heart-fill me-2 text-primary"></i>
          ShopEZ
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        
        <Navbar.Collapse id="navbar-nav">
          <Form onSubmit={handleSearchSubmit} className="d-flex mx-auto my-2 my-lg-0 w-50 max-w-sm">
            <Form.Control
              type="search"
              placeholder="Search products..."
              className="me-2"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ borderRadius: '20px', paddingLeft: '1.2rem' }}
            />
            <Button type="submit" variant="outline-primary" style={{ borderRadius: '20px' }}>
              <i className="bi bi-search"></i>
            </Button>
          </Form>

          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="px-3">Home</Nav.Link>
            <Nav.Link as={Link} to="/shop" className="px-3">Shop</Nav.Link>
            
            {/* Wishlist Link with badge */}
            <Nav.Link as={Link} to="/wishlist" className="px-3 position-relative">
              <i className="bi bi-heart fs-5"></i>
              {wishlistCount > 0 && (
                <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {wishlistCount}
                </span>
              )}
            </Nav.Link>

            {/* Cart Link with badge */}
            <Nav.Link as={Link} to="/cart" className="px-3 position-relative me-2">
              <i className="bi bi-cart3 fs-5"></i>
              {cartItemsCount > 0 && (
                <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: '0.65rem' }}>
                  {cartItemsCount}
                </span>
              )}
            </Nav.Link>

            {/* User Dropdown / Login Link */}
            {user ? (
              <NavDropdown title={<><i className="bi bi-person-circle me-1"></i> {user.name.split(' ')[0]}</>} id="user-nav-dropdown" align="end">
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="bi bi-person me-2"></i>Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders">
                  <i className="bi bi-bag me-2"></i>My Orders
                </NavDropdown.Item>
                
                {user.role === 'ADMIN' && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/dashboard" className="text-primary fw-semibold">
                      <i className="bi bi-speedometer2 me-2"></i>Admin Panel
                    </NavDropdown.Item>
                  </>
                )}
                
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link to="/login" className="btn btn-primary-gradient py-2 px-4 text-white ms-2 text-decoration-none">
                Login
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
