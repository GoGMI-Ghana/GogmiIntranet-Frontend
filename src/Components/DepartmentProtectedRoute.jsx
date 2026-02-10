import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function DepartmentProtectedRoute({ children, requiredDepartment }) {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  
  // Normalize department name - handle both "Corporate Affairs" and "corporate-affairs" formats
  const normalizeDepartment = (dept) => {
    if (!dept) return '';
    // Convert to lowercase and replace spaces/hyphens for comparison
    return dept.toLowerCase().replace(/[\s-]/g, '');
  };

  // Map route departments to normalized format
  const departmentMap = {
    'admin-finance': 'financeandadministration',
    'technical': 'technical',
    'corporate-affairs': 'corporateaffairs',
    'directorate': 'directorate',
    'general': 'general'
  };

  const normalizedUserDept = normalizeDepartment(user.department);
  const normalizedRequiredDept = departmentMap[requiredDepartment] || normalizeDepartment(requiredDepartment);
  
  // Allow access if:
  // 1. User is in Directorate (executives have full access)
  // 2. User is ADMIN001 (testing account)
  // 3. User belongs to the required department (normalized comparison)
  // 4. Route is 'general' (accessible to everyone)
  
  const hasAccess = 
    normalizedUserDept === 'directorate' ||
    user.employeeId === 'ADMIN001' ||
    normalizedUserDept === normalizedRequiredDept ||
    requiredDepartment === 'general';

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-gray-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Restricted
            </h2>
            
            <p className="text-gray-600 mb-6">
              You don't have permission to access this department's resources.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Your Department:</span>
                  <span className="font-semibold text-gray-900">{user.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Access Level:</span>
                  <span className="font-semibold text-gray-900">
                    {normalizedUserDept === 'directorate' ? 'Executive' : 'Department Member'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
