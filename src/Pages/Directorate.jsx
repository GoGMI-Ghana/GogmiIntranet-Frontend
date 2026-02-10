import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, BarChart3, UserCheck } from 'lucide-react';

export default function Directorate() {
  const navigate = useNavigate();

  const subModules = [
    {
      id: 'company-strategy',
      name: 'Company Strategy',
      icon: TrendingUp,
      description: 'Strategic planning and long-term vision',
      path: '/directorate/company-strategy'
    },
    {
      id: 'board-of-directors',
      name: 'Board of Directors',
      icon: UserCheck,
      description: 'Board of Directors information and governance',
      path: '/directorate/board-of-directors'
    },
    {
      id: 'advisory-board',
      name: 'Advisory Board',
      icon: Users,
      description: 'Advisory Board meetings and matters',
      path: '/directorate/advisory-board'
    },
    {
      id: 'company-performance',
      name: 'Company Performance',
      icon: BarChart3,
      description: 'Performance metrics and KPI tracking',
      path: '/directorate/company-performance'
    }
  ];

  return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#132552' }}>
            Directorate
          </h1>
          <p className="text-gray-600">
            Executive management and strategic oversight
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {subModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-rose-500 hover:shadow-xl hover:border-rose-600 transition-all duration-300 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-rose-100 p-3 rounded-lg group-hover:bg-rose-200 transition-colors">
                    <Icon className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
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
