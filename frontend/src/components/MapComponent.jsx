import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

export default function MapComponent({ hospitals, ambulances }) {
  const center = [40.7128, -74.0060]; // NYC Center

  return (
    <div className="main-content">
      <MapContainer center={center} zoom={12} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hospitals.map((hospital) => (
          <Marker 
            key={hospital._id} 
            position={[hospital.location.lat, hospital.location.lng]}
            icon={hospitalIcon}
          >
            <Popup>
              <strong>{hospital.name}</strong><br />
              ICU Beds: {hospital.available_icu_beds} / {hospital.total_icu_beds}
            </Popup>
          </Marker>
        ))}

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
      </MapContainer>
    </div>
  );
}
