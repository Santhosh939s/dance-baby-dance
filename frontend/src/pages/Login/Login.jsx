import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      // If user doesn't exist, try registering them
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await registerWithEmail(email, password, email.split('@')[0]);
          navigate('/dashboard');
          return;
        } catch (registerErr) {
          setError('Failed to log in or create account.');
        }
      } else {
        setError(err.message || 'Failed to log in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page animate-fade-in">
      <div className="login-container glass-panel">
        <h2 className="title login-title">Welcome Back</h2>
        <p className="subtitle login-subtitle">Login to save your dance progress</p>
        
        {error && <div className="error-message" style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

        <form className="login-form" onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="primary-btn submit-btn">
            {loading ? 'Logging in...' : 'Login / Register'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button type="button" disabled={loading} onClick={handleGoogleLogin} className="secondary-btn google-btn">
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
