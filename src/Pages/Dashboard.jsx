import { useState, useEffect } from 'react';
import { LayoutGrid, DollarSign, Wrench, Building2, Briefcase, MapPin, User, Calendar, Clock, Edit2, Search, Bell, Gift, Award, TrendingUp, Users, ChevronRight, Megaphone, Lock, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Department Access Modal States
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  
  
  
  const [verifying, setVerifying] = useState(false);

  // Announcements States
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Employees States
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);



// Calculate time in company
  const calculateTimeInCompany = (joinDate) => {
    if (!joinDate) return 'N/A';
    const start = new Date(joinDate);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  // Format work anniversary date
  const formatAnniversary = (joinDate) => {
    if (!joinDate) return 'N/A';
    const date = new Date(joinDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };


  const [birthdays, setBirthdays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);


  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
    fetchLeaveBalance();
    fetchBirthdays();
    fetchAnniversaries();
    fetchEmployees();



  }, []);

  // Fetch announcements function
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const response = await fetch(`${API_URL}/api/announcements`);
      const data = await response.json();
      
      if (data.success) {
        setAnnouncements(data.announcements.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };


const fetchBirthdays = async () => {
    try {
      const response = await fetch(`${API_URL}/api/birthdays?period=month`);
      const data = await response.json();
      if (data.success) {
        setBirthdays(data.birthdays);
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    }
  };

  const fetchAnniversaries = async () => {
    try {
      const response = await fetch(`${API_URL}/api/anniversaries?period=month`);
      const data = await response.json();
      if (data.success) {
        setAnniversaries(data.anniversaries);
      }
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
    }
  };




  // Fetch leave balance function
  const fetchLeaveBalance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaves/balance/${userData.employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        const updatedBalance = data.balance.map(item => ({
          type: item.type,
          used: item.used,
          total: item.total,
          remaining: item.remaining,
          color: 'bg-blue-600'
        }));
        setLeaveBalance(updatedBalance);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  // Fetch employees function
    const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.users);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const departments = [
    {
      id: 'general',
      name: 'General',
      icon: LayoutGrid,
      path: '/general',
      description: 'General operations and management',
      bgColor: 'bg-slate-700',
      hoverBgColor: 'hover:bg-slate-800',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
      subModules: 6
    },
    {
      id: 'admin-finance',
      name: 'Admin & Finance',
      icon: DollarSign,
      path: '/admin-finance',
      description: 'Administrative and financial operations',
      bgColor: 'bg-gray-700',
      hoverBgColor: 'hover:bg-gray-800',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-700',
      subModules: 6
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: Wrench,
      path: '/technical',
      description: 'Technical operations and support',
      bgColor: 'bg-zinc-700',
      hoverBgColor: 'hover:bg-zinc-800',
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-700',
      subModules: 4
    },
    {
      id: 'corporate-affairs',
      name: 'Corporate Affairs',
      icon: Building2,
      path: '/corporate-affairs',
      description: 'Corporate governance and public relations',
      bgColor: 'bg-neutral-700',
      hoverBgColor: 'hover:bg-neutral-800',
      iconBg: 'bg-neutral-100',
      iconColor: 'text-neutral-700',
      subModules: 4
    },
    {
      id: 'directorate',
      name: 'Directorate',
      icon: Briefcase,
      path: '/directorate',
      description: 'Executive management and strategic oversight',
      bgColor: 'bg-stone-700',
      hoverBgColor: 'hover:bg-stone-800',
      iconBg: 'bg-stone-100',
      iconColor: 'text-stone-700',
      subModules: 3
    }
  ];

  



  const [leaveBalance, setLeaveBalance] = useState([
    { type: 'Annual Leave', used: 0, total: 22, color: 'bg-blue-600' },
    { type: 'Compassionate Leave', used: 0, total: 5, color: 'bg-blue-600' },
    { type: 'Paternity Leave', used: 0, total: 5, color: 'bg-blue-600' },
    { type: 'Sick Leave', used: 0, total: 5, color: 'bg-blue-600' }
  ]);

  const performanceMetrics = [
    { title: 'Documentation of Product Operations workflow and processes', progress: 0, updated: 'Thursday, Dec 18, 2025 at 06:37 pm' },
    { title: 'Learning and Growth', progress: 0, updated: 'Thursday, Dec 18, 2025 at 06:37 pm' }
  ];

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.position && emp.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Category color function for announcements
  const getCategoryColor = (category) => {
    const colors = {
      'Important': 'bg-red-100 text-red-700 border-red-200',
      'General': 'bg-blue-100 text-blue-700 border-blue-200',
      'Event': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[category] || colors.General;
  };

  // Department Access Handler
  const handleDepartmentClick = (dept) => {
    navigate(dept.path);
  };

  // Verify Department Access Code
  const handleVerifyDepartment = async () => {
    if (!departmentCode) {
      setDepartmentError('Please enter the department access code');
      return;
    }

    setVerifying(true);
    setDepartmentError('');

    try {
     const response = await fetch(`${API_URL}/api/verify-department`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: selectedDepartment.id,
          accessCode: departmentCode
        })
      });

      const data = await response.json();

      if (data.success) {
        const verifiedDepts = JSON.parse(localStorage.getItem('verifiedDepartments') || '[]');
        if (!verifiedDepts.includes(selectedDepartment.id)) {
          verifiedDepts.push(selectedDepartment.id);
          localStorage.setItem('verifiedDepartments', JSON.stringify(verifiedDepts));
        }
        
        setShowDepartmentModal(false);
        navigate(selectedDepartment.path);
      } else {
        setDepartmentError(data.message || 'Invalid access code');
      }
    } catch (error) {
      setDepartmentError('Connection error. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Banner */}
      <div className="text-white shadow-lg" style={{ backgroundColor: '#132552' }}>
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 uppercase">
            WELCOME BACK, {userData.name?.toUpperCase() || 'EMPLOYEE'}
          </h1>
          <p className="text-blue-100">
            {userData.position || 'Employee'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - User Info */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 lg:sticky lg:top-20">
              {/* User Avatar */}
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #132552 0%, #8e3400 100%)' }}>
                  {userData.profilePicture ? (<img src={userData.profilePicture} alt={userData.name} className="w-16 h-16 rounded-full object-cover" />) : (userData.name?.split(' ').map(n => n[0]).join('') || 'EN')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {userData.name || 'Enoch Nikoi'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {userData.position || 'Employee'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Employee ID */}
                <div className="p-3 rounded-lg border-2"
                  style={{ 
                    backgroundColor: 'rgba(19, 37, 82, 0.05)',
                    borderColor: '#132552'
                  }}>
                  <p className="text-xs text-gray-600 mb-1 font-medium">Employee ID</p>
                  <p className="font-mono font-bold text-sm"
                    style={{ color: '#132552' }}>
                    {userData.employeeId || 'EMP-GEN-001'}
                  </p>
                </div>

                {/* Department */}
                <div className="p-3 rounded-lg border-2"
                  style={{ 
                    backgroundColor: 'rgba(142, 52, 0, 0.05)',
                    borderColor: '#8e3400'
                  }}>
                  <p className="text-xs text-gray-600 mb-1 font-medium">Department</p>
                  <p className="font-semibold text-sm"
                    style={{ color: '#8e3400' }}>
                    {userData.department === 'admin-finance' ? 'Admin & Finance' :
                     userData.department === 'corporate-affairs' ? 'Corporate Affairs' :
                     userData.department?.charAt(0).toUpperCase() + userData.department?.slice(1) || 'General'}
                  </p>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                    <p className="text-sm font-medium text-gray-900">{userData.location || 'Accra'}</p>
                  </div>
                </div>

               <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Line Manager</p>
                    <p className="text-sm font-medium text-gray-900">{userData.lineManager || 'N/A'}</p>
                  </div>
                </div>
               





                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Work Anniversary</p>
                    <p className="text-sm font-medium text-gray-900">{formatAnniversary(userData.joinDate)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Time in Company</p>
                    <p className="text-sm font-medium text-gray-900">{calculateTimeInCompany(userData.joinDate)}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">Edit Profile</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Recent Announcements Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-yellow-600" />
                  Recent Announcements
                </h2>
              </div>
              
              {loadingAnnouncements ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading announcements...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No announcements yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create one in General → Announcements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(announcement.category)}`}>
                          {announcement.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {announcement.author}</span>
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => navigate('/general/announcements')}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    View all announcements →
                  </button>
                </div>
              )}
            </div>

            {/* Department Overview */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#132552' }}>
                  Department Overview
                </h2>
                <p className="text-gray-600">
                  Select a department to access its modules and tasks
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departments.map((dept) => {
                  const Icon = dept.icon;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => handleDepartmentClick(dept)}
                      className={`relative ${dept.bgColor} ${dept.hoverBgColor} rounded-lg shadow-md hover:shadow-lg p-8 text-left overflow-hidden transition-shadow`}
                    >
                      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full"></div>
                      <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/5 rounded-full"></div>
                      
                      <div className="relative z-10">
                        <div className={`${dept.iconBg} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                          <Icon className={`w-7 h-7 ${dept.iconColor}`} />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">
                          {dept.name}
                        </h3>

                        <p className="text-white/90 text-sm mb-4">
                          {dept.description}
                        </p>

                        <div className="flex items-center space-x-2 text-white/80 text-sm">
                          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                          <span>{dept.subModules} modules available</span>
                        </div>

                        {dept.id !== 'general' && (
                          <div className="absolute top-4 right-4">
                            <Lock className="w-5 h-5 text-white/60" />
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-6 right-6">
                        <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Employee Directory, Birthdays, Anniversaries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Directory */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">All Employees</h3>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employee"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {loadingEmployees ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Loading...</p>
                    </div>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <div key={emp.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(emp.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                          <p className="text-xs text-gray-500 truncate">{emp.position || 'Employee'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-4">No employees found</p>
                  )}
                </div>
              </div>

              {/* Birthdays */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Birthdays</h3>
                <div className="space-y-3">
                  {birthdays.map((birthday, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${birthday.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                        {birthday.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{birthday.name}</p>
                        <p className="text-xs text-gray-500">{birthday.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t text-center">
                  <span className="text-xs text-blue-600 hover:underline cursor-pointer">This week | This month</span>
                </div>
              </div>

              {/* Work Anniversaries */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Work Anniversaries</h3>
                <div className="space-y-3">
                  {anniversaries.map((anniversary, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${anniversary.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{anniversary.name}</p>
                        <p className="text-xs text-gray-500">{anniversary.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t text-center">
                  <span className="text-xs text-blue-600 hover:underline cursor-pointer">Today | This week | This month</span>
                </div>
              </div>
            </div>

            {/* Performance & Leave Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
                  <p className="text-sm"><span className="text-pink-600 font-semibold">Overall Progress:</span> 0%</p>
                </div>
                <div className="space-y-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-900 flex-1">{metric.title}</p>
                        <p className="text-sm font-semibold text-blue-600 ml-3">{metric.progress}%</p>
                      </div>
                      <p className="text-xs text-gray-500">Last updated, {metric.updated}</p>
                      {index < performanceMetrics.length - 1 && <div className="border-t pt-2"></div>}
                    </div>
                  ))}
                  <button className="w-full text-sm text-blue-600 hover:underline text-right">View More</button>
                </div>
              </div>

              {/* Leave Management */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Leave Days</h2>
                <div className="space-y-3">
                  {leaveBalance.map((leave, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{leave.type}</p>
                        <p className="text-sm text-gray-600">
                          {leave.remaining !== undefined ? leave.remaining : (leave.total - leave.used)} of {leave.total} day(s)
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${leave.color} h-2 rounded-full`} 
                          style={{ width: `${((leave.remaining !== undefined ? leave.remaining : (leave.total - leave.used)) / leave.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-sm text-blue-600 hover:underline text-right mt-2">View all</button>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(142, 52, 0, 0.1)' }}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#8e3400' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Quick Tip</h3>
                  <p className="text-gray-600">
                    Click on any department card to access its specific modules and tasks. <span className="font-semibold">General department is open to all.</span> Other departments require a Department Access Code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Access Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Department Access</h3>
              <button
                onClick={() => setShowDepartmentModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Enter the access code for <span className="font-semibold">{selectedDepartment?.name}</span> department
            </p>

            {departmentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{departmentError}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyDepartment()}
                  placeholder="Enter access code"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none"
                  disabled={verifying}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDepartmentModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyDepartment}
                disabled={verifying}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #132552 0%, #8e3400 100%)' }}
              >
                {verifying ? 'Verifying...' : 'Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
