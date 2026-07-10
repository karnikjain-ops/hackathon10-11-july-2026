import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SOSApp from './pages/SOSApp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SOSApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hospital" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
