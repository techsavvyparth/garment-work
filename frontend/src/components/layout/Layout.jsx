import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, CreditCard, BarChart3,
  Settings, LogOut, Menu, X, ChevronRight, Wifi, WifiOff, Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ladies', icon: Users, label: 'Ladies' },
  { to: '/work', icon: ClipboardList, label: 'Work Entries' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className={`fixed top-0 left-0 h-full w-64 glass-dark border-r border-white/8 z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">LW</span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{user?.companyName || 'Ladies Work'}</p>
          <p className="text-slate-500 text-xs">Management System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-violet-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & logout */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-red-400'}`} title={online ? 'Online' : 'Offline'} />
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0F0A1E]">
      <Sidebar />

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-dark border-b border-white/8 px-4 h-14 flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-slate-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          {!online && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <WifiOff size={12} /> Offline
            </div>
          )}
          {online && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Wifi size={12} /> Online
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
    </div >
  );
};
