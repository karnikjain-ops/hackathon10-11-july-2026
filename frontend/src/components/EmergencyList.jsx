import { AlertTriangle, Activity, MapPin } from 'lucide-react';
import './EmergencyList.css';

export default function EmergencyList({ emergencies }) {
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 1: return 'var(--accent-red)';
      case 2: return 'var(--accent-yellow)';
      default: return 'var(--accent-green)';
    }
  };

  return (
    <div className="emergency-list glass-panel">
      <div className="header">
        <Activity size={24} color="var(--accent-blue)" />
        <h2>Active Emergencies</h2>
      </div>
      
      <div className="list-container">
        {emergencies.length === 0 ? (
          <p className="no-data">No active emergencies.</p>
        ) : (
          emergencies.map((em) => (
            <div key={em._id} className="emergency-card" style={{ borderLeftColor: getPriorityColor(em.priority) }}>
              <div className="card-header">
                <h3>{em.patient_name}</h3>
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(em.priority) + '33', color: getPriorityColor(em.priority) }}>
                  Priority {em.priority}
                </span>
              </div>
              <p className="symptoms"><strong>Symptom:</strong> {em.symptoms}</p>
              
              {em.patient_profile && em.patient_profile.bloodType && (
                <div className="medical-history" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
                  <strong>Blood:</strong> {em.patient_profile.bloodType} | <strong>Allergies:</strong> {em.patient_profile.allergies || 'None'} <br/>
                  <strong>History:</strong> {em.patient_profile.conditions || 'None'}
                </div>
              )}

              <div className="card-footer">
                <span className="status">{em.status}</span>
                <span className="location">
                  <MapPin size={14} /> {em.location.lat.toFixed(2)}, {em.location.lng.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
