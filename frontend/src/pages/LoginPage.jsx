import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const getAuthErrorMessage = (err) => {
  if (err.code === 'ECONNABORTED') {
    return 'Login is taking too long. Please try again in a moment.';
  }
  if (!err.response) {
    return 'Cannot reach the server right now. Please check your connection and try again.';
  }
  return err.response.data?.message || 'Invalid email or password';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name}!`);
      
      // Navigate based on role
      switch (user.role) {
        case 'ADMIN':
        case 'COORDINATOR':
          navigate('/admin/dashboard');
          break;
        case 'VOLUNTEER':
          navigate('/volunteer/portal');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card-static"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '48px 40px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Logo />
          </Link>
          <p style={{ color: 'var(--neutral-400)', fontSize: '0.92rem', marginTop: '8px' }}>
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'var(--danger-50)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              color: 'var(--danger-600)',
              fontSize: '0.88rem',
            }}
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--neutral-400)',
              }} />
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
                id="login-email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--neutral-400)',
              }} />
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
                id="login-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            id="login-submit"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? (
              <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'var(--neutral-500)',
          fontSize: '0.9rem',
        }}>
          Don&apos;t have an account? Register as{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
            Volunteer
          </Link>
          {' or '}
          <Link to="/admin/register" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
            Admin
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
