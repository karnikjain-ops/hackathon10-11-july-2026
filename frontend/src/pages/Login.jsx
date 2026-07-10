import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldPlus, Hospital, MapPin, Ambulance } from 'lucide-react';
import './SOSApp.css';

export default function Login() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  
  const [loginType, setLoginType] = useState('HOSPITAL'); // HOSPITAL or AMBULANCE
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedAmbulance, setSelectedAmbulance] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration state
  const [regData, setRegData] = useState({
    name: '',
    lat: '',
    lng: '',
    total_icu_beds: 10
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hRes, aRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/hospitals`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/ambulances`)
        ]);
        setHospitals(hRes.data);
        if (hRes.data.length > 0) setSelectedHospital(hRes.data[0]._id);
        
        setAmbulances(aRes.data);
        if (aRes.data.length > 0) setSelectedAmbulance(aRes.data[0]._id);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (loginType === 'HOSPITAL') {
        if (!selectedHospital) return alert("Select a hospital");
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/login`, {
          role: 'HOSPITAL',
          id: selectedHospital,
          password: password
        });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('loggedInHospital', JSON.stringify(res.data.hospital));
        setTimeout(() => navigate('/hospital'), 500);
      } else {
        if (!selectedAmbulance) return alert("Select an ambulance");
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/login`, {
          role: 'AMBULANCE',
          id: selectedAmbulance,
          password: password
        });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('loggedInAmbulance', JSON.stringify(res.data.ambulance));
        setTimeout(() => navigate('/ambulance'), 500);
      }
    } catch (err) {
      console.error(err);
      alert("Invalid credentials. Try 'password123'");
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: regData.name,
        location: { lat: parseFloat(regData.lat), lng: parseFloat(regData.lng) },
        total_icu_beds: parseInt(regData.total_icu_beds),
        available_icu_beds: parseInt(regData.total_icu_beds),
        specialties: ["General"]
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/hospitals`, payload);
      localStorage.setItem('loggedInHospital', JSON.stringify(res.data));
      navigate('/hospital');
    } catch (err) {
      console.error(err);
      alert("Failed to register hospital");
      setLoading(false);
    }
  };

  return (
    <div className="sos-container">
      <div className="sos-card glass-panel" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <ShieldPlus size={48} color="var(--accent-blue)" style={{ margin: '0 auto' }} />
          <h2 style={{ justifyContent: 'center', marginTop: '10px' }}>Responder Portal</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Authorized Personnel Only</p>
        </div>
        
        {!isRegistering && (
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <button 
              style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: loginType === 'HOSPITAL' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'}}
              onClick={() => setLoginType('HOSPITAL')}
            >
              <Hospital size={16}/> Hospital
            </button>
            <button 
              style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: loginType === 'AMBULANCE' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', color: loginType === 'AMBULANCE' ? 'black' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'}}
              onClick={() => setLoginType('AMBULANCE')}
            >
              <Ambulance size={16}/> Ambulance
            </button>
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loginType === 'HOSPITAL' ? (
              <div className="form-group">
                <label>Select Hospital Facility</label>
                <select 
                  value={selectedHospital} 
                  onChange={e => setSelectedHospital(e.target.value)}
                  style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {hospitals.map(h => (
                    <option key={h._id} value={h._id} style={{color: 'black'}}>{h.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Select Ambulance Unit</label>
                <select 
                  value={selectedAmbulance} 
                  onChange={e => setSelectedAmbulance(e.target.value)}
                  style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {ambulances.map(a => (
                    <option key={a._id} value={a._id} style={{color: 'black'}}>Unit #{a._id.slice(-4)} ({a.status})</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter password (default: password123)" 
              />
            </div>
            
            <button type="submit" className="primary-btn">
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
            
            {loginType === 'HOSPITAL' && (
              <div style={{textAlign: 'center', fontSize: '0.9rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Not in network? </span>
                <a href="#" onClick={(e) => {e.preventDefault(); setIsRegistering(true);}} style={{color: 'var(--accent-blue)', textDecoration: 'none'}}>Register Hospital</a>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label>Hospital Name</label>
              <input type="text" required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} placeholder="e.g. Apollo Hospital" />
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Latitude</label>
                <input type="number" step="any" required value={regData.lat} onChange={e => setRegData({...regData, lat: e.target.value})} placeholder="28.61" />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Longitude</label>
                <input type="number" step="any" required value={regData.lng} onChange={e => setRegData({...regData, lng: e.target.value})} placeholder="77.20" />
              </div>
            </div>
            <div className="form-group">
              <label>Total ICU Beds</label>
              <input type="number" required value={regData.total_icu_beds} onChange={e => setRegData({...regData, total_icu_beds: e.target.value})} />
            </div>
            
            <button type="submit" className="primary-btn">
              {loading ? 'Registering...' : 'Register & Join Network'}
            </button>
            <div style={{textAlign: 'center', fontSize: '0.9rem'}}>
              <a href="#" onClick={(e) => {e.preventDefault(); setIsRegistering(false);}} style={{color: 'var(--accent-blue)', textDecoration: 'none'}}>Back to Login</a>
            </div>
          </form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button className="nav-btn" onClick={() => navigate('/')}>Back to SOS App</button>
          <button className="nav-btn" onClick={() => navigate('/admin')} style={{color: 'var(--accent-red)', borderColor: 'var(--accent-red)'}}>Dev / Admin Portal</button>
        </div>
      </div>
    </div>
  );
}
