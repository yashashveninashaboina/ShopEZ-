import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Simulation assist
  const [resetToken, setResetToken] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    try {
      setLoading(true);
      setResetToken('');
      setResetUrl('');
      
      const { data } = await api.post('/api/users/forgot-password', { email });
      setLoading(false);
      toast.success('Reset link generated!');
      
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setResetUrl(`/reset-password/${data.resetToken}`);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Email not found.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <Card className="border-0 shadow-sm p-4 w-100 animate-fade-in-up" style={{ maxWidth: '420px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-envelope-open text-primary display-4 mb-2 d-inline-block"></i>
          <h3 className="fw-bold">Forgot Password</h3>
          <p className="text-muted small">Enter your email to receive a password reset token</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="small text-muted fw-semibold">Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Button type="submit" disabled={loading} className="btn-primary-gradient w-100 py-3 fw-bold mb-3" style={{ borderRadius: '10px' }}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Request Reset Link'}
          </Button>
        </Form>

        {resetToken && (
          <Alert variant="warning" className="mt-3">
            <h6 className="fw-bold"><i className="bi bi-info-circle-fill"></i> Local Testing Assist</h6>
            <p className="small mb-2">Since email SMTP is not configured, the reset token was captured directly:</p>
            <Link to={resetUrl} className="btn btn-warning btn-sm w-100 fw-bold">
              Click Here to Reset Password
            </Link>
          </Alert>
        )}

        <div className="text-center mt-3 small">
          <Link to="/login" className="text-decoration-none">
            <i className="bi bi-arrow-left"></i> Back to Login
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
