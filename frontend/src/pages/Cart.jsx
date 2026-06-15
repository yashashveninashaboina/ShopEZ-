import React, { useContext } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const {
    activeCartItems,
    savedForLaterItems,
    prices,
    updateCartItem,
    removeFromCart
  } = useContext(CartContext);

  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQty, stock) => {
    if (newQty < 1) return;
    if (newQty > stock) {
      return toast.warning(`Only ${stock} items available in stock.`);
    }
    const result = await updateCartItem(itemId, newQty, undefined);
    if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleSaveForLaterToggle = async (itemId, saveForLater) => {
    const result = await updateCartItem(itemId, undefined, saveForLater);
    if (result.success) {
      toast.info(saveForLater ? 'Item saved for later.' : 'Item moved to shopping cart.');
    } else {
      toast.error(result.error);
    }
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Remove this item from your cart?')) {
      const result = await removeFromCart(itemId);
      if (result.success) {
        toast.info('Item removed from cart.');
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleCheckout = () => {
    if (activeCartItems.length === 0) {
      return toast.warning('Your active cart is empty.');
    }
    navigate('/checkout');
  };

  return (
    <Container className="my-3">
      <h2 className="fw-bold mb-4">Shopping Cart</h2>

      {!user ? (
        <Alert variant="warning">
          <p className="mb-0">
            Please <Link to="/login" className="alert-link">login</Link> to view and manage your shopping cart.
          </p>
        </Alert>
      ) : activeCartItems.length === 0 && savedForLaterItems.length === 0 ? (
        <Card className="border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: '16px' }}>
          <i className="bi bi-cart-x display-3 mb-3 text-primary"></i>
          <h5>Your Cart is Empty</h5>
          <p className="mb-0">Add items from the store to checkout.</p>
          <Link to="/shop" className="btn btn-primary-gradient mt-4 mx-auto px-4 py-2 text-decoration-none">
            Go Shopping
          </Link>
        </Card>
      ) : (
        <Row className="gy-4">
          {/* Cart Items List */}
          <Col lg={8}>
            {/* Active Items */}
            <Card className="border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '16px' }}>
              <h5 className="fw-bold mb-3">Active Items ({activeCartItems.length})</h5>
              {activeCartItems.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No active items to checkout.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="align-middle">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCartItems.map((item) => {
                        const productPrice = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
                        return (
                          <tr key={item._id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={item.product?.images?.[0] || '/images/placeholder.png'}
                                  alt={item.product?.name}
                                  style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                                />
                                <div>
                                  <Link to={`/product/${item.product?.slug}`} className="text-decoration-none text-dark fw-bold small d-block">
                                    {item.product?.name}
                                  </Link>
                                  <div className="d-flex gap-2 mt-1">
                                    <button
                                      onClick={() => handleSaveForLaterToggle(item._id, true)}
                                      className="btn btn-link p-0 text-decoration-none small text-muted"
                                      style={{ fontSize: '0.75rem' }}
                                    >
                                      Save for Later
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="fw-semibold">₹{productPrice}</span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center border rounded-2 bg-light px-1" style={{ width: 'fit-content' }}>
                                <Button variant="link" onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.product?.stock)} className="text-decoration-none px-2 text-dark fs-6 py-0 fw-bold">-</Button>
                                <span className="px-2 fw-semibold small">{item.quantity}</span>
                                <Button variant="link" onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.product?.stock)} className="text-decoration-none px-2 text-dark fs-6 py-0 fw-bold">+</Button>
                              </div>
                            </td>
                            <td>
                              <span className="text-primary fw-bold">₹{productPrice * item.quantity}</span>
                            </td>
                            <td>
                              <button onClick={() => handleRemove(item._id)} className="btn text-danger p-0">
                                <i className="bi bi-trash fs-5"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card>

            {/* Saved For Later Items */}
            {savedForLaterItems.length > 0 && (
              <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '16px' }}>
                <h5 className="fw-bold mb-3">Saved For Later ({savedForLaterItems.length})</h5>
                <div className="table-responsive">
                  <Table className="align-middle">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Action</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedForLaterItems.map((item) => {
                        const productPrice = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
                        return (
                          <tr key={item._id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={item.product?.images?.[0] || '/images/placeholder.png'}
                                  alt={item.product?.name}
                                  style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                                />
                                <div>
                                  <Link to={`/product/${item.product?.slug}`} className="text-decoration-none text-dark fw-bold small d-block">
                                    {item.product?.name}
                                  </Link>
                                  <small className="text-muted">Stock: {item.product?.stock > 0 ? 'In Stock' : 'Out of Stock'}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="fw-semibold">₹{productPrice}</span>
                            </td>
                            <td>
                              <Button
                                onClick={() => handleSaveForLaterToggle(item._id, false)}
                                variant="outline-primary"
                                size="sm"
                                disabled={item.product?.stock === 0}
                                style={{ borderRadius: '8px' }}
                              >
                                Move to Cart
                              </Button>
                            </td>
                            <td>
                              <button onClick={() => handleRemove(item._id)} className="btn text-danger p-0">
                                <i className="bi bi-trash fs-5"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card>
            )}
          </Col>

          {/* Checkout Order Summary */}
          {activeCartItems.length > 0 && (
            <Col lg={4}>
              <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#f8fafc', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <h5 className="fw-bold mb-4">Order Summary</h5>
                
                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Subtotal ({activeCartItems.length} items)</span>
                  <span>₹{prices.itemsPrice.toFixed(2)}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Shipping</span>
                  <span>{prices.shippingPrice === 0 ? 'FREE' : `₹${prices.shippingPrice.toFixed(2)}`}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-3 small text-muted">
                  <span>Tax (8.25%)</span>
                  <span>₹{prices.taxPrice.toFixed(2)}</span>
                </div>
                
                <hr className="my-3" />
                
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold">Total Price</span>
                  <span className="text-primary fw-bold fs-4">₹{prices.totalPrice.toFixed(2)}</span>
                </div>
                
                <Button onClick={handleCheckout} className="btn-primary-gradient w-100 py-3 fs-6 fw-bold" style={{ borderRadius: '12px' }}>
                  Proceed to Checkout
                </Button>
                
                <div className="text-center mt-3">
                  <Link to="/shop" className="text-decoration-none small">
                    <i className="bi bi-arrow-left"></i> Continue Shopping
                  </Link>
                </div>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default Cart;
