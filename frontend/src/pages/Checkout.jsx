import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { user, addAddress } = useContext(AuthContext);
  const { activeCartItems, prices, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Step Tracker
  const [step, setStep] = useState(1);

  // Step 1: Address State
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Step 2: Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or Stripe
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Step 3: Order Placement State
  const [placingOrder, setPlacingOrder] = useState(false);

  // Redirect to cart if empty
  useEffect(() => {
    if (!activeCartItems || activeCartItems.length === 0) {
      navigate('/cart');
    }
    // Set default address if user has default
    if (user && user.addresses && user.addresses.length > 0) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(def);
    }
  }, [activeCartItems, user, navigate]);

  const handleAddressInputChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    const result = await addAddress({ ...addressForm, isDefault: user.addresses.length === 0 });
    setSavingAddress(false);
    if (result.success) {
      toast.success('Address added successfully!');
      // Select the newly added address
      const newAddressList = user.addresses || [];
      // Mongoose/context updates immediately
      setSelectedAddress(user.addresses[user.addresses.length - 1]);
      setShowAddressForm(false);
      setAddressForm({ street: '', city: '', state: '', zip: '', country: 'USA' });
    } else {
      toast.error(result.error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return toast.error('Please select a shipping address.');
    }

    try {
      setPlacingOrder(true);
      
      const orderData = {
        orderItems: activeCartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
          image: item.product.images[0]
        })),
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country
        },
        paymentMethod,
        itemsPrice: prices.itemsPrice,
        taxPrice: prices.taxPrice,
        shippingPrice: prices.shippingPrice,
        totalPrice: prices.totalPrice
      };

      // Create Order
      const { data: createdOrder } = await api.post('/api/orders', orderData);

      // Handle payment flow
      if (paymentMethod === 'COD') {
        toast.success('Order placed successfully (Cash on Delivery)!');
        await clearCart();
        navigate(`/orders`);
      } else {
        // Stripe payment flow (Simulated/Real hybrid)
        toast.info('Initiating secure card payment...');
        
        // Request payment intent
        const { data: intentData } = await api.post('/api/orders/payment-intent', {
          amount: prices.totalPrice
        });

        // Simulate payment gateway delay
        setTimeout(async () => {
          try {
            // Confirm/Pay order on server
            await api.put(`/api/orders/${createdOrder._id}/pay`, {
              id: intentData.clientSecret.split('_').pop() || `mock_stripe_tx_${Date.now()}`,
              status: 'succeeded',
              update_time: new Date().toISOString(),
              email_address: user.email
            });
            
            toast.success('Card payment successful! Order confirmed.');
            await clearCart();
            navigate(`/orders`);
          } catch (payErr) {
            console.error(payErr);
            toast.error('Payment confirmation failed. Check order status in history.');
            navigate('/orders');
          }
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to place order.');
    } finally {
      // Placing order remains true until redirect occurs
    }
  };

  return (
    <Container className="my-3">
      <h2 className="fw-bold mb-4 text-center text-md-start">Secure Checkout</h2>

      {/* Steps Tracker */}
      <div className="checkout-steps py-3 max-w-md mx-auto">
        <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-dot">{step > 1 ? <i className="bi bi-check-lg"></i> : '1'}</div>
          <small className="fw-semibold">Shipping</small>
        </div>
        <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-dot">{step > 2 ? <i className="bi bi-check-lg"></i> : '2'}</div>
          <small className="fw-semibold">Payment</small>
        </div>
        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
          <div className="step-dot">3</div>
          <small className="fw-semibold">Review</small>
        </div>
      </div>

      <Row className="gy-4">
        {/* Main checkout actions */}
        <Col lg={8}>
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
              <h5 className="fw-bold mb-4">Select Shipping Address</h5>
              
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="d-flex flex-column gap-3 mb-4">
                  {user.addresses.map((addr) => (
                    <Card
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr)}
                      className="p-3 cursor-pointer border-2"
                      style={{
                        cursor: 'pointer',
                        borderRadius: '12px',
                        borderColor: selectedAddress?._id === addr._id ? '#4f46e5' : '#e2e8f0',
                        backgroundColor: selectedAddress?._id === addr._id ? 'rgba(79, 70, 229, 0.02)' : 'white'
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="fw-semibold">{user.name}</div>
                          <div className="text-muted small mt-1">
                            {addr.street}, {addr.city}, {addr.state} - {addr.zip}, {addr.country}
                          </div>
                        </div>
                        {selectedAddress?._id === addr._id ? (
                          <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                        ) : (
                          <i className="bi bi-circle text-muted fs-4"></i>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mb-4">No shipping addresses found. Please add an address below.</Alert>
              )}

              {/* Show/Hide Address Form Toggle */}
              {!showAddressForm ? (
                <Button variant="outline-primary" onClick={() => setShowAddressForm(true)} className="py-2" style={{ borderRadius: '10px' }}>
                  <i className="bi bi-plus-lg me-1"></i> Add New Address
                </Button>
              ) : (
                <Card className="p-3 border-0 bg-light" style={{ borderRadius: '12px' }}>
                  <h6 className="fw-bold mb-3">Add New Address</h6>
                  <Form onSubmit={handleAddAddressSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted fw-semibold">Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="street"
                        placeholder="e.g. 123 Main St, Appt 4B"
                        value={addressForm.street}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </Form.Group>
                    <Row className="g-3 mb-3">
                      <Col sm={6}>
                        <Form.Label className="small text-muted fw-semibold">City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          placeholder="e.g. New York"
                          value={addressForm.city}
                          onChange={handleAddressInputChange}
                          required
                        />
                      </Col>
                      <Col sm={6}>
                        <Form.Label className="small text-muted fw-semibold">State / Region</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          placeholder="e.g. NY"
                          value={addressForm.state}
                          onChange={handleAddressInputChange}
                          required
                        />
                      </Col>
                    </Row>
                    <Row className="g-3 mb-4">
                      <Col sm={6}>
                        <Form.Label className="small text-muted fw-semibold">Zip / Postal Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="zip"
                          placeholder="e.g. 10001"
                          value={addressForm.zip}
                          onChange={handleAddressInputChange}
                          required
                        />
                      </Col>
                      <Col sm={6}>
                        <Form.Label className="small text-muted fw-semibold">Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={addressForm.country}
                          onChange={handleAddressInputChange}
                          required
                        />
                      </Col>
                    </Row>
                    <div className="d-flex gap-2">
                      <Button type="submit" disabled={savingAddress} className="btn-primary-gradient px-4 py-2">
                        {savingAddress ? 'Saving...' : 'Save & Select'}
                      </Button>
                      <Button variant="outline-secondary" onClick={() => setShowAddressForm(false)} className="px-4 py-2" style={{ borderRadius: '10px' }}>
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </Card>
              )}

              {/* Navigation buttons */}
              {selectedAddress && !showAddressForm && (
                <div className="d-flex justify-content-end mt-4">
                  <Button onClick={() => setStep(2)} className="btn-primary-gradient px-4 py-2">
                    Proceed to Payment <i className="bi bi-arrow-right"></i>
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && (
            <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
              <h5 className="fw-bold mb-4">Select Payment Method</h5>
              
              <Form.Group className="mb-4">
                {/* Cash on Delivery option */}
                <Card
                  onClick={() => setPaymentMethod('COD')}
                  className="p-3 mb-3 border-2"
                  style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    borderColor: paymentMethod === 'COD' ? '#4f46e5' : '#e2e8f0',
                    backgroundColor: paymentMethod === 'COD' ? 'rgba(79, 70, 229, 0.02)' : 'white'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <i className="bi bi-cash-coin text-primary fs-3"></i>
                      <div>
                        <div className="fw-bold">Cash on Delivery (COD)</div>
                        <div className="text-muted small">Pay with cash upon package delivery.</div>
                      </div>
                    </div>
                    {paymentMethod === 'COD' ? (
                      <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                    ) : (
                      <i className="bi bi-circle text-muted fs-4"></i>
                    )}
                  </div>
                </Card>

                {/* Credit Card option */}
                <Card
                  onClick={() => setPaymentMethod('Stripe')}
                  className="p-3 border-2"
                  style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    borderColor: paymentMethod === 'Stripe' ? '#4f46e5' : '#e2e8f0',
                    backgroundColor: paymentMethod === 'Stripe' ? 'rgba(79, 70, 229, 0.02)' : 'white'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <i className="bi bi-credit-card-2-front text-primary fs-3"></i>
                      <div>
                        <div className="fw-bold">Credit/Debit Card (Stripe Secured)</div>
                        <div className="text-muted small">Pay securely online with your credit card.</div>
                      </div>
                    </div>
                    {paymentMethod === 'Stripe' ? (
                      <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                    ) : (
                      <i className="bi bi-circle text-muted fs-4"></i>
                    )}
                  </div>
                </Card>
              </Form.Group>

              {/* Simulated Card input fields for Mock Payment */}
              {paymentMethod === 'Stripe' && (
                <Card className="p-3 border-0 bg-light mb-4" style={{ borderRadius: '12px' }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="fw-bold mb-0">Card Information (Simulated Mode)</h6>
                    <span className="badge bg-warning text-dark"><i className="bi bi-shield-check"></i> Test Sandbox</span>
                  </div>
                  
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted fw-semibold">Cardholder Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted fw-semibold">Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        required
                      />
                    </Form.Group>

                    <Row className="g-3">
                      <Col sm={6}>
                        <Form.Label className="small text-muted fw-semibold">Expiry Date</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          required
                        />
                      </Col>
                      <Col sm={6}>
                        <Form.Label className="small text-muted fw-semibold">CVC / CVV</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="123"
                          maxLength={3}
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                          required
                        />
                      </Col>
                    </Row>
                  </Form>
                </Card>
              )}

              {/* Navigation buttons */}
              <div className="d-flex justify-content-between mt-4">
                <Button onClick={() => setStep(1)} variant="outline-secondary" className="px-4 py-2" style={{ borderRadius: '10px' }}>
                  <i className="bi bi-arrow-left"></i> Back to Shipping
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={paymentMethod === 'Stripe' && (!cardDetails.name || !cardDetails.number || !cardDetails.cvc || !cardDetails.expiry)}
                  className="btn-primary-gradient px-4 py-2"
                >
                  Review Order <i className="bi bi-arrow-right"></i>
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: REVIEW ORDER */}
          {step === 3 && (
            <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
              <h5 className="fw-bold mb-4">Review Your Order</h5>
              
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-2"><i className="bi bi-geo-alt me-1"></i> Shipping Address</h6>
                <p className="mb-0 text-muted small ps-3">
                  {user?.name} <br />
                  {selectedAddress?.street}, {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.zip}, {selectedAddress?.country}
                </p>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-2"><i className="bi bi-credit-card me-1"></i> Payment Method</h6>
                <p className="mb-0 text-muted small ps-3">
                  {paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : `Credit Card (Ending in ${cardDetails.number.slice(-4)})`}
                </p>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3"><i className="bi bi-bag-check me-1"></i> Order Items</h6>
                <div className="d-flex flex-column gap-3 ps-3">
                  {activeCartItems.map((item) => {
                    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                    return (
                      <div key={item._id} className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                          />
                          <div>
                            <span className="fw-semibold small d-block">{item.product.name}</span>
                            <small className="text-muted">Qty: {item.quantity} x ₹{price}</small>
                          </div>
                        </div>
                        <span className="fw-bold text-dark">₹{(price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="d-flex justify-content-between mt-5">
                <Button onClick={() => setStep(2)} disabled={placingOrder} variant="outline-secondary" className="px-4 py-2" style={{ borderRadius: '10px' }}>
                  <i className="bi bi-arrow-left"></i> Back to Payment
                </Button>
                
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="btn-accent-gradient px-4 py-2 d-flex align-items-center gap-2"
                >
                  {placingOrder ? (
                    <>
                      <Spinner size="sm" animation="border" /> Processing Order...
                    </>
                  ) : (
                    <>
                      Place Order & Pay <i className="bi bi-shield-check"></i>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </Col>

        {/* Sidebar Order Overview */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#f8fafc', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <h5 className="fw-bold mb-4">Cart Summary</h5>
            
            <div className="d-flex flex-column gap-2 mb-3">
              {activeCartItems.map(item => (
                <div key={item._id} className="d-flex justify-content-between small text-muted">
                  <span className="text-truncate" style={{ maxWidth: '200px' }}>{item.product.name} (x{item.quantity})</span>
                  <span>₹{((item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <hr />

            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Items Total</span>
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
            
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">Total Price</span>
              <span className="text-primary fw-bold fs-4">₹{prices.totalPrice.toFixed(2)}</span>
            </div>

            <div className="bg-white border rounded-3 p-3 mt-4 small text-muted text-center">
              <i className="bi bi-shield-lock-fill text-success fs-5 me-1 d-inline-block mb-1"></i>
              <div className="fw-bold text-dark">SSL Secured Transaction</div>
              <div>Your details are safe and encrypted.</div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
