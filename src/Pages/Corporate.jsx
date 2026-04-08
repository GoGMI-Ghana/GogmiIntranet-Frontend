import { useNavigate } from 'react-router-dom';
import { Users, Laptop, UserPlus, Settings } from 'lucide-react';

export default function Corporate() {
  const navigate = useNavigate();

  const subModules = [
    {
      id: 'company-settings',
      name: 'Company Settings',
      icon:Settings,
      description: 'Configure company information and branding',
      path: '/corporate-affairs/settings'
    },



{
      id: 'assets',
      name: 'Assets',
      icon: Settings,
      description: 'Company assets and inventory',
      path: '/corporate-affairs/assets'
    },
   



    {
      id: 'register-employee',
      name: 'Register Employee',
      icon: UserPlus,
      description: 'Register new employees to the intranet system',
      path: '/corporate-affairs/register-employee'
    },
  
    {
      id: 'it',
      name: 'IT',
      icon: Laptop,
      description: 'Information technology services',
      path: '/corporate-affairs/it'
    }
  ];

  return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#132552' }}>
            Corporate Affairs Department
          </h1>
          <p className="text-gray-600">
            Corporate governance and public relations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500 hover:shadow-xl hover:border-amber-600 transition-all duration-300 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <Icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
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
  );
}
