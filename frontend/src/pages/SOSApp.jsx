import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, User, AlertCircle, MapPin, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SOSApp.css'; // We will create this next

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

  // Load profile from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('patientProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setStep('SOS');
    }
  }, []);

  const handleSaveProfile = () => {
    if (!profile.name) return alert("Please enter at least your name.");
    localStorage.setItem('patientProfile', JSON.stringify(profile));
    setStep('SOS');
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
        patient_name: profile.name,
        symptoms: symptoms,
        patient_profile: profile,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      };

      try {
        await axios.post('http://127.0.0.1:8000/emergencies', emergencyData);
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

  return (
    <div className="sos-container">
      <div className="top-nav">
         <button className="nav-btn" onClick={() => navigate('/login')}>Hospital Login</button>
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
          <p className="sub-text">Please stay calm and remain at your current location.</p>
        </div>
      )}
    </div>
  );
}
