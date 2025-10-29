import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import ViewEmployees from './pages/ViewEmployees';
import EmployeesAttendance from './pages/EmployeesAttendance';
import Performance from './pages/Performance';
import Analytics from './pages/Analytics';
import VerifyEmail from './pages/VerifyEmail';
import Employee from './pages/Employee';
import AddEmployee from './pages/AddEmployee';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL;
    const checkToken = async () => {
      try {
        const res = await axios.get(`${base_url}/me`, { withCredentials: true });
        const email = res.data?.email;
        if (email) localStorage.setItem('email', email);
        setToken(res.status === 200);
      } catch {
        setToken(false);
      }
    };
    checkToken();

    // Recheck token every hour
    const interval = setInterval(checkToken, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="view-employees" element={<ViewEmployees />} />
          <Route path=":CID" element={<Employee />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="employees-attendance" element={<EmployeesAttendance />} />
          <Route path="performance" element={<Performance />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
