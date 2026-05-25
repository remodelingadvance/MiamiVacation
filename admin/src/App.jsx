import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './contexts/AdminAuthContext';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PageLoader from './components/common/PageLoader';
import AdminProperties from './pages/AdminProperties';
import AdminPropertyForm from './pages/AdminPropertyForm';
import AdminBookings from './pages/AdminBookings';
import AdminBookingDetail from './pages/AdminBookingDetail';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminReviews from './pages/AdminReviews';
import AdminCoupons from './pages/AdminCoupons';
import AdminCouponForm from './pages/AdminCouponForm';
import AdminContacts from './pages/AdminContacts';
import AdminContactDetail from './pages/AdminContactDetail';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCouponDetails from './pages/AdminCouponDetails';
import AdminSettings from './pages/AdminSettings';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="properties/new" element={<AdminPropertyForm />} />
        <Route path="properties/:id/edit" element={<AdminPropertyForm />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="bookings/:id" element={<AdminBookingDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="coupons/:id" element={<AdminCouponDetails />} />
        <Route path="coupons/new" element={<AdminCouponForm />} />
        <Route path="coupons/:id/edit" element={<AdminCouponForm />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="contacts/:id" element={<AdminContactDetail />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;