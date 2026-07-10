import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SOSApp from './pages/SOSApp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AmbulanceDashboard from './pages/AmbulanceDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SOSApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hospital" element={<Dashboard />} />
        <Route path="/ambulance" element={<AmbulanceDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
