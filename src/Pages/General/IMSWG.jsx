import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, Globe, Briefcase, Mail, Phone, Download, Search, Filter, Grid, List, Eye } from 'lucide-react';

const Imswg = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/imswg/applications`, {
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

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/imswg/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchApplications();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Filter and search
  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  // Get countries count
  const countriesCount = new Set(applications.map(a => a.country)).size;

  // Get areas of interest stats
  const areasOfInterest = applications.reduce((acc, app) => {
    if (app.area_of_interest) {
      const areas = app.area_of_interest.split(',').map(a => a.trim());
      areas.forEach(area => {
        acc[area] = (acc[area] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const topAreas = Object.entries(areasOfInterest)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

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
            <nav className="text-sm text-gray-500 mb-2">
              <span>Dashboard</span>
              <span className="mx-2">/</span>
              <span>General</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">IMSWG</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">IMSWG Member Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage membership applications</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              {viewMode === 'grid' ? 'Table View' : 'Grid View'}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Countries</p>
          <p className="text-3xl font-bold text-gray-900">{countriesCount}</p>
        </div>
      </div>

      {/* Top Areas of Interest */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Areas of Interest</h2>
        <div className="space-y-4">
          {topAreas.map(([area, count]) => (
            <div key={area}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{area}</span>
                <span className="text-sm text-gray-600">{count} members</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(count / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, country, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
                    {app.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{app.full_name}</h3>
                    <p className="text-sm text-gray-600 truncate">{app.position}</p>
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full mt-2 ${
                      app.status === 'approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{app.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>{app.country}</span>
                  </div>
                  {app.institution && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span className="truncate">{app.institution}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedApplication(app);
                    setShowModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No applications found</p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.country}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{app.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(app.application_date || app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for application details */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                    {selectedApplication.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.full_name}</h2>
                    <p className="text-gray-600">{selectedApplication.position}</p>
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
                    <span>{selectedApplication.email}</span>
                  </div>
                  {selectedApplication.whatsapp_number && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{selectedApplication.whatsapp_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>{selectedApplication.country}</span>
                  </div>
                </div>
              </div>

              {selectedApplication.institution && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Institution</h3>
                  <p className="text-gray-600">{selectedApplication.institution}</p>
                </div>
              )}

              {selectedApplication.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                  <p className="text-gray-600">{selectedApplication.bio}</p>
                </div>
              )}

              {selectedApplication.area_of_interest && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Areas of Interest</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.area_of_interest.split(',').map((area, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {area.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.area_of_expertise && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Areas of Expertise</h3>
                  <p className="text-gray-600">{selectedApplication.area_of_expertise}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Applied on: {new Date(selectedApplication.application_date || selectedApplication.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              {selectedApplication.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <UserX className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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

export default Imswg;
