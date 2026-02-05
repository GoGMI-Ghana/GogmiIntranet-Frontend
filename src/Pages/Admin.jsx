import { useNavigate } from 'react-router-dom';
import { Wallet, Package, PieChart, ShoppingCart, Users, Settings,Calendar } from 'lucide-react';
import DepartmentProtection from '../Components/DepartmentProtection';


export default function Admin() {
  const navigate = useNavigate();

  const subModules = [
    {
      id: 'payroll',
      name: 'Payroll',
      icon: Wallet,
      description: 'Salary and compensation management',
      path: '/admin-finance/payroll'
    },



{
      id: 'employee-data',
      name: 'Employee Data',
      icon: Users,
      description: 'Employee information and records',
      path: '/admin-finance/employee-data'
    },
    {
      id: 'budgets',
      name: 'Budgets',
      icon: PieChart,
      description: 'Budget planning and tracking',
      path: '/admin-finance/budgets'
    },
    {
      id: 'procurement',
      name: 'Procurement',
      icon: ShoppingCart,
      description: 'Purchasing and procurement',
      path: '/admin-finance/procurement'
    },
    {
      id: 'hr',
      name: 'HR',
      icon: Users,
      description: 'Human resources management',
      path: '/admin-finance/hr'
    },
    


    {
      id: 'leave-management',
      name: 'Leave Management',
      icon: Calendar,
      description: 'Approve and manage employee leave requests',
      path: '/admin-finance/leave-management',
      color: 'orange'
    }

  ];

  return (
    <DepartmentProtection departmentId="admin-finance">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#132552' }}>
            Admin and Finance Department
          </h1>
          <p className="text-gray-600">
            Administrative and financial operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-xl hover:border-emerald-600 transition-all duration-300 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {module.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </DepartmentProtection>
  );
}
