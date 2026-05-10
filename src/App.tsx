import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Landing from './pages/Landing';
import Order from './pages/Order';
import TrackOrder from './pages/TrackOrder';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import MenuManagement from './pages/admin/Menu';
import Customers from './pages/admin/Customers';
import Settings from './pages/admin/Settings';
import POS from './pages/admin/POS';
import AdminLayout from './components/admin/AdminLayout';

export default function App() {
  return (
    <div className="bg-brand-dark min-h-screen text-white font-body selection:bg-brand-primary selection:text-white">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/order" element={<Order />} />
            <Route path="/track" element={<TrackOrder />} />
            
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="pos" element={<POS />} />
              <Route path="orders" element={<Orders />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
