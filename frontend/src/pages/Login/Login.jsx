import './Login.css';

const Login = () => {
  return (
    <div className="login-page animate-fade-in">
      <div className="login-container glass-panel">
        <h2 className="title login-title">Welcome Back</h2>
        <p className="subtitle login-subtitle">Login to save your dance progress</p>
        
        <form className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>
          
          <button type="button" className="primary-btn submit-btn">Login</button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button type="button" className="secondary-btn google-btn">
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
