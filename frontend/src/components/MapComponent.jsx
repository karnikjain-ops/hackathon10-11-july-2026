import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const patientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const patientSelectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapComponent({ hospitals, ambulances, emergencies = [], selectedEmergencyId }) {
  const center = [28.6139, 77.2090]; // New Delhi, India Center

  return (
    <div className="main-content">
      <MapContainer center={center} zoom={12} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hospitals.map((hospital) => {
          const assignedPatients = emergencies.filter(e => e.target_hospital_id === hospital._id);
          return (
            <Marker 
              key={hospital._id} 
              position={[hospital.location.lat, hospital.location.lng]}
              icon={hospitalIcon}
            >
              <Tooltip direction="top" offset={[0, -40]} opacity={0.9}>
                <strong>{hospital.name}</strong>
                {assignedPatients.length > 0 && (
                  <div style={{marginTop: '5px', borderTop: '1px solid #ccc', paddingTop: '5px'}}>
                    <em>Incoming Patients:</em>
                    <ul style={{margin: '0', paddingLeft: '15px', fontSize: '0.85em'}}>
                      {assignedPatients.map(p => (
                        <li key={p._id}>{p.patient_name} (Priority {p.priority})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Tooltip>
              <Popup>
                <strong>{hospital.name}</strong><br />
                ICU Beds: {hospital.available_icu_beds} / {hospital.total_icu_beds}
              </Popup>
            </Marker>
          );
        })}

        {ambulances.map((ambulance) => (
          <Marker 
            key={ambulance._id} 
            position={[ambulance.location.lat, ambulance.location.lng]}
          >
            <Popup>
              <strong>Ambulance {ambulance._id.slice(-4)}</strong><br />
              Status: {ambulance.status}<br />
              Contact: {ambulance.paramedic_contact}
            </Popup>
          </Marker>
        ))}

        {emergencies.map((emergency) => (
          <Marker 
            key={emergency._id} 
            position={[emergency.location.lat, emergency.location.lng]}
            icon={emergency._id === selectedEmergencyId ? patientSelectedIcon : patientIcon}
          >
            <Popup>
              <strong>{emergency.patient_name} (Patient)</strong><br />
              Priority: {emergency.priority}<br />
              Status: {emergency.status}
            </Popup>
          </Marker>
        ))}

        {/* Draw active ambulance routes */}
        {emergencies.map((emergency) => {
          if (emergency.assigned_ambulance_id) {
            const assignedAmbulance = ambulances.find(a => a._id === emergency.assigned_ambulance_id);
            if (assignedAmbulance) {
              const positions = emergency.route_path && emergency.route_path.length > 0 
                ? emergency.route_path 
                : [
                    [assignedAmbulance.location.lat, assignedAmbulance.location.lng],
                    [emergency.location.lat, emergency.location.lng]
                  ];
                  
              return (
                <Polyline 
                  key={`route-${emergency._id}`}
                  positions={positions}
                  color={emergency._id === selectedEmergencyId ? "var(--accent-gold, #ffd700)" : "var(--accent-blue, #3b82f6)"}
                  weight={4}
                  dashArray={emergency.route_path ? "" : "10, 10"}
                  opacity={0.7}
                />
              );
            }
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
