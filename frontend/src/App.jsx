import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home          from './pages/Home';
import Notifications from './pages/Notifications';
import Courses       from './pages/Courses';
import Materials     from './pages/Materials';
import Events        from './pages/Events';
import Gallery       from './pages/Gallery';
import Payment       from './pages/Payment';
import About         from './pages/About';
import Contact       from './pages/Contact';

// Admin
import AdminLogin    from './admin/AdminLogin';
import AdminLayout   from './admin/AdminLayout';
import AdminDashboard     from './admin/pages/AdminDashboard';
import AdminNotifications from './admin/pages/AdminNotifications';
import AdminCourses       from './admin/pages/AdminCourses';
import AdminMaterials     from './admin/pages/AdminMaterials';
import AdminEvents        from './admin/pages/AdminEvents';
import AdminEnquiries     from './admin/pages/AdminEnquiries';
import AdminPayments      from './admin/pages/AdminPayments';

// CSS
import './index.css';
import './pages/Pages.css';
import './admin/AdminLayout.css';
import './admin/pages/Admin.css';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"              element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/notifications" element={<PublicLayout><Notifications /></PublicLayout>} />
          <Route path="/courses"       element={<PublicLayout><Courses /></PublicLayout>} />
          <Route path="/materials"     element={<PublicLayout><Materials /></PublicLayout>} />
          <Route path="/events"        element={<PublicLayout><Events /></PublicLayout>} />
          <Route path="/gallery"       element={<PublicLayout><Gallery /></PublicLayout>} />
          <Route path="/payment"       element={<PublicLayout><Payment /></PublicLayout>} />
          <Route path="/about"         element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/contact"       element={<PublicLayout><Contact /></PublicLayout>} />

          {/* Admin */}
          <Route path="/admin"         element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login"   element={<AdminLogin />} />
          <Route path="/admin"         element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard"     element={<AdminDashboard />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="courses"       element={<AdminCourses />} />
            <Route path="materials"     element={<AdminMaterials />} />
            <Route path="events"        element={<AdminEvents />} />
            <Route path="enquiries"     element={<AdminEnquiries />} />
            <Route path="payments"      element={<AdminPayments />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
