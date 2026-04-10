import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Establishments from './pages/Establishments';
import EstablishmentDetail from './pages/EstablishmentDetail';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';

import ProviderDashboard from './pages/provider/Dashboard';
import ProviderServices from './pages/provider/Services';
import ProviderSchedule from './pages/provider/Schedule';
import ProviderAppointments from './pages/provider/Appointments';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/establishments" element={<Establishments />} />
              <Route path="/establishments/:id" element={<EstablishmentDetail />} />

              <Route
                path="/booking/:establishmentId/:serviceId"
                element={
                  <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-appointments"
                element={
                  <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/provider/dashboard"
                element={
                  <ProtectedRoute roles={['PROVIDER', 'ADMIN']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services"
                element={
                  <ProtectedRoute roles={['PROVIDER', 'ADMIN']}>
                    <ProviderServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/schedule"
                element={
                  <ProtectedRoute roles={['PROVIDER', 'ADMIN']}>
                    <ProviderSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/appointments"
                element={
                  <ProtectedRoute roles={['PROVIDER', 'ADMIN']}>
                    <ProviderAppointments />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
