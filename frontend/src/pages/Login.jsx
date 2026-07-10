import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldPlus } from 'lucide-react';
import './SOSApp.css'; // Reuse some layout styles

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
      navigate('/hospital');
    }, 800);
  };

  return (
    <div className="sos-container">
      <div className="sos-card glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <ShieldPlus size={48} color="var(--accent-blue)" style={{ margin: '0 auto' }} />
          <h2 style={{ justifyContent: 'center', marginTop: '10px' }}>Hospital Portal</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Hospital ID</label>
            <input type="text" defaultValue="CITY-GEN-01" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" defaultValue="password123" required />
          </div>
          
          <button type="submit" className="primary-btn">
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button className="nav-btn" onClick={() => navigate('/')}>Back to SOS App</button>
        </div>
      </div>
    </div>
  );
}
