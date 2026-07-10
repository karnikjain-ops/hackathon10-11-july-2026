import { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import EmergencyList from '../components/EmergencyList';

const API_URL = 'http://127.0.0.1:8000';

export default function Dashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    // Fetch initial data
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    
    // Polling as a fallback for real-time (since we haven't implemented WebSockets yet)
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <EmergencyList emergencies={emergencies} />
      </div>
      <MapComponent hospitals={hospitals} ambulances={ambulances} />
    </div>
  );
}
