import { useNavigate } from 'react-router-dom';
import { GraduationCap, AlertTriangle } from 'lucide-react';

export default function TrainingPrograms() {
  const navigate = useNavigate();

  const courses = [
    {
      id: 'maritime-governance-course',
      name: 'Maritime Governance Course',
      icon: GraduationCap,
      description: 'Course registrations and revenue tracking',
      path: '/general/maritime-governance-course'
    },
    {
      id: 'marine-casualty-course',
      name: 'Marine Casualty Investigation Course',
      icon: AlertTriangle,
      description: 'Investigation & Safety Management registrations',
      path: '/general/marine-casualty-course'
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#132552' }}>
          Training Programs
        </h1>
        <p className="text-gray-600">
          All GoGMI courses and training program registrations
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const Icon = course.icon;
          return (
            <button
              key={course.id}
              onClick={() => navigate(course.path)}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl hover:border-blue-600 transition-all duration-300 text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {course.description}
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
