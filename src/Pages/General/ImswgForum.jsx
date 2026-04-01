import React, { useState, useEffect } from 'react';
import { Users, Download, Search, Calendar, Globe, Briefcase, Mail, Phone, Filter, ArrowUpDown, Building2, TrendingUp } from 'lucide-react';

const ImswgForum = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [filterCountry, setFilterCountry] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/imswg/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data || []);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    window.open(`${import.meta.env.VITE_API_URL}/api/imswg/export/csv?token=${token}`, '_blank');
  };

  const handleExportExcel = () => {
    const token = localStorage.getItem('token');
    window.open(`${import.meta.env.VITE_API_URL}/api/imswg/export/excel?token=${token}`, '_blank');
  };

  // Get unique countries for filter
  const countries = ['all', ...new Set(registrations.map(r => r.country).filter(Boolean))];

  // Filter and sort
  let filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = filterCountry === 'all' || reg.country === filterCountry;
    
    return matchesSearch && matchesCountry;
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

  // Get country stats
  const countryStats = registrations.reduce((acc, reg) => {
    acc[reg.country] = (acc[reg.country] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const recentRegistrations = [...registrations]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <nav className="text-sm text-gray-500 mb-2">
              <span className="hover:text-gray-700 cursor-pointer">Dashboard</span>
              <span className="mx-2">/</span>
              <span className="hover:text-gray-700 cursor-pointer">General</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">IMSWG Forum 2026</span>
            </nav>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IMSWG Forum 2026
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Comprehensive registration management and analytics</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <Download className="w-5 h-5" />
              CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Download className="w-5 h-5" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Registrations */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Users className="w-8 h-8" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-70" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Total Registrations</p>
          <p className="text-4xl font-bold">{totalCount}</p>
        </div>

        {/* Countries Represented */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Globe className="w-8 h-8" />
            </div>
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Countries</p>
          <p className="text-4xl font-bold">{countries.length - 1}</p>
        </div>

        {/* Latest Registration */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">Latest Registration</p>
          <p className="text-lg font-bold truncate">{recentRegistrations[0]?.full_name || 'N/A'}</p>
          <p className="text-green-100 text-xs mt-1">
            {recentRegistrations[0]?.created_at ? new Date(recentRegistrations[0].created_at).toLocaleDateString() : ''}
          </p>
        </div>

        {/* Filtered Results */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Filter className="w-8 h-8" />
            </div>
          </div>
          <p className="text-orange-100 text-sm font-medium mb-1">Filtered Results</p>
          <p className="text-4xl font-bold">{filteredRegistrations.length}</p>
        </div>
      </div>

      {/* Top Countries Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Top 5 Countries by Registrations
          </h2>
          <div className="space-y-4">
            {topCountries.map(([country, count], index) => (
              <div key={country} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{country}</span>
                    <span className="text-sm font-bold text-blue-600">{count} registrations</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(count / totalCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            Recent Registrations
          </h2>
          <div className="space-y-4">
            {recentRegistrations.map((reg, index) => (
              <div key={reg.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white font-bold">
                    {reg.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{reg.full_name}</p>
                    <p className="text-sm text-gray-600 truncate">{reg.country}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, country, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Country Filter */}
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 appearance-none cursor-pointer bg-white"
            >
              <option value="all">All Countries</option>
              {countries.slice(1).map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Sort by:
          </span>
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
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  sortBy === sort
                    ? 'bg-blue-600 text-white shadow-md'
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
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  { icon: Users, label: 'Full Name' },
                  { icon: Mail, label: 'Email' },
                  { icon: Phone, label: 'WhatsApp' },
                  { icon: Globe, label: 'Country' },
                  { icon: Briefcase, label: 'Position' },
                  { icon: Building2, label: 'Institution' },
                  { icon: Calendar, label: 'Registration Date' }
                ].map(({ icon: Icon, label }) => (
                  <th key={label} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      {label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">No registrations found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg, index) => (
                  <tr key={reg.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-md">
                          {reg.full_name?.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{reg.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {reg.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {reg.whatsapp_number || <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {reg.country}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {reg.position}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {reg.institution || <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(reg.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
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

export default ImswgForum;
