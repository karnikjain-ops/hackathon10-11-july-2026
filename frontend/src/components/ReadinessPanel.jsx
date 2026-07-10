import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Clock, Ambulance, CheckCircle2 } from 'lucide-react';
import './ReadinessPanel.css';

export default function ReadinessPanel({ emergency, hospital }) {
  const [eta, setEta] = useState(null);

  useEffect(() => {
    if (emergency.status === 'EN_ROUTE_TO_HOSPITAL' && emergency.eta && eta === null) {
      setEta(emergency.eta);
    }
  }, [emergency, eta]);

  // Countdown timer logic
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

  return (
    <div className="readiness-panel glass-panel">
      <h2>Treatment Readiness</h2>
      
      <div className="patient-details">
        <h3><User size={18}/> {emergency.patient_name}</h3>
        <p className="symptom-text">{emergency.symptoms}</p>
        
        {emergency.address && (
          <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-5px', marginBottom: '10px'}}>
            <strong>Location:</strong> {emergency.address}
          </p>
        )}
        
        {emergency.patient_profile && (
          <div className="medical-profile-box">
            <h4>Medical Profile</h4>
            <div className="profile-grid">
              <div><span>Blood Type:</span> {emergency.patient_profile.bloodType || 'Unknown'}</div>
              <div><span>Allergies:</span> {emergency.patient_profile.allergies || 'None'}</div>
              <div style={{gridColumn: 'span 2'}}><span>Conditions:</span> {emergency.patient_profile.conditions || 'None'}</div>
            </div>
          </div>
        )}
      </div>

      <div className="eta-container">
        <div className="eta-header">
          <Ambulance size={24} color="var(--accent-blue)" />
          <span>Ambulance Status</span>
        </div>
        <div className="eta-time">
          {emergency.status === 'PENDING_HOSPITAL_ACCEPTANCE' ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center'}}>
              <div style={{fontSize: '1.2rem', color: 'var(--text-secondary)'}}>Awaiting Dispatch...</div>
              <button 
                onClick={async () => {
                  try {
                    await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/emergencies/${emergency._id}/hospital-response`, {
                      method: 'PUT',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ action: 'ACCEPT', hospital_id: hospital._id })
                    });
                    alert("Emergency manually accepted!");
                  } catch (e) {
                    console.error(e);
                  }
                }}
                style={{padding: '10px 20px', backgroundColor: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
              >
                Manual Override: Accept Now
              </button>
            </div>
          ) : eta > 0 ? (
            <>
              <Clock size={32} color="var(--accent-yellow)"/>
              <span className="time">{formatTime(eta)}</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={32} color="var(--accent-green)"/>
              <span className="time arrived">Arrived</span>
            </>
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0' }}>
          <strong>Routing:</strong> Ambulance #{emergency.assigned_ambulance_id ? emergency.assigned_ambulance_id.slice(-4) : 'Unknown'} <br/>
          <strong>Destination:</strong> {hospital.name}
        </div>
        <p className="prep-text">Prepare Trauma Bay 1. Patient is en route.</p>
      </div>
    </div>
  );
}
