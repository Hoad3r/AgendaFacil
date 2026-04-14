import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/layout/Layout';
import ProviderLayout from './components/layout/ProviderLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Establishments from './pages/Establishments';
import EstablishmentDetail from './pages/EstablishmentDetail';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

import ProviderDashboard from './pages/provider/Dashboard';
import ProviderServices from './pages/provider/Services';
import ProviderSchedule from './pages/provider/Schedule';
import ProviderAppointments from './pages/provider/Appointments';
import ProviderEstablishment from './pages/provider/Establishment';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public + Client routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
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
                path="/profile"
                element={
                  <ProtectedRoute roles={['CLIENT', 'PROVIDER', 'ADMIN']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin routes */}
            <Route element={<Layout />}>
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Provider routes */}
            <Route element={<ProviderLayout />}>
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
              <Route
                path="/provider/establishment"
                element={
                  <ProtectedRoute roles={['PROVIDER', 'ADMIN']}>
                    <ProviderEstablishment />
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
