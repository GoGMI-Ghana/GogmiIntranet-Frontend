import { useNavigate } from 'react-router-dom';
import { FlaskConical, Megaphone, GraduationCap } from 'lucide-react';
import DepartmentProtection from '../Components/DepartmentProtection';

export default function Technical() {
  const navigate = useNavigate();

  const subModules = [
    {
      id: 'research',
      name: 'Research',
      icon: FlaskConical,
      description: 'Research and development activities',
      path: '/technical/research'
    },
    {
      id: 'advocacy',
      name: 'Advocacy',
      icon: Megaphone,
      description: 'Advocacy and outreach programs',
      path: '/technical/advocacy'
    },
    {
      id: 'capacity-building',
      name: 'Capacity Building',
      icon: GraduationCap,
      description: 'Training and capacity development',
      path: '/technical/capacity-building'
    }
  ];

  return (
    <DepartmentProtection departmentId="technical">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#132552' }}>
            Technical Department
          </h1>
          <p className="text-gray-600">
            Technical operations and support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-violet-500 hover:shadow-xl hover:border-violet-600 transition-all duration-300 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-violet-100 p-3 rounded-lg group-hover:bg-violet-200 transition-colors">
                    <Icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-violet-600 transition-colors">
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
