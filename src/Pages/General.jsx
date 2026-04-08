import { useNavigate } from 'react-router-dom';
import DepartmentProtection from '../Components/DepartmentProtection';
import { FileText, Users, Package, Database, UserSquare2, Megaphone, Calendar, GraduationCap } from 'lucide-react';

export default function General() {
  const navigate = useNavigate();

  const subModules = [
    {
      id: 'announcements',
      name: 'Announcements',
      icon: Megaphone,
      description: 'Company announcements and news',
      path: '/general/announcements'
    },
    {
      id: 'policies',
      name: 'Policies',
      icon: FileText,
      description: 'Company policies and procedures',
      path: '/general/policies'
    },
    {
      id: 'stakeholders',
      name: 'Stakeholders',
      icon: Users,
      description: 'Stakeholder management',
      path: '/general/stakeholders'
    },
    {
      id: 'imswg',
      name: 'IMSWG Stakeholder Database',
      icon: Database,
      description: 'IMSWG data management and reporting',
      path: '/general/imswg'
    },
    {
      id: 'imswg-forum',
      name: 'IMSWG Forum ',
      icon: Users,
      description: 'View IMSWG Forum registrations',
      path: '/general/imswg-forum'
    },
    {
      id: 'memberships',
      name: 'Memberships',
      icon: Users,
      description: 'Individual and institutional membership applications',
      path: '/general/memberships'
    },

        
    {
      id: 'training-programs',
      name: 'Training Programs',
      icon: GraduationCap,
      description: 'All GoGMI courses and training program registrations',
      path: '/general/training-programs'
    },
  
    {
      id: 'my-leave',
      name: 'My Leave',
      icon: Calendar,
      description: 'Request leave and view leave balance',
      path: '/general/my-leave'
    },
    {
      id: 'mou',
      name: 'MoU',
      icon: FileText,
      description: 'Memorandum of Understanding management',
      path: '/general/mou'
    },
  ];

  return (
    <DepartmentProtection departmentId="general">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#132552' }}>
            General 
          </h1>
          <p className="text-gray-600">
            General operations and management
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl hover:border-blue-600 transition-all duration-300 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
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
