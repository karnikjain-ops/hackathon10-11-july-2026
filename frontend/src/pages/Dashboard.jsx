import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import EmergencyList from '../components/EmergencyList';
import ReadinessPanel from '../components/ReadinessPanel';
import './SOSApp.css'; // Reusing styles

const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [loggedInHospital, setLoggedInHospital] = useState(null);
  const [pendingEmergency, setPendingEmergency] = useState(null);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('loggedInHospital');
    if (saved) {
      setLoggedInHospital(JSON.parse(saved));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [hospitalsRes, ambulancesRes, emergenciesRes] = await Promise.all([
        axios.get(`${API_URL}/hospitals`),
        axios.get(`${API_URL}/ambulances`),
        axios.get(`${API_URL}/emergencies`)
      ]);
      
      setHospitals(hospitalsRes.data);
      setAmbulances(ambulancesRes.data);
      
      const allEmergencies = emergenciesRes.data;
      setEmergencies(allEmergencies);
      
      // Update selected
      if (selectedEmergency) {
        const updated = allEmergencies.find(e => e._id === selectedEmergency._id);
        if (updated) setSelectedEmergency(updated);
      }

      // Check for incoming auto-assigned emergency
      if (loggedInHospital) {
        const incoming = allEmergencies.find(e => 
          e.pending_hospital_id === loggedInHospital._id && 
          e.status === 'PENDING_HOSPITAL_ACCEPTANCE'
        );
        setPendingEmergency(incoming || null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (loggedInHospital) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [loggedInHospital]);

  const handleResponse = async (action) => {
    setIsResponding(true);
    try {
      await axios.put(`${API_URL}/emergencies/${pendingEmergency._id}/hospital-response`, {
        action: action,
        hospital_id: loggedInHospital._id
      });
      setPendingEmergency(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to respond to emergency");
    } finally {
      setIsResponding(false);
    }
  };

  if (!loggedInHospital) return <div>Loading...</div>;

  return (
    <div className="dashboard-layout">
      {pendingEmergency && (
        <div className="modal-overlay">
          <div className="sos-card glass-panel" style={{border: '2px solid var(--accent-red)', animation: 'pulse-border 1.5s infinite'}}>
            <h2 style={{color: 'var(--accent-red)'}}><AlertTriangle size={32}/> INCOMING EMERGENCY</h2>
            <p style={{fontSize: '1.2rem', margin: '10px 0'}}><strong>Patient:</strong> {pendingEmergency.patient_name}</p>
            <p><strong>Priority:</strong> {pendingEmergency.priority}</p>
            <p><strong>Symptoms:</strong> {pendingEmergency.symptoms}</p>
            
            <div style={{display: 'flex', gap: '15px', marginTop: '30px'}}>
              <button 
                className="primary-btn" 
                style={{flex: 1, backgroundColor: 'var(--accent-green)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}
                onClick={() => handleResponse('ACCEPT')}
                disabled={isResponding}
              >
                <Check size={20}/> ACCEPT & DISPATCH
              </button>
              <button 
                className="primary-btn" 
                style={{flex: 1, backgroundColor: 'var(--accent-red)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}
                onClick={() => handleResponse('DENY')}
                disabled={isResponding}
              >
                <X size={20}/> DENY (TOO BUSY)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar">
        <EmergencyList 
          emergencies={emergencies} 
          onSelectEmergency={setSelectedEmergency}
          selectedEmergencyId={selectedEmergency?._id}
        />
      </div>
      <MapComponent 
        hospitals={hospitals} 
        ambulances={ambulances} 
        emergencies={emergencies}
        selectedEmergencyId={selectedEmergency?._id}
      />
      
      {selectedEmergency && (
        <ReadinessPanel 
          emergency={selectedEmergency} 
          hospital={loggedInHospital}
          onDispatchComplete={fetchData}
        />
      )}
    </div>
  );
}
