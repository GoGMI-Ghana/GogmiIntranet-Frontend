
import React, { useState, useEffect } from 'react';
import { Users, Download, Search, Calendar, Globe, Filter, Clock } from 'lucide-react';

const quarters = [
  { id: 'Q1', label: 'Q1', months: 'Jan – Mar' },
  { id: 'Q2', label: 'Q2', months: 'Apr – Jun' },
  { id: 'Q3', label: 'Q3', months: 'Jul – Sep' },
  { id: 'Q4', label: 'Q4', months: 'Oct – Dec' },
];

const years = [2026];

// Only Q1 2026 has data — rest are coming soon
const hasData = (year, quarter) => year === 2026 && quarter === 'Q1';

const ImswgForum = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [filterCountry, setFilterCountry] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');

  useEffect(() => {
    if (hasData(selectedYear, selectedQuarter)) {
      fetchRegistrations();
    } else {
      setRegistrations([]);
      setTotalCount(0);
      setLoading(false);
    }
  }, [selectedYear, selectedQuarter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/imswg/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const countries = ['all', ...new Set(registrations.map(r => r.country).filter(Boolean))];

  let filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || reg.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  filteredRegistrations = filteredRegistrations.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') comparison = new Date(a.created_at) - new Date(b.created_at);
    else if (sortBy === 'name') comparison = (a.full_name || '').localeCompare(b.full_name || '');
    else if (sortBy === 'country') comparison = (a.country || '').localeCompare(b.country || '');
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const countryStats = registrations.reduce((acc, reg) => {
    acc[reg.country] = (acc[reg.country] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(countryStats).sort(([, a], [, b]) => b - a).slice(0, 5);
  const isDataAvailable = hasData(selectedYear, selectedQuarter);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <nav className="text-sm text-gray-500 mb-2">
              <span>Dashboard</span> <span className="mx-2">/</span>
              <span>General</span> <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">IMSWG Forum</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">IMSWG Forum Registrations</h1>
            <p className="text-gray-600 mt-1">
              {selectedYear} · {selectedQuarter} — {quarters.find(q => q.id === selectedQuarter)?.months}
            </p>
          </div>
          {isDataAvailable && (
            <div className="flex gap-3">
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Year & Quarter Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Year */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Year</p>
            <div className="flex gap-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => { setSelectedYear(year); setSelectedQuarter('Q1'); }}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedYear === year ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="h-10 w-px bg-gray-200" />

          {/* Quarter */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Quarter</p>
            <div className="flex gap-2">
              {quarters.map(q => {
                const available = hasData(selectedYear, q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuarter(q.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedQuarter === q.id
                        ? 'bg-blue-600 text-white'
                        : available
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-pointer'
                    }`}
                  >
                    {q.label}
                    <span className="ml-1 text-xs opacity-70">{q.months}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon State */}
      {!isDataAvailable ? (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {selectedYear} {selectedQuarter} — Coming Soon
          </h2>
          <p className="text-gray-500">Registrations for this quarter are not yet available.</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4"><Users className="w-6 h-6 text-blue-600" /></div>
              <p className="text-sm text-gray-600 mb-1">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="p-3 bg-green-50 rounded-lg w-fit mb-4"><Globe className="w-6 h-6 text-green-600" /></div>
              <p className="text-sm text-gray-600 mb-1">Countries Represented</p>
              <p className="text-3xl font-bold text-gray-900">{countries.length - 1}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="p-3 bg-purple-50 rounded-lg w-fit mb-4"><Calendar className="w-6 h-6 text-purple-600" /></div>
              <p className="text-sm text-gray-600 mb-1">Latest Registration</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{registrations[0]?.full_name || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {registrations[0]?.created_at ? new Date(registrations[0].created_at).toLocaleDateString() : ''}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="p-3 bg-orange-50 rounded-lg w-fit mb-4"><Filter className="w-6 h-6 text-orange-600" /></div>
              <p className="text-sm text-gray-600 mb-1">Filtered Results</p>
              <p className="text-3xl font-bold text-gray-900">{filteredRegistrations.length}</p>
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
                    <span className="text-sm text-gray-600">{count} ({Math.round((count / totalCount) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(count / totalCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Countries</option>
                {countries.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex gap-2">
                {['date', 'name', 'country'].map(sort => (
                  <button
                    key={sort}
                    onClick={() => {
                      if (sortBy === sort) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy(sort); setSortOrder('desc'); }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === sort ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    {sortBy === sort && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
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
                    {['Full Name', 'Email', 'WhatsApp', 'Country', 'Position', 'Institution', 'Date'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No registrations found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map(reg => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.whatsapp_number || <span className="text-gray-400">—</span>}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">{reg.country}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{reg.position}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{reg.institution || <span className="text-gray-400">—</span>}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(reg.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImswgForum;
