import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Table, Button, Form, Modal, Spinner, Badge, InputGroup } from 'react-bootstrap';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Line, Doughnut } from 'react-chartjs-2';

// ChartJS registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // 1. Overview/Analytics Stats
  const [stats, setStats] = useState(null);

  // 2. Products State
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    description: '',
    images: [''],
    features: ['']
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // 3. Categories State
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  });

  // 4. Orders & Returns State
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);

  // 5. Users State
  const [users, setUsers] = useState([]);

  // Load dashboard data based on active tab
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const { data } = await api.get('/api/admin/dashboard');
        setStats(data);
      } else if (activeTab === 'products') {
        const prodRes = await api.get('/api/products?pageSize=100');
        const catRes = await api.get('/api/categories');
        setProducts(prodRes.data.products);
        setCategories(catRes.data);
      } else if (activeTab === 'categories') {
        const { data } = await api.get('/api/categories');
        setCategories(data);
      } else if (activeTab === 'orders') {
        const orderRes = await api.get('/api/orders');
        const returnRes = await api.get('/api/returns');
        setOrders(orderRes.data);
        setReturns(returnRes.data);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/api/users');
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [activeTab, user]);

  // Image upload handler
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      setUploadingImage(true);
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProductForm(prev => ({
        ...prev,
        images: data.urls // Sets array of URLs
      }));
      toast.success('Images uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload images.');
    } finally {
      setUploadingImage(false);
    }
  };

  // --- PRODUCT CRUD ---
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name,
        price: prod.price,
        discountPrice: prod.discountPrice || '',
        stock: prod.stock,
        category: prod.category?._id || prod.category || '',
        description: prod.description,
        images: prod.images || [''],
        features: prod.features && prod.features.length > 0 ? prod.features : ['']
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        discountPrice: '',
        stock: '',
        category: categories[0]?._id || '',
        description: '',
        images: [''],
        features: ['']
      });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stock) {
      return toast.error('Please fill name, price, and stock fields.');
    }

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : 0,
        stock: Number(productForm.stock),
        features: productForm.features.filter(f => f.trim() !== '')
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/api/products', payload);
        toast.success('Product created successfully!');
      }
      setShowProductModal(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product and all associated reviews?')) {
      try {
        await api.delete(`/api/products/${id}`);
        toast.success('Product removed successfully.');
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to remove product.');
      }
    }
  };

  // --- CATEGORY CRUD ---
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        description: cat.description || '',
        image: cat.image || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', image: '' });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return toast.error('Category name is required.');

    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory._id}`, categoryForm);
        toast.success('Category updated!');
      } else {
        await api.post('/api/categories', categoryForm);
        toast.success('Category created!');
      }
      setShowCategoryModal(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category? Products linked to it will remain but lose categorization.')) {
      try {
        await api.delete(`/api/categories/${id}`);
        toast.success('Category deleted.');
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to delete category.');
      }
    }
  };

  // --- ORDER & RETURN ACTIONS ---
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to: ${status}`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleUpdateReturnRequest = async (returnId, status) => {
    try {
      await api.put(`/api/returns/${returnId}`, { status });
      toast.success(`Return request status updated to: ${status}`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update return request status.');
    }
  };

  // --- USER ACTIONS ---
  const handleToggleUserRole = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (window.confirm(`Change role of ${u.name} to ${newRole}?`)) {
      try {
        await api.put(`/api/users/${u._id}/role`, { role: newRole });
        toast.success('User role updated!');
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to update user role.');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to remove this user account?')) {
      try {
        await api.delete(`/api/users/${id}`);
        toast.success('User removed.');
        fetchDashboardData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to remove user.');
      }
    }
  };

  // Chart configs
  const getSalesChartData = () => {
    if (!stats || !stats.monthlySales) return { labels: [], datasets: [] };
    
    // Sort chronological: Aggregated monthly stats
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = stats.monthlySales.map(m => `${months[m._id.month - 1]} ${m._id.year}`);
    const data = stats.monthlySales.map(m => m.sales);

    return {
      labels,
      datasets: [
        {
          label: 'Monthly Sales ($)',
          data,
          fill: false,
          borderColor: '#4f46e5',
          tension: 0.2,
          pointBackgroundColor: '#7c3aed'
        }
      ]
    };
  };

  const getCategoryChartData = () => {
    if (!stats || !stats.categorySales) return { labels: [], datasets: [] };

    const labels = stats.categorySales.map(c => c._id);
    const data = stats.categorySales.map(c => c.sales);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#4f46e5', '#7c3aed', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'],
          borderWidth: 1
        }
      ]
    };
  };

  if (user?.role !== 'ADMIN') {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger">Access Denied. Admin permissions required.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-3">
      <h2 className="fw-bold mb-4"><i className="bi bi-speedometer2 text-primary me-2"></i>Admin Dashboard</h2>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* OVERVIEW PANEL */}
        <Tab eventKey="overview" title="Overview">
          {activeTab === 'overview' && loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : stats ? (
            <>
              {/* Aggregated totals */}
              <Row className="g-4 mb-4">
                <Col md={3}>
                  <Card className="border-0 shadow-sm p-3 text-center h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #4f46e5' }}>
                    <div className="text-muted small text-uppercase fw-semibold">Total Revenue</div>
                    <h3 className="fw-bold text-primary mt-2">${stats.summary.totalSales.toFixed(2)}</h3>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 shadow-sm p-3 text-center h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                    <div className="text-muted small text-uppercase fw-semibold">Total Orders</div>
                    <h3 className="fw-bold text-success mt-2">{stats.summary.totalOrders}</h3>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 shadow-sm p-3 text-center h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                    <div className="text-muted small text-uppercase fw-semibold">Active Catalog</div>
                    <h3 className="fw-bold text-warning mt-2">{stats.summary.totalProducts} Items</h3>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 shadow-sm p-3 text-center h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #f43f5e' }}>
                    <div className="text-muted small text-uppercase fw-semibold">Out Of Stock</div>
                    <h3 className="fw-bold text-danger mt-2">{stats.summary.outOfStockCount} Items</h3>
                  </Card>
                </Col>
              </Row>

              {/* Analytical Charts */}
              <Row className="g-4 mb-5">
                <Col lg={7}>
                  <Card className="border-0 shadow-sm p-3 h-100" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold mb-3">Revenue Aggregates</h5>
                    <Line data={getSalesChartData()} options={{ responsive: true, maintainAspectRatio: true }} />
                  </Card>
                </Col>
                <Col lg={5}>
                  <Card className="border-0 shadow-sm p-3 h-100" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bold mb-3">Sales Share by Category</h5>
                    {stats.categorySales && stats.categorySales.length > 0 ? (
                      <div className="mx-auto" style={{ maxWidth: '250px' }}>
                        <Doughnut data={getCategoryChartData()} />
                      </div>
                    ) : (
                      <Alert variant="info" className="my-auto text-center">No sales records available yet.</Alert>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Recent Orders table snippet */}
              <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '16px' }}>
                <h5 className="fw-bold mb-3">Recent Sales</h5>
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((ord) => (
                      <tr key={ord._id}>
                        <td className="small">{ord._id.toUpperCase()}</td>
                        <td>{ord.user?.name || 'Guest User'}</td>
                        <td className="fw-bold text-primary">${ord.totalPrice}</td>
                        <td>{ord.isPaid ? <Badge bg="success">YES</Badge> : <Badge bg="danger">NO</Badge>}</td>
                        <td>{ord.orderStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </>
          ) : null}
        </Tab>

        {/* PRODUCTS MANAGEMENT */}
        <Tab eventKey="products" title="Products">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">Manage Products ({products.length})</h5>
            <Button onClick={() => handleOpenProductModal(null)} className="btn-primary-gradient py-2 px-3">
              <i className="bi bi-plus-lg me-1"></i> Add Product
            </Button>
          </div>

          {activeTab === 'products' && loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Table responsive hover className="align-middle bg-white shadow-sm rounded-3 overflow-hidden">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={p.images?.[0]} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        <span className="fw-semibold small">{p.name}</span>
                      </div>
                    </td>
                    <td>{p.category?.name || 'None'}</td>
                    <td className="fw-bold">${p.price}</td>
                    <td>
                      {p.stock === 0 ? (
                        <Badge bg="danger">Out of Stock</Badge>
                      ) : (
                        <span>{p.stock} units</span>
                      )}
                    </td>
                    <td>{p.rating} ★ ({p.numReviews})</td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" onClick={() => handleOpenProductModal(p)} className="me-2 rounded-2">
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteProduct(p._id)} className="rounded-2">
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* CATEGORIES MANAGEMENT */}
        <Tab eventKey="categories" title="Categories">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">Manage Categories ({categories.length})</h5>
            <Button onClick={() => handleOpenCategoryModal(null)} className="btn-primary-gradient py-2 px-3">
              <i className="bi bi-plus-lg me-1"></i> Add Category
            </Button>
          </div>

          {activeTab === 'categories' && loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Table responsive hover className="align-middle bg-white shadow-sm rounded-3 overflow-hidden">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td><img src={c.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} /></td>
                    <td className="fw-semibold">{c.name}</td>
                    <td><code>{c.slug}</code></td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: '300px' }}>{c.description}</td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" onClick={() => handleOpenCategoryModal(c)} className="me-2">
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCategory(c._id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* ORDERS & RETURNS */}
        <Tab eventKey="orders" title="Orders & Returns">
          {activeTab === 'orders' && loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <>
              {/* Active Orders List */}
              <h5 className="fw-bold mb-3 mt-2">Customer Orders ({orders.length})</h5>
              <Table responsive hover className="align-middle bg-white shadow-sm rounded-3 overflow-hidden mb-5">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total Price</th>
                    <th>Method</th>
                    <th>Paid Status</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td className="small">{ord._id.toUpperCase()}</td>
                      <td>{ord.user?.name || 'Guest'}</td>
                      <td className="fw-bold">${ord.totalPrice}</td>
                      <td>{ord.paymentMethod}</td>
                      <td>
                        {ord.isPaid ? (
                          <Badge bg="success">PAID</Badge>
                        ) : (
                          <Badge bg="danger">UNPAID</Badge>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-status-${ord.orderStatus.toLowerCase()}`}>{ord.orderStatus}</span>
                      </td>
                      <td>
                        {/* Status Change Dropdown */}
                        {ord.orderStatus !== 'Cancelled' && ord.orderStatus !== 'Returned' && (
                          <Form.Select
                            size="sm"
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            style={{ width: '130px', borderRadius: '8px' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </Form.Select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Returns Requests List */}
              <h5 className="fw-bold mb-3">Return Requests ({returns.length})</h5>
              {returns.length === 0 ? (
                <Alert variant="info">No return requests submitted.</Alert>
              ) : (
                <Table responsive hover className="align-middle bg-white shadow-sm rounded-3 overflow-hidden">
                  <thead>
                    <tr>
                      <th>Return ID</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Refund Amount</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((ret) => (
                      <tr key={ret._id}>
                        <td className="small">{ret._id.toUpperCase()}</td>
                        <td className="small">{ret.order?._id.toUpperCase()}</td>
                        <td>{ret.user?.name || 'User'}</td>
                        <td className="fw-bold text-danger">${ret.refundAmount}</td>
                        <td className="small text-muted">{ret.reason}</td>
                        <td>
                          <Badge bg={ret.status === 'Refunded' ? 'success' : ret.status === 'Approved' ? 'primary' : 'warning'}>
                            {ret.status}
                          </Badge>
                        </td>
                        <td>
                          {ret.status === 'Pending' && (
                            <div className="d-flex gap-2">
                              <Button variant="success" size="sm" onClick={() => handleUpdateReturnRequest(ret._id, 'Approved')}>
                                Approve
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleUpdateReturnRequest(ret._id, 'Rejected')}>
                                Reject
                              </Button>
                            </div>
                          )}
                          {ret.status === 'Approved' && (
                            <Button variant="primary" size="sm" onClick={() => handleUpdateReturnRequest(ret._id, 'Refunded')}>
                              Trigger Refund
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Tab>

        {/* USERS MANAGEMENT */}
        <Tab eventKey="users" title="Users">
          {activeTab === 'users' && loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Table responsive hover className="align-middle bg-white shadow-sm rounded-3 overflow-hidden">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="small">{u._id.toUpperCase()}</td>
                    <td className="fw-semibold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <Badge bg={u.role === 'ADMIN' ? 'danger' : 'secondary'}>{u.role}</Badge>
                    </td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" onClick={() => handleToggleUserRole(u)} className="me-2" disabled={u.email === user.email}>
                        Toggle Admin
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(u._id)} disabled={u.email === user.email}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>

      {/* PRODUCT ADD/EDIT MODAL */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleProductSubmit}>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Label className="small text-muted fw-semibold">Product Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Wireless Mouse"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </Col>
              <Col sm={6}>
                <Form.Label className="small text-muted fw-semibold">Category *</Form.Label>
                <Form.Select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  required
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col sm={4}>
                <Form.Label className="small text-muted fw-semibold">Base Price ($) *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g. 49"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </Col>
              <Col sm={4}>
                <Form.Label className="small text-muted fw-semibold">Discount Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g. 39 (optional)"
                  value={productForm.discountPrice}
                  onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                />
              </Col>
              <Col sm={4}>
                <Form.Label className="small text-muted fw-semibold">Stock Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g. 20"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  required
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small text-muted fw-semibold">Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Product description details..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                required
              />
            </Form.Group>

            {/* Image Upload Input */}
            <Form.Group className="mb-3">
              <Form.Label className="small text-muted fw-semibold">Product Image Upload</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImage}
                accept="image/*"
              />
              {uploadingImage && <small className="text-primary d-block mt-1">Uploading image files...</small>}
              {productForm.images && productForm.images[0] && (
                <div className="d-flex gap-2 mt-2">
                  {productForm.images.map((imgUrl, idx) => (
                    <img key={idx} src={imgUrl} alt="uploaded-preview" style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid #ccc', borderRadius: '4px' }} />
                  ))}
                </div>
              )}
            </Form.Group>

            {/* Spec Highlights / Features */}
            <Form.Group className="mb-2">
              <Form.Label className="small text-muted fw-semibold">Highlights / Features (One per line)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="e.g. Bluetooth 5.0&#10;30 hours battery&#10;Water resistant"
                value={productForm.features.join('\n')}
                onChange={(e) => setProductForm({ ...productForm, features: e.target.value.split('\n') })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancel</Button>
            <Button type="submit" className="btn-primary-gradient px-4">Save Product</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* CATEGORY ADD/EDIT MODAL */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCategorySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small text-muted fw-semibold">Category Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Toys"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small text-muted fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Category summary..."
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small text-muted fw-semibold">Image URL (Unsplash or local)</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={categoryForm.image}
                onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
            <Button type="submit" className="btn-primary-gradient px-4">Save Category</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
