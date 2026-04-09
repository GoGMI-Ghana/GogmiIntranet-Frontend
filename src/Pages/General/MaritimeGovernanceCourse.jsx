import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Search, Filter, X } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function MaritimeGovernanceCourse() {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [searchQuery, selectedType, selectedYear, selectedSection, registrations]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/maritime-course/registrations`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setRegistrations(data.data);
        setFilteredRegistrations(data.data);
        
        // Set available filters from API
        if (data.filters) {
          setAvailableYears(data.filters.years || []);
          setAvailableSections(data.filters.sections || []);
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(reg =>
        reg.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.institution?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(reg => reg.registration_type === selectedType);
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(reg => reg.year === parseInt(selectedYear));
    }

    // Section filter
    if (selectedSection !== 'all') {
      filtered = filtered.filter(reg => reg.section === selectedSection);
    }

    setFilteredRegistrations(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedYear('all');
    setSelectedSection('all');
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedSection !== 'all') params.append('section', selectedSection);
      
      const url = `${API_URL}/api/maritime-course/export/csv?${params.toString()}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `maritime_governance_${selectedYear}_${selectedSection}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedSection !== 'all') params.append('section', selectedSection);
      
      const url = `${API_URL}/api/maritime-course/export/excel?${params.toString()}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `maritime_governance_${selectedYear}_${selectedSection}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const stats = {
    total: filteredRegistrations.length,
    member: filteredRegistrations.filter(r => r.registration_type === 'Member').length,
    nonMember: filteredRegistrations.filter(r => r.registration_type === 'Non-Member').length,
    revenue: filteredRegistrations.reduce((sum, r) => sum + (parseFloat(r.amount_paid) || 0), 0),
    countries: new Set(filteredRegistrations.map(r => r.country)).size
  };

  const hasActiveFilters = selectedType !== 'all' || selectedYear !== 'all' || selectedSection !== 'all' || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Maritime Governance Course</h1>
          <p className="text-gray-600">Track registrations and revenue (Member: $350, Non-Member: $450)</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Registrations</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Member</div>
            <div className="text-2xl font-bold text-blue-600 mt-2">{stats.member}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Non-Member</div>
            <div className="text-2xl font-bold text-purple-600 mt-2">{stats.nonMember}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600 mt-2">${stats.revenue.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Countries</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{stats.countries}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sections</option>
              {availableSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Member">Member ($350)</option>
              <option value="Non-Member">Non-Member ($450)</option>
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading registrations...</p>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No registrations found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.country}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{reg.institution || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reg.registration_type === 'Member'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {reg.registration_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.year || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.section || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${reg.amount_paid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
