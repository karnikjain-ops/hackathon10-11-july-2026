import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, User, AlertCircle, MapPin, CheckCircle2, Ambulance, Hospital } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SOSApp.css'; 

export default function SOSApp() {
  const navigate = useNavigate();
  const [step, setStep] = useState('PROFILE'); // PROFILE, SOS, EN_ROUTE
  const [profile, setProfile] = useState({
    name: '',
    bloodType: '',
    allergies: '',
    conditions: ''
  });
  const [symptoms, setSymptoms] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [instructions, setInstructions] = useState('');
  
  const [activeEmergencyId, setActiveEmergencyId] = useState(null);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);

  // Load profile and active emergency from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('patientProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setStep('SOS');
    }
    
    const savedEmergencyId = localStorage.getItem('activeEmergencyId');
    if (savedEmergencyId) {
      setActiveEmergencyId(savedEmergencyId);
      setStep('EN_ROUTE');
    }
    
    // Fetch hospitals and ambulances for reference
    const fetchRefs = async () => {
      try {
        const [hRes, aRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`}/hospitals`),
          axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`}/ambulances`)
        ]);
        setHospitals(hRes.data);
        setAmbulances(aRes.data);
      } catch (err) {
        console.error("Error fetching refs", err);
      }
    };
    fetchRefs();
  }, []);

  // Poll active emergency
  useEffect(() => {
    let interval;
    if (step === 'EN_ROUTE' && activeEmergencyId) {
      const fetchEmergency = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`}/emergencies`);
          const found = res.data.find(e => e._id === activeEmergencyId);
          if (found) {
            if (found.status === 'RESOLVED') {
              alert("Your emergency has been resolved by the medical team. Thank you.");
              setActiveEmergencyId(null);
              setActiveEmergency(null);
              localStorage.removeItem('activeEmergencyId');
              setStep('SOS');
            } else if (found.status === 'NO_HOSPITALS_AVAILABLE') {
              alert("CRITICAL: No hospitals are currently available to accept this emergency. Please call local authorities immediately!");
              setActiveEmergencyId(null);
              setActiveEmergency(null);
              localStorage.removeItem('activeEmergencyId');
              setStep('SOS');
            } else {
              setActiveEmergency(found);
            }
          }
        } catch (err) {
          console.error("Error polling emergency", err);
        }
      };
      
      fetchEmergency(); // fetch immediately
      interval = setInterval(fetchEmergency, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [step, activeEmergencyId]);

  const handleSaveProfile = async () => {
    if (!profile.name) return alert("Please enter at least your name.");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`}/patients`, profile);
      const newProfile = res.data;
      setProfile(newProfile);
      localStorage.setItem('patientProfile', JSON.stringify(newProfile));
      setStep('SOS');
    } catch (err) {
      console.error("Failed to register patient", err);
      alert("Registration failed");
    }
  };

  const handleSOS = async () => {
    if (!symptoms) return alert("Please briefly describe the emergency.");
    setIsSending(true);

    // Get location
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsSending(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const emergencyData = {
        patient_id: profile._id,
        patient_name: profile.name,
        symptoms: symptoms,
        patient_profile: profile,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      };

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`}/emergencies`, emergencyData);
        if (response.data.first_aid_instructions) {
          setInstructions(response.data.first_aid_instructions);
        }
        setActiveEmergencyId(response.data._id);
        setActiveEmergency(response.data);
        localStorage.setItem('activeEmergencyId', response.data._id);
        setStep('EN_ROUTE');
      } catch (error) {
        console.error("SOS Error:", error);
        alert("Failed to send SOS. Please try again.");
      } finally {
        setIsSending(false);
      }
    }, (err) => {
      alert("Error getting location: " + err.message);
      setIsSending(false);
    });
  };

  const getHospitalName = (id) => {
    if (!id) return "Pending Assignment";
    const h = hospitals.find(h => h._id === id);
    return h ? h.name : id;
  };

  const getAmbulanceName = (id) => {
    if (!id) return "Pending Dispatch";
    const a = ambulances.find(a => a._id === id);
    return a ? `Unit #${a._id.slice(-4)}` : id;
  };

  return (
    <div className="sos-container">
      <div className="top-nav">
         <button className="nav-btn" onClick={() => navigate('/login')}>Responder Login</button>
      </div>

      {step === 'PROFILE' && (
        <div className="sos-card glass-panel profile-step">
          <h2><User size={24} /> Medical Profile Setup</h2>
          <p>Fill this out now so responders have it when you need them.</p>
          
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Blood Type</label>
            <input type="text" value={profile.bloodType} onChange={(e) => setProfile({...profile, bloodType: e.target.value})} placeholder="O+" />
          </div>
          <div className="form-group">
            <label>Allergies</label>
            <textarea value={profile.allergies} onChange={(e) => setProfile({...profile, allergies: e.target.value})} placeholder="e.g. Penicillin, Peanuts" />
          </div>
          <div className="form-group">
            <label>Pre-existing Conditions</label>
            <textarea value={profile.conditions} onChange={(e) => setProfile({...profile, conditions: e.target.value})} placeholder="e.g. Asthma, Diabetes" />
          </div>
          
          <button className="primary-btn" onClick={handleSaveProfile}>Save & Continue</button>
        </div>
      )}

      {step === 'SOS' && (
        <div className="sos-card glass-panel sos-step">
          <div className="profile-summary" onClick={() => setStep('PROFILE')}>
            <User size={16}/> {profile.name} (Tap to edit profile)
          </div>
          
          <h2><AlertCircle size={28} color="var(--accent-red)"/> Emergency Assistance</h2>
          
          <div className="form-group">
            <label>What is the emergency?</label>
            <textarea 
              value={symptoms} 
              onChange={(e) => setSymptoms(e.target.value)} 
              placeholder="e.g. Severe chest pain, trouble breathing..." 
              rows={4}
            />
          </div>

          <button 
            className={`massive-sos-btn ${isSending ? 'pulsing' : ''}`} 
            onClick={handleSOS}
            disabled={isSending}
          >
            {isSending ? 'SENDING...' : 'SEND SOS'}
          </button>
          <p className="sos-hint"><MapPin size={14}/> Your GPS location will be sent automatically.</p>
        </div>
      )}

      {step === 'EN_ROUTE' && (
        <div className="sos-card glass-panel success-step">
          <CheckCircle2 size={64} color="var(--accent-green)" />
          <h2>Help is on the way.</h2>
          <p>Your emergency has been prioritized and dispatched to the nearest available hospital.</p>

          {activeEmergency && activeEmergency.status === 'EN_ROUTE_TO_HOSPITAL' && (
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)'}}>
              <p style={{margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Hospital size={20} color="var(--accent-gold)"/> 
                <strong>Responding Hospital:</strong> {getHospitalName(activeEmergency.target_hospital_id)}
              </p>
              <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <p style={{margin: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <Ambulance size={20} color="var(--accent-blue)"/> 
                  <strong>Dispatched Ambulance:</strong> {getAmbulanceName(activeEmergency.assigned_ambulance_id)}
                </p>
                {activeEmergency.assigned_ambulance_id && (() => {
                  const amb = ambulances.find(a => a._id === activeEmergency.assigned_ambulance_id);
                  if (amb) {
                    return (
                      <div style={{marginLeft: '30px', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                        Driver: {amb.driver_name} <br/>
                        Contact: +91 {amb.paramedic_contact}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
          
          {instructions && (
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--accent-blue)', textAlign: 'left'}}>
              <h4 style={{marginTop: 0, marginBottom: '10px', color: 'var(--accent-blue)'}}><Activity size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '5px'}}/>While You Wait</h4>
              <p style={{fontSize: '0.9rem', margin: 0, lineHeight: '1.4'}}>{instructions}</p>
            </div>
          )}
          
          <p className="sub-text" style={{marginTop: '20px'}}>Please stay calm and remain at your current location.</p>
        </div>
      )}
    </div>
  );
}
