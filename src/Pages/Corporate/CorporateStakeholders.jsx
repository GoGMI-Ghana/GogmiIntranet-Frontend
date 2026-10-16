import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Building2, Mail, Phone, User, MapPin } from 'lucide-react';

export default function CorporateStakeholders() {
  const [stakeholders, setStakeholders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    position: '',
    email: '',
    phone: '',
    location: '',
    category: '',
    status: 'Active',
    notes: ''
  });

  const categories = [
    'Government Agency',
    'Regulatory Body',
    'Industry Partner',
    'Academic Institution',
    'Media',
    'NGO',
    'International Organization',
    'Private Sector',
    'Other'
  ];

  // Load stakeholders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('corporateStakeholders');
    if (saved) {
      setStakeholders(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  const saveStakeholders = (data) => {
    localStorage.setItem('corporateStakeholders', JSON.stringify(data));
    setStakeholders(data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const newStakeholder = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...stakeholders, newStakeholder];
    saveStakeholders(updated);

    // Reset form
    setFormData({
      name: '',
      organization: '',
      position: '',
      email: '',
      phone: '',
      location: '',
      category: '',
      status: 'Active',
      notes: ''
    });

    setShowAddModal(false);
    setLoading(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this stakeholder?')) {
      const updated = stakeholders.filter(s => s.id !== id);
      saveStakeholders(updated);
    }
  };

  const handleView = (stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setShowViewModal(true);
  };

  const filteredStakeholders = stakeholders.filter(stakeholder =>
    stakeholder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stakeholder.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stakeholder.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: stakeholders.length,
    active: stakeholders.filter(s => s.status === 'Active').length,
    inactive: stakeholders.filter(s => s.status === 'Inactive').length,
    government: stakeholders.filter(s => s.category === 'Government Agency').length
  };

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Corporate Stakeholders
          </h1>
          <p className="text-gray-600">
            Manage relationships with corporate stakeholders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Stakeholders</p>
                <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
              </div>
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active</p>
                <p className="text-2xl font-bold text-gray-700">{stats.active}</p>
              </div>
              <User className="w-10 h-10 text-gray-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inactive</p>
                <p className="text-2xl font-bold text-gray-700">{stats.inactive}</p>
              </div>
              <User className="w-10 h-10 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Government</p>
                <p className="text-2xl font-bold text-gray-700">{stats.government}</p>
              </div>
              <Building2 className="w-10 h-10 text-gray-700" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stakeholders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="ml-4 flex items-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Stakeholder
          </button>
        </div>

        {/* Stakeholders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredStakeholders.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'No stakeholders found' : 'No stakeholders yet'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all"
              >
                Add Your First Stakeholder
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStakeholders.map((stakeholder) => (
                    <tr key={stakeholder.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {stakeholder.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{stakeholder.name}</div>
                            <div className="text-sm text-gray-500">{stakeholder.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stakeholder.organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {stakeholder.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stakeholder.email}</div>
                        <div className="text-sm text-gray-500">{stakeholder.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          stakeholder.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {stakeholder.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(stakeholder)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(stakeholder.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Stakeholder Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Stakeholder</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-500">&times;</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization *
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Stakeholder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Stakeholder Modal */}
        {showViewModal && selectedStakeholder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Stakeholder Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-500">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-2xl">
                    {selectedStakeholder.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedStakeholder.name}</h4>
                    <p className="text-gray-600">{selectedStakeholder.position}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Organization</p>
                    <p className="font-semibold text-gray-900">{selectedStakeholder.organization}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {selectedStakeholder.category}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedStakeholder.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedStakeholder.phone || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{selectedStakeholder.location || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedStakeholder.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedStakeholder.status}
                    </span>
                  </div>
                </div>

                {selectedStakeholder.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-900">{selectedStakeholder.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t text-xs text-gray-500">
                  <p>Added: {new Date(selectedStakeholder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="mt-6 w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold text-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}