import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Ambulance as AmbulanceIcon, MapPin, Clock, CheckCircle2, User, Activity } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import './SOSApp.css';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`;

export default function AmbulanceDashboard() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loggedInAmbulance, setLoggedInAmbulance] = useState(null);
  const [activeMission, setActiveMission] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('loggedInAmbulance');
    if (saved) {
      setLoggedInAmbulance(JSON.parse(saved));
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
      setEmergencies(emergenciesRes.data);

      if (loggedInAmbulance) {
        // Update logged in ambulance state to get latest coordinates
        const me = ambulancesRes.data.find(a => a._id === loggedInAmbulance._id);
        if (me) setLoggedInAmbulance(me);

        // Find active mission
        const mission = emergenciesRes.data.find(e => 
          e.assigned_ambulance_id === loggedInAmbulance._id && 
          e.status === 'EN_ROUTE_TO_HOSPITAL'
        );
        
        if (mission) {
          if (!activeMission || activeMission._id !== mission._id) {
            setActiveMission(mission);
            setEta(mission.eta);
          }
        } else {
          setActiveMission(null);
          setEta(null);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (loggedInAmbulance) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      
      // Start Real GPS Tracking
      let watchId;
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Push real physical coordinates to the backend
              await axios.put(`${API_URL}/ambulances/${loggedInAmbulance._id}/location`, {
                lat: latitude,
                lng: longitude
              });
            } catch (err) {
              console.error("Failed to push GPS", err);
            }
          },
          (err) => console.error("GPS Error:", err),
          { enableHighAccuracy: true, maximumAge: 0 }
        );
      }

      return () => {
        clearInterval(interval);
        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [loggedInAmbulance]);

  useEffect(() => {
    if (eta !== null && eta > 0) {
      const timer = setInterval(() => setEta(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [eta]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!loggedInAmbulance) return <div>Loading...</div>;

  return (
    <div className="dashboard-layout" style={{flexDirection: 'column'}}>
      <div style={{height: '60vh', width: '100%', position: 'relative'}}>
        <MapComponent 
          hospitals={hospitals} 
          ambulances={ambulances} 
          emergencies={emergencies}
          selectedEmergencyId={activeMission?._id}
        />
        <div style={{position: 'absolute', top: 20, left: 20, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--accent-gold)'}}>
          <h3 style={{margin: 0, color: 'var(--accent-gold)'}}>
            <AmbulanceIcon size={20} style={{verticalAlign: 'middle', marginRight: '10px'}}/>
            UNIT #{loggedInAmbulance._id.slice(-4)}
          </h3>
          <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Status: {loggedInAmbulance.status}</p>
        </div>
      </div>

      <div style={{height: '40vh', padding: '20px', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)'}}>
        {!activeMission ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)'}}>
            <CheckCircle2 size={48} color="var(--accent-green)" style={{marginBottom: '20px'}}/>
            <h2>NO ACTIVE MISSIONS</h2>
            <p>Standby for dispatch.</p>
          </div>
        ) : (
          <div className="sos-card glass-panel" style={{maxWidth: '800px', margin: '0 auto', border: '1px solid var(--accent-red)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '15px'}}>
              <h2 style={{color: 'var(--accent-red)', margin: 0}}>ACTIVE DISPATCH</h2>
              
              <div style={{textAlign: 'right'}}>
                {eta > 0 ? (
                  <>
                    <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>ETA to Scene</span>
                    <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '5px'}}>
                      <Clock size={24}/> {formatTime(eta)}
                    </div>
                  </>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '5px'}}>
                      <CheckCircle2 size={24}/> ARRIVED AT SCENE
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          await axios.put(`${API_URL}/emergencies/${activeMission._id}/resolve`);
                          setActiveMission(null);
                          setEta(null);
                        } catch(e) {
                          console.error(e);
                        }
                      }}
                      style={{padding: '10px 20px', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                      Complete Mission
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{display: 'flex', gap: '30px'}}>
              <div style={{flex: 1}}>
                <h4 style={{color: 'var(--text-secondary)', marginBottom: '5px'}}><User size={16} style={{display: 'inline', verticalAlign: 'text-bottom'}}/> Patient Info</h4>
                <p style={{fontSize: '1.2rem', margin: '0 0 10px 0'}}>{activeMission.patient_name}</p>
                <p><strong>Priority:</strong> {activeMission.priority}</p>
                <p><strong>Symptoms:</strong> {activeMission.symptoms}</p>
              </div>
              <div style={{flex: 1}}>
                <h4 style={{color: 'var(--text-secondary)', marginBottom: '5px'}}><MapPin size={16} style={{display: 'inline', verticalAlign: 'text-bottom'}}/> Scene Address</h4>
                <p style={{margin: '0 0 10px 0'}}>{activeMission.address}</p>
                
                {activeMission.first_aid_instructions && (
                  <div style={{backgroundColor: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '5px', borderLeft: '3px solid var(--accent-red)'}}>
                    <strong style={{color: 'var(--accent-red)'}}><Activity size={14}/> Dispatch Notes:</strong><br/>
                    <span style={{fontSize: '0.85rem'}}>{activeMission.first_aid_instructions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
