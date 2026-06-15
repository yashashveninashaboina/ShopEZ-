import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const {
    user,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  } = useContext(AuthContext);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setUpdatingProfile(true);
      const result = await updateProfile({
        name,
        email,
        phone,
        password: password || undefined
      });
      setUpdatingProfile(false);

      if (result.success) {
        toast.success('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddressInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAddressForm({ ...addressForm, [e.target.name]: value });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    
    let result;
    if (isEditMode) {
      result = await updateAddress(editingAddressId, addressForm);
    } else {
      result = await addAddress(addressForm);
    }
    
    setSavingAddress(false);
    
    if (result.success) {
      toast.success(isEditMode ? 'Address updated!' : 'Address added!');
      handleCancelAddressForm();
    } else {
      toast.error(result.error);
    }
  };

  const handleEditAddress = (addr) => {
    setIsEditMode(true);
    setEditingAddressId(addr._id);
    setAddressForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault
    });
    setShowAddressForm(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Delete this address?')) {
      const result = await deleteAddress(id);
      if (result.success) {
        toast.info('Address removed.');
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleSetDefault = async (id) => {
    const result = await setDefaultAddress(id);
    if (result.success) {
      toast.success('Default address updated.');
    } else {
      toast.error(result.error);
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setIsEditMode(false);
    setEditingAddressId(null);
    setAddressForm({ street: '', city: '', state: '', zip: '', country: 'USA', isDefault: false });
  };

  return (
    <Container className="my-3">
      <Row className="gy-4">
        {/* Profile Details Card */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm p-4 animate-fade-in-up" style={{ borderRadius: '16px' }}>
            <h4 className="fw-bold mb-4">User Account Profile</h4>
            
            <Form onSubmit={handleProfileSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small text-muted fw-semibold">Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small text-muted fw-semibold">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small text-muted fw-semibold">Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Your Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Form.Group>

              <hr className="my-3" />
              <div className="fw-bold text-dark small mb-3">Change Password (leave empty to keep current)</div>

              <Form.Group className="mb-3">
                <Form.Label className="small text-muted fw-semibold">New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small text-muted fw-semibold">Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>

              <Button type="submit" disabled={updatingProfile} className="btn-primary-gradient w-100 py-2">
                {updatingProfile ? 'Updating Profile...' : 'Save Profile Changes'}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Address Management Card */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm p-4 animate-fade-in-up" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Shipping Addresses</h4>
              {!showAddressForm && (
                <Button variant="outline-primary" size="sm" onClick={() => setShowAddressForm(true)} style={{ borderRadius: '8px' }}>
                  <i className="bi bi-plus-lg me-1"></i> Add New
                </Button>
              )}
            </div>

            {/* List of current user addresses */}
            {user?.addresses && user.addresses.length > 0 ? (
              <ListGroup className="gap-3 mb-4">
                {user.addresses.map((addr) => (
                  <ListGroup.Item
                    key={addr._id}
                    className="border p-3 d-flex flex-column gap-2"
                    style={{ borderRadius: '12px', borderLeft: addr.isDefault ? '4px solid #4f46e5 !important' : '1px solid #e2e8f0' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        {addr.isDefault && <Badge bg="primary" className="mb-2">Default Address</Badge>}
                        <div className="text-dark fw-bold small">{user.name}</div>
                        <div className="text-muted small mt-1">
                          {addr.street}, {addr.city}, {addr.state} - {addr.zip}, {addr.country}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={() => handleEditAddress(addr)} style={{ borderRadius: '6px' }}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAddress(addr._id)} style={{ borderRadius: '6px' }}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                    {!addr.isDefault && (
                      <Button variant="link" onClick={() => handleSetDefault(addr._id)} className="p-0 text-decoration-none small text-primary text-start" style={{ fontSize: '0.8rem' }}>
                        Set as default address
                      </Button>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="info" className="mb-4">No shipping addresses configured yet.</Alert>
            )}

            {/* Address Edit/Add Form */}
            {showAddressForm && (
              <Card className="p-3 border-0 bg-light" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold mb-3">{isEditMode ? 'Edit Shipping Address' : 'Add New Shipping Address'}</h5>
                <Form onSubmit={handleAddressSubmit}>
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
                      <Form.Label className="small text-muted fw-semibold">State</Form.Label>
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
                  <Row className="g-3 mb-3">
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
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="isDefault"
                      label="Set as default shipping address"
                      checked={addressForm.isDefault}
                      onChange={handleAddressInputChange}
                      id="defaultAddressCheckbox"
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button type="submit" disabled={savingAddress} className="btn-primary-gradient px-4 py-2">
                      {savingAddress ? 'Saving Address...' : 'Save Address'}
                    </Button>
                    <Button variant="outline-secondary" onClick={handleCancelAddressForm} className="px-4 py-2" style={{ borderRadius: '10px' }}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
