import React, { useState } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error('Please fill in all fields');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    try {
      setSubmitting(true);
      await api.post(`/api/users/reset-password/${token}`, { password });
      setSubmitting(false);
      
      toast.success('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      setSubmitting(false);
      toast.error(error.response?.data?.message || 'Invalid or expired token.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <Card className="border-0 shadow-sm p-4 w-100 animate-fade-in-up" style={{ maxWidth: '420px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-shield-check text-primary display-4 mb-2 d-inline-block"></i>
          <h3 className="fw-bold">Reset Password</h3>
          <p className="text-muted small">Enter your new secure password details</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small text-muted fw-semibold">New Password</Form.Label>
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
            <Form.Label className="small text-muted fw-semibold">Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <Button type="submit" disabled={submitting} className="btn-primary-gradient w-100 py-3 fw-bold" style={{ borderRadius: '10px' }}>
            {submitting ? <Spinner size="sm" animation="border" /> : 'Confirm New Password'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ResetPassword;
