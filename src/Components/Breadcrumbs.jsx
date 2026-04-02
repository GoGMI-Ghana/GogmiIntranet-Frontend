import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  
  // Define breadcrumb labels for paths
  const pathLabels = {
    'general': 'General',
    'admin-finance': 'Admin & Finance',
    'technical': 'Technical',
    'corporate-affairs': 'Corporate Affairs',
    'directorate': 'Directorate',
    'policies': 'Policies',
    'stakeholders': 'Stakeholders',
    'assets': 'Assets',
    'imswg': 'IMSWG',
    'imswg-forum': 'IMSWG Forum 2026',
    'maritime-governance-course': 'Maritime Governance Course',
    'employee-data': 'Employee Data',
    'payroll': 'Payroll',
    'budgets': 'Budgets',
    'procurement': 'Procurement',
    'hr': 'HR',
    'research-work': 'Research Work',
    'it': 'IT',
    'executive-management': 'Executive Management',
    'profile': 'My Profile',
    'settings': 'Settings',
    'register-employee': 'Register Employee',
    'my-payslips': 'My Payslips',
    'my-leave': 'My Leave',
    'leave-management': 'Leave Management',
    'announcements': 'Announcements',
    'kpi-goals': 'KPI Goals',
    'view-payslip': 'View Payslip',
    'mou': 'MOU',
    'research': 'Research',
    'advocacy': 'Advocacy',
    'capacity-building': 'Capacity Building',
    'marine-casualty-course': 'Marine Casualty Course',
  };

  // Build breadcrumb array from current path
  const buildBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', path: '/' }];
    
    let currentPath = '';
    paths.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = pathLabels[segment] || segment;
      breadcrumbs.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();
  
  // Don't show breadcrumbs on dashboard or login
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {isLast ? (
                <span className="font-medium" style={{ color: '#132552' }}>
                  {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-600 hover:text-gray-900 flex items-center transition-colors"
                >
                  {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
