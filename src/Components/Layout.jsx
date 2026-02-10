import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import SearchBar from './SearchBar';
import NotificationsPanel from './NotificationsPanel';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Hide sidebar on Employee Data page for full-screen experience
  const isEmployeeDataPage = location.pathname === '/admin-finance/employee-data';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on Employee Data page */}
      {!isEmployeeDataPage && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className={isEmployeeDataPage ? '' : 'lg:pl-64'}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b shadow-sm" style={{ backgroundColor: '#132552' }}>
          <div className="h-full px-4 flex items-center justify-between">
            {/* Left: Menu button */}
            {!isEmployeeDataPage && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {/* Center: Search (desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <SearchBar />
            </div>

            {/* Right: Notifications and User */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationsPanel />

              {/* User Profile (mobile) */}
              <div className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: '#8e3400' }}>
                EN
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumbs - Hidden on Employee Data page */}
        {!isEmployeeDataPage && <Breadcrumbs />}

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
