import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Table, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? This will restore product stock.')) {
      try {
        await api.put(`/api/orders/${orderId}/cancel`);
        toast.success('Order cancelled successfully.');
        fetchOrders(); // Refresh order details
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel order.');
      }
    }
  };

  const handleOpenReturnModal = (orderId) => {
    setSelectedOrderId(orderId);
    setReturnReason('');
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) return toast.error('Please specify a return reason.');

    try {
      setSubmittingReturn(true);
      await api.post('/api/returns', {
        orderId: selectedOrderId,
        reason: returnReason
      });
      toast.success('Return request submitted successfully. Awaiting admin approval.');
      setShowReturnModal(false);
      fetchOrders(); // Refresh order details
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Helper to trigger HTML dynamic print invoice in a clean child window
  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ShopEZ Order #${order._id}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>
            body { padding: 40px; font-family: sans-serif; }
            .invoice-header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .item-table th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="invoice-header d-flex justify-content-between align-items-center">
              <div>
                <h1 class="fw-bold text-primary">ShopEZ</h1>
                <p class="text-muted mb-0">Invoice Receipt</p>
              </div>
              <div class="text-end">
                <h4>ShopEZ Corporation</h4>
                <p class="text-muted mb-0">Invoice: #${order._id.slice(-6).toUpperCase()}</p>
                <p class="text-muted mb-0">Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div class="row mb-5">
              <div class="col-6">
                <h6 class="text-muted text-uppercase fw-semibold">Billed To:</h6>
                <p class="mb-0"><strong>${user?.name}</strong></p>
                <p class="mb-0">${order.shippingAddress.street}</p>
                <p class="mb-0">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}</p>
                <p class="mb-0">${order.shippingAddress.country}</p>
              </div>
              <div class="col-6 text-end">
                <h6 class="text-muted text-uppercase fw-semibold">Payment Details:</h6>
                <p class="mb-0"><strong>Method:</strong> ${order.paymentMethod}</p>
                <p class="mb-0"><strong>Status:</strong> ${order.isPaid ? 'PAID' : 'COD - PENDING'}</p>
                <p class="mb-0"><strong>Delivery Status:</strong> ${order.orderStatus}</p>
              </div>
            </div>

            <table class="table table-bordered item-table mb-4">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th class="text-center" style="width: 100px;">Qty</th>
                  <th class="text-end" style="width: 150px;">Unit Price</th>
                  <th class="text-end" style="width: 150px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-end">$${item.price.toFixed(2)}</td>
                    <td class="text-end">$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="row justify-content-end">
              <div class="col-4 text-end">
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted">Items Subtotal:</span>
                  <span>$${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted">Shipping Charges:</span>
                  <span>${order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">GST/Sales Tax (8.25%):</span>
                  <span>$${order.taxPrice.toFixed(2)}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between">
                  <span class="fw-bold">Grand Total:</span>
                  <span class="fw-bold text-primary fs-5">$${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 text-center border-top text-muted small">
              Thank you for shopping at ShopEZ! If you have questions about this order, please contact support@shopez.com.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning" className="badge-status-pending text-uppercase px-3 py-2">Pending</Badge>;
      case 'Shipped':
        return <Badge bg="blue" className="badge-status-shipped text-uppercase px-3 py-2">Shipped</Badge>;
      case 'Delivered':
        return <Badge bg="success" className="badge-status-delivered text-uppercase px-3 py-2">Delivered</Badge>;
      case 'Cancelled':
        return <Badge bg="danger" className="badge-status-cancelled text-uppercase px-3 py-2">Cancelled</Badge>;
      case 'Returned':
        return <Badge bg="purple" className="badge-status-returned text-uppercase px-3 py-2">Returned</Badge>;
      default:
        return <Badge bg="secondary" className="text-uppercase px-3 py-2">{status}</Badge>;
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
    <Container className="my-3">
      <h2 className="fw-bold mb-4">Purchase History</h2>

      {orders.length === 0 ? (
        <Card className="border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: '16px' }}>
          <i className="bi bi-bag-x display-3 mb-3 text-primary"></i>
          <h5>No Orders Placed Yet</h5>
          <p className="mb-0">You haven't placed any orders on ShopEZ.</p>
          <Button href="/shop" className="btn-primary-gradient mt-3 mx-auto px-4 py-2 text-white text-decoration-none">
            Browse Products
          </Button>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <Card key={order._id} className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-light p-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                <Row className="gy-2 align-items-center text-center text-sm-start">
                  <Col sm={3}>
                    <div className="text-muted small text-uppercase">Order ID</div>
                    <span className="fw-semibold text-dark small">{order._id.toUpperCase()}</span>
                  </Col>
                  <Col sm={3}>
                    <div className="text-muted small text-uppercase">Date Placed</div>
                    <span className="fw-semibold text-dark small">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </Col>
                  <Col sm={2}>
                    <div className="text-muted small text-uppercase">Total Price</div>
                    <span className="fw-bold text-primary">${order.totalPrice.toFixed(2)}</span>
                  </Col>
                  <Col sm={2}>
                    <div className="text-muted small text-uppercase">Status</div>
                    <div>{getStatusBadge(order.orderStatus)}</div>
                  </Col>
                  <Col sm={2} className="text-sm-end">
                    <Button
                      onClick={() => handlePrintInvoice(order)}
                      variant="outline-secondary"
                      size="sm"
                      className="d-flex align-items-center gap-1 ms-auto"
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="bi bi-file-earmark-pdf"></i> Invoice
                    </Button>
                  </Col>
                </Row>
              </Card.Header>

              <Card.Body className="p-3">
                <div className="d-flex flex-column gap-3">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between pb-3 border-bottom last-border-0">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                        />
                        <div>
                          <h6 className="mb-0 fw-bold small">{item.name}</h6>
                          <small className="text-muted">Quantity: {item.quantity} x ${item.price}</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="fw-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  {/* Cancel Order option */}
                  {order.orderStatus === 'Pending' && (
                    <Button
                      onClick={() => handleCancelOrder(order._id)}
                      variant="outline-danger"
                      size="sm"
                      style={{ borderRadius: '8px' }}
                    >
                      Cancel Order
                    </Button>
                  )}

                  {/* Return Request option */}
                  {order.orderStatus === 'Delivered' && (
                    <Button
                      onClick={() => handleOpenReturnModal(order._id)}
                      variant="outline-primary"
                      size="sm"
                      style={{ borderRadius: '8px' }}
                    >
                      Request Return / Refund
                    </Button>
                  )}
                  
                  {order.orderStatus === 'Returned' && (
                    <Badge bg="secondary" className="px-3 py-2">Return Request Submitted</Badge>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Return Request Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Request Return / Refund</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReturnSubmit}>
          <Modal.Body>
            <p className="text-muted small">
              You are requesting a return for Order #{selectedOrderId?.toUpperCase()}. Please detail the reason for return (e.g. wrong size, product damaged, etc.). Once approved, a refund will be processed.
            </p>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted">Reason for Return</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Specify the reason in detail..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReturnModal(false)} style={{ borderRadius: '8px' }}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingReturn} className="btn-primary-gradient px-4">
              {submittingReturn ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default OrderHistory;
