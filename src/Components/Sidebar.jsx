import { LayoutGrid, DollarSign, Wrench, Building2, Briefcase, X, Home, LogOut, Settings, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'general',
      name: 'General',
      icon: LayoutGrid,
      path: '/general',
      color: 'text-blue-600',
      bgHover: 'hover:bg-blue-50',
      activeBg: 'bg-blue-50'
    },
    {
      id: 'admin-finance',
      name: 'Admin & Finance',
      icon: DollarSign,
      path: '/admin-finance',
      color: 'text-emerald-600',
      bgHover: 'hover:bg-emerald-50',
      activeBg: 'bg-emerald-50'
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: Wrench,
      path: '/technical',
      color: 'text-violet-600',
      bgHover: 'hover:bg-violet-50',
      activeBg: 'bg-violet-50'
    },
    {
      id: 'corporate-affairs',
      name: 'Corporate Affairs',
      icon: Building2,
      path: '/corporate-affairs',
      color: 'text-amber-600',
      bgHover: 'hover:bg-amber-50',
      activeBg: 'bg-amber-50'
    },
    {
      id: 'directorate',
      name: 'Directorate',
      icon: Briefcase,
      path: '/directorate',
      color: 'text-rose-600',
      bgHover: 'hover:bg-rose-50',
      activeBg: 'bg-rose-50'
    }
  ];

  const quickActions = [
    { label: 'Request Leave', action: () => navigate('/general/my-leave') },
    { label: 'Set KPI Goals', action: () => console.log('Set KPI') },
    { label: 'View Payslip', action: () => navigate('/my-payslips') },
    { label: 'Update Profile', action: () => navigate('/profile') }
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('verifiedDepartments');
    navigate('/login');
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 flex flex-col`}
      >
        {/* Fixed Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0" style={{ backgroundColor: '#132552' }}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: '#8e3400' }}>
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="font-bold text-white text-lg">Intranet</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white hover:bg-white/20 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="py-6">
            {/* Dashboard Home */}
            <div className="px-4 mb-6">
              <Link
                to="/"
                onClick={handleLinkClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === '/'
                    ? 'text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={location.pathname === '/' ? { backgroundColor: '#8e3400' } : {}}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
            </div>

            {/* Departments Section */}
            <div className="px-4 mb-6">
              <h3 className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#132552' }}>
                Departments
              </h3>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive ? `${item.activeBg} ${item.color} font-medium shadow-sm` : `text-gray-700 ${item.bgHover}`
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-500'}`} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="px-4 mb-6 pt-6 border-t border-gray-200">
              <h3 className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#132552' }}>
                Quick Actions
              </h3>
              <div className="space-y-1">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      action.action();
                      handleLinkClick();
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 text-sm font-medium"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Section - FIXED: Settings now uses Link */}
            <div className="px-4 pt-6 border-t border-gray-200">
              <h3 className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#132552' }}>
                Account
              </h3>
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={handleLinkClick}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">Profile</span>
                </Link>
                
                {/* ✅ FIXED: Settings now navigates properly */}
                <Link
                  to="/settings"
                  onClick={handleLinkClick}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Fixed Footer - User Info */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md" style={{ background: 'linear-gradient(135deg, #132552 0%, #8e3400 100%)' }}>
              EN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Enoch Nikoi</p>
              <p className="text-xs text-gray-500 truncate">Employee</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}