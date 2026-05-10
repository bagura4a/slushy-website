import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, ShoppingBag, Menu as MenuIcon, Users, Settings as SettingsIcon, LogOut, Bell, MonitorPlay } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'POS (Walk-in)', path: '/admin/pos', icon: MonitorPlay },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Menu', path: '/admin/menu', icon: MenuIcon },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingOrders(snapshot.size);
    }, (error) => {
      console.error("AdminLayout onSnapshot error:", error);
    });
    return unsubscribe;
  }, [isAdmin]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#060610] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="font-display text-2xl tracking-widest text-brand-primary">SLUSHIFY</Link>
          <div className="text-xs text-white/50 tracking-widest uppercase mt-1">Order Management</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  isActive ? "bg-brand-primary/10 text-brand-primary" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.name === 'Orders' && pendingOrders > 0 && (
                  <span className="ml-auto bg-brand-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-[#060610]/50 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0">
          <div className="text-white/60 text-sm font-medium">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="w-5 h-5 text-white/60" />
              {pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-primary rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-sm font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white/90">{user.email}</span>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
