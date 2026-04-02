import React, { useState, useEffect } from 'react';
import { Users, Download, Search, Globe, DollarSign, UserCheck, AlertTriangle, Mail, Phone, Building2, Briefcase } from 'lucide-react';

const MarineCasualtyCourse = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marine-casualty-course/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    window.open(`${import.meta.env.VITE_API_URL}/api/marine-casualty-course/export/csv?token=${token}`, '_blank');
  };

  const handleExportExcel = () => {
    const token = localStorage.getItem('token');
    window.open(`${import.meta.env.VITE_API_URL}/api/marine-casualty-course/export/excel?token=${token}`, '_blank');
  };

  // Filter and sort
  let filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || reg.registration_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Sort
  filteredRegistrations = filteredRegistrations.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === 'name') {
      comparison = (a.full_name || '').localeCompare(b.full_name || '');
    } else if (sortBy === 'country') {
      comparison = (a.country || '').localeCompare(b.country || '');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Stats
  const stats = {
    total: registrations.length,
    member: registrations.filter(r => r.registration_type === 'member').length,
    nonMember: registrations.filter(r => r.registration_type === 'non-member').length,
    totalRevenue: registrations.reduce((sum, r) => sum + (r.amount_paid || 0), 0)
  };

  const countriesCount = new Set(registrations.map(r => r.country)).size;

  // Get country stats
  const countryStats = registrations.reduce((acc, reg) => {
    acc[reg.country] = (acc[reg.country] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registrations...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Marine Casualty Investigation & Safety Management</h1>
            <p className="text-gray-600 mt-1">5 Days Course | In-Person Training</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Registrations</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Member Rate</p>
          <p className="text-3xl font-bold text-gray-900">{stats.member}</p>
          <p className="text-xs text-gray-500 mt-1">$400 each</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Non-Member Rate</p>
          <p className="text-3xl font-bold text-gray-900">{stats.nonMember}</p>
          <p className="text-xs text-gray-500 mt-1">$500 each</p>
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

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Countries</p>
          <p className="text-3xl font-bold text-gray-900">{countriesCount}</p>
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Countries by Registration</h2>
        <div className="space-y-4">
          {topCountries.map(([country, count]) => (
            <div key={country}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{country}</span>
                <span className="text-sm text-gray-600">{count} ({Math.round((count / stats.total) * 100)}%)</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Registration Types</option>
              <option value="member">Member ($400)</option>
              <option value="non-member">Non-Member ($500)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-2">
            {['date', 'name', 'country'].map(sort => (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">WhatsApp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Institution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No registrations found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {reg.full_name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{reg.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.whatsapp_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                        {reg.country}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{reg.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {reg.institution || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        reg.registration_type === 'member' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {reg.registration_type === 'member' ? 'Member' : 'Non-Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${reg.amount_paid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarineCasualtyCourse;
