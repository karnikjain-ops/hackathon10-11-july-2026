import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Hospital, Ambulance, HeartPulse, Terminal, AlertTriangle, ShieldCheck } from 'lucide-react';
import './SOSApp.css'; // Reusing styles

const API_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`}`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [logs, setLogs] = useState([
    "[SYSTEM] Admin Analytics Portal Initialized",
    "[DB] Connected to MongoDB Cluster",
    "[AI_TRIAGE] Readiness engine standby."
  ]);

  const fetchData = async () => {
    try {
      const [hRes, aRes, eRes] = await Promise.all([
        axios.get(`${API_URL}/hospitals`),
        axios.get(`${API_URL}/ambulances`),
        axios.get(`${API_URL}/emergencies`)
      ]);
      setHospitals(hRes.data);
      
      const newAmbs = aRes.data;
      const newEmergs = eRes.data;
      
      if (emergencies.length !== newEmergs.length && newEmergs.length > 0) {
        addLog(`[API] 201 Created: New Emergency SOS Received`);
        addLog(`[AI_TRIAGE] Routing emergency to nearest available hospital`);
      }
      
      setAmbulances(newAmbs);
      setEmergencies(newEmergs);
      
    } catch (err) {
      addLog(`[ERROR] Connection failed: ${err.message}`);
    }
  };

  const addLog = (msg) => {
    setLogs(prev => {
      const timestamp = new Date().toISOString().substring(11, 19);
      const newLogs = [...prev, `${timestamp} - ${msg}`];
      if (newLogs.length > 50) return newLogs.slice(-50);
      return newLogs;
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    
    // Connect to real WebSocket stream
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/logs');
    ws.onmessage = (event) => {
      addLog(event.data);
    };
    
    ws.onopen = () => addLog("[SYSTEM] Connected to Live Telemetry Stream");
    ws.onclose = () => addLog("[SYSTEM] Telemetry Stream Disconnected");

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  // Compute Metrics
  const totalPatients = emergencies.length;
  const helpNeeded = emergencies.filter(e => e.status !== 'RESOLVED' && e.status !== 'ARRIVED_AT_SCENE').length;
  const helpProvided = emergencies.filter(e => e.status === 'RESOLVED' || e.status === 'ARRIVED_AT_SCENE').length;
  
  const totalHospitals = hospitals.length;
  const totalAmbulances = ambulances.length;
  const activeAmbulances = ambulances.filter(a => a.status !== 'AVAILABLE').length;
  const availableAmbulances = ambulances.filter(a => a.status === 'AVAILABLE').length;

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', padding: '20px', fontFamily: 'monospace'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <ShieldCheck size={32} color="var(--accent-blue)" />
          <h1 style={{margin: 0, color: 'var(--accent-blue)', letterSpacing: '2px'}}>SYSTEM OPS PORTAL</h1>
        </div>
        <button className="nav-btn" onClick={() => navigate('/login')} style={{fontSize: '0.9rem'}}>Exit God Mode</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px'}}>
        
        <div className="glass-panel" style={{padding: '20px', borderLeft: '4px solid var(--accent-blue)'}}>
          <div style={{color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px'}}><Users size={18}/> TOTAL PATIENTS SERVICED</div>
          <div style={{fontSize: '3rem', fontWeight: 'bold'}}>{totalPatients}</div>
        </div>

        <div className="glass-panel" style={{padding: '20px', borderLeft: '4px solid var(--accent-red)'}}>
          <div style={{color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '10px'}}><AlertTriangle size={18}/> HELP NEEDED (ACTIVE)</div>
          <div style={{fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-red)'}}>{helpNeeded}</div>
        </div>

        <div className="glass-panel" style={{padding: '20px', borderLeft: '4px solid var(--accent-green)'}}>
          <div style={{color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '10px'}}><HeartPulse size={18}/> HELP PROVIDED (RESCUED)</div>
          <div style={{fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-green)'}}>{helpProvided}</div>
        </div>

      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div className="glass-panel" style={{padding: '20px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)'}}><Hospital size={20}/> Network Capacity</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '1.2rem'}}>Registered Hospitals:</span>
              <span style={{fontSize: '2rem', fontWeight: 'bold'}}>{totalHospitals}</span>
            </div>
          </div>

          <div className="glass-panel" style={{padding: '20px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)'}}><Ambulance size={20}/> Fleet Operations</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <span style={{fontSize: '1.1rem'}}>Total Units:</span>
              <span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{totalAmbulances}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', color: 'var(--accent-yellow)'}}>
              <span style={{fontSize: '1.1rem'}}>Active on Mission:</span>
              <span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{activeAmbulances}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent-green)'}}>
              <span style={{fontSize: '1.1rem'}}>Available / Standby:</span>
              <span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{availableAmbulances}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{padding: '20px', border: '1px solid var(--accent-red)', backgroundColor: '#000', display: 'flex', flexDirection: 'column', height: '400px'}}>
          <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-red)'}}><Terminal size={20}/> Live System Logs & Errors</h3>
          <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', fontSize: '0.85rem', color: '#0f0', fontFamily: 'Courier New, Courier, monospace'}}>
            {/* Show logs in reverse order so bottom is newest */}
            {logs.slice().reverse().map((log, i) => (
              <div key={i} style={{marginBottom: '5px', opacity: log.includes('ERROR') ? 1 : 0.8, color: log.includes('ERROR') ? '#ff4444' : log.includes('API') ? '#44ccff' : '#0f0'}}>
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
