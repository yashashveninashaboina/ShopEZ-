import React, { useState, useContext, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return toast.error('Please fill in all required fields');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setSubmitting(true);
      const result = await register(name, email, password, phone);
      setSubmitting(false);

      if (result.success) {
        toast.success('Account created successfully!');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('An error occurred during registration');
      setSubmitting(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="border-0 shadow-sm p-4 w-100 animate-fade-in-up" style={{ maxWidth: '440px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-person-plus-fill text-primary display-4 mb-2 d-inline-block"></i>
          <h3 className="fw-bold">Create Account</h3>
          <p className="text-muted small">Register to start shopping on ShopEZ</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small text-muted fw-semibold">Full Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small text-muted fw-semibold">Email Address *</Form.Label>
            <Form.Control
              type="email"
              placeholder="e.g. customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small text-muted fw-semibold">Phone Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. 9988776655"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small text-muted fw-semibold">Password *</Form.Label>
            <Form.Control
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small text-muted fw-semibold">Confirm Password *</Form.Label>
            <Form.Control
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Button type="submit" disabled={submitting} className="btn-primary-gradient w-100 py-3 fw-bold mb-3" style={{ borderRadius: '10px' }}>
            {submitting ? <Spinner size="sm" animation="border" /> : 'Register Account'}
          </Button>
        </Form>

        <div className="text-center mt-2 small text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-decoration-none fw-bold">
            Sign In
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default Register;
