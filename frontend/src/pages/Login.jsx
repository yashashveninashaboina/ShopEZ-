import React, { useState, useContext, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect
  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter all fields');

    try {
      setSubmitting(true);
      const result = await login(email, password);
      setSubmitting(false);

      if (result.success) {
        toast.success('Logged in successfully!');
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('An error occurred during login');
      setSubmitting(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <Card className="border-0 shadow-sm p-4 w-100 animate-fade-in-up" style={{ maxWidth: '420px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-shield-lock-fill text-primary display-4 mb-2 d-inline-block"></i>
          <h3 className="fw-bold">Sign In</h3>
          <p className="text-muted small">Access your ShopEZ shopping account</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small text-muted fw-semibold">Email Address</Form.Label>
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
            <Form.Label className="small text-muted fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <div className="d-flex justify-content-end mb-4">
            <Link to="/forgot-password" style={{ fontSize: '0.85rem' }} className="text-decoration-none">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" disabled={submitting} className="btn-primary-gradient w-100 py-3 fw-bold mb-3" style={{ borderRadius: '10px' }}>
            {submitting ? <Spinner size="sm" animation="border" /> : 'Login'}
          </Button>
        </Form>

        <div className="text-center mt-2 small text-muted">
          New to ShopEZ?{' '}
          <Link to="/register" className="text-decoration-none fw-bold">
            Create Account
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
