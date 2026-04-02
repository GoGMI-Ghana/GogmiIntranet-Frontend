import React, { useState, useEffect } from 'react';
import { Users, Download, Search, DollarSign, UserCheck, Building2, GraduationCap, Briefcase, Award, Crown, Globe, Mail, Phone, Calendar, Eye } from 'lucide-react';

const Memberships = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memberships/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    window.open(`${import.meta.env.VITE_API_URL}/api/memberships/export/csv?token=${token}`, '_blank');
  };

  const handleExportExcel = () => {
    const token = localStorage.getItem('token');
    window.open(`${import.meta.env.VITE_API_URL}/api/memberships/export/excel?token=${token}`, '_blank');
  };

  // Membership type config
  const membershipTypes = {
    'student': { label: 'Student', price: 20, icon: GraduationCap, color: 'blue' },
    'associate': { label: 'Associate', price: 100, icon: Users, color: 'green' },
    'professional': { label: 'Professional', price: 200, icon: Briefcase, color: 'purple' },
    'fellow': { label: 'Fellow', price: 0, icon: Award, color: 'yellow' },
    'institutional': { label: 'Institutional', price: 2000, icon: Building2, color: 'indigo' },
    'corporate': { label: 'Corporate', price: 4000, icon: Crown, color: 'red' },
    'strategic': { label: 'Strategic Partner', price: 0, icon: Globe, color: 'pink' }
  };

  // Filter and sort
  let filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || app.membership_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Sort
  filteredApplications = filteredApplications.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === 'name') {
      comparison = (a.full_name || '').localeCompare(b.full_name || '');
    } else if (sortBy === 'type') {
      comparison = (a.membership_type || '').localeCompare(b.membership_type || '');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Stats
  const stats = {
    total: applications.length,
    individual: applications.filter(a => ['student', 'associate', 'professional', 'fellow'].includes(a.membership_type)).length,
    institutional: applications.filter(a => ['institutional', 'corporate', 'strategic'].includes(a.membership_type)).length,
    totalRevenue: applications.reduce((sum, a) => {
      const type = membershipTypes[a.membership_type];
      return sum + (type?.price || 0);
    }, 0)
  };

  // Type breakdown
  const typeBreakdown = Object.keys(membershipTypes).map(type => ({
    type,
    count: applications.filter(a => a.membership_type === type).length,
    revenue: applications.filter(a => a.membership_type === type).length * membershipTypes[type].price
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Membership Applications</h1>
            <p className="text-gray-600 mt-1">Individual and institutional membership management</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Individual Members</p>
          <p className="text-3xl font-bold text-gray-900">{stats.individual}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Institutional Members</p>
          <p className="text-3xl font-bold text-gray-900">{stats.institutional}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Membership Type Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Membership Type Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {typeBreakdown.map(({ type, count, revenue }) => {
            const config = membershipTypes[type];
            const Icon = config.icon;
            return (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-${config.color}-50 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${config.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{config.label}</p>
                    <p className="text-xs text-gray-500">
                      {config.price > 0 ? `$${config.price}/year` : 'Invitation Only'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Applications:</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                  {revenue > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-semibold text-gray-900">${revenue.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, organization, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Membership Types</option>
              <optgroup label="Individual">
                <option value="student">Student ($20)</option>
                <option value="associate">Associate ($100)</option>
                <option value="professional">Professional ($200)</option>
                <option value="fellow">Fellow (Invitation)</option>
              </optgroup>
              <optgroup label="Institutional">
                <option value="institutional">Institutional ($2,000)</option>
                <option value="corporate">Corporate ($4,000)</option>
                <option value="strategic">Strategic Partner (Invitation)</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-2">
            {['date', 'name', 'type'].map(sort => (
              <button
                key={sort}
                onClick={() => {
                  if (sortBy === sort) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(sort);
                    setSortOrder('desc');
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === sort
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
                {sortBy === sort && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No applications found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const typeConfig = membershipTypes[app.membership_type];
                  const Icon = typeConfig?.icon || Users;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                            {app.full_name?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{app.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${typeConfig?.color}-600`} />
                          <span className={`px-2.5 py-1 text-xs font-medium bg-${typeConfig?.color}-100 text-${typeConfig?.color}-700 rounded-full`}>
                            {typeConfig?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {app.organization_name || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.country}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {typeConfig?.price > 0 ? `$${typeConfig.price}` : 'Invitation'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                    {selectedApp.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedApp.full_name}</h2>
                    <p className="text-gray-600">{membershipTypes[selectedApp.membership_type]?.label} Membership</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{selectedApp.email}</span>
                  </div>
                  {selectedApp.whatsapp_number && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{selectedApp.whatsapp_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>{selectedApp.country}</span>
                  </div>
                  {selectedApp.date_of_birth && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>DOB: {new Date(selectedApp.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedApp.position && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Position/Title</h3>
                  <p className="text-gray-600">{selectedApp.position}</p>
                </div>
              )}

              {selectedApp.organization_name && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Organization</h3>
                  <p className="text-gray-600">{selectedApp.organization_name}</p>
                  {selectedApp.organization_email && (
                    <p className="text-sm text-gray-500 mt-1">Email: {selectedApp.organization_email}</p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Membership Fee</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {membershipTypes[selectedApp.membership_type]?.price > 0 
                        ? `$${membershipTypes[selectedApp.membership_type].price}/year`
                        : 'By Invitation Only'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Applied on</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedApp.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Memberships;
