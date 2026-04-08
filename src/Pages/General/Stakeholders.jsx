import { useState } from 'react';
import { UserPlus, Eye, Trash2, Archive, Search, X, Building2, Users, ChevronDown, MoreHorizontal } from 'lucide-react';

const STAGE_STYLES = {
  'Active Partner': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'Engaged': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  'Prospective': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'Inactive': 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

const LEVEL_STYLES = {
  'High': 'bg-red-50 text-red-700 ring-1 ring-red-200',
  'Medium': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  'Low': 'bg-green-50 text-green-700 ring-1 ring-green-200',
};

const Badge = ({ label, styles }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${styles}`}>
    {label}
  </span>
);

export default function Stakeholders() {
  const [activeTab, setActiveTab] = useState('current');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const [stakeholders, setStakeholders] = useState([
    {
      id: 1, stakeholderId: 'SH-001', logo: null,
      organization: 'Ministry of Transport', type: 'Government',
      stage: 'Engaged', importance: 'High', influence: 'High', interest: 'High',
      owner: 'Corporate Affairs', nextAction: 'Quarterly review meeting',
      contactPerson: 'Dr. Sarah Johnson', email: 'sarah.johnson@mot.gov.gh',
      phone: '+233 24 123 4567', archived: false
    },
    {
      id: 2, stakeholderId: 'SH-002', logo: null,
      organization: 'Ghana Shippers Authority', type: 'Regulatory Body',
      stage: 'Active Partner', importance: 'High', influence: 'Medium', interest: 'High',
      owner: 'General', nextAction: 'Annual conference collaboration',
      contactPerson: 'Prof. Michael Asante', email: 'masante@gsa.gov.gh',
      phone: '+233 26 987 6543', archived: false
    },
    {
      id: 3, stakeholderId: 'SH-003', logo: null,
      organization: 'IMARF', type: 'International Body',
      stage: 'Prospective', importance: 'Medium', influence: 'Medium', interest: 'Medium',
      owner: 'Technical', nextAction: 'Initial consultation meeting',
      contactPerson: 'Dr. Kwame Mensah', email: 'kmensah@imarf.org',
      phone: '+233 30 222 3456', archived: false
    }
  ]);

  const [formData, setFormData] = useState({
    organization: '', type: '', stage: '', importance: '', influence: '',
    interest: '', owner: '', nextAction: '', contactPerson: '', email: '', phone: '', logo: null,
  });

  const filteredStakeholders = stakeholders.filter(s => {
    const matchesTab = activeTab === 'current' ? !s.archived : s.archived;
    const matchesSearch =
      s.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stakeholderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAdd = () => {
    const newS = {
      id: stakeholders.length + 1,
      stakeholderId: `SH-${String(stakeholders.length + 1).padStart(3, '0')}`,
      ...formData, archived: false,
    };
    setStakeholders([newS, ...stakeholders]);
    setShowAddModal(false);
    setFormData({ organization: '', type: '', stage: '', importance: '', influence: '', interest: '', owner: '', nextAction: '', contactPerson: '', email: '', phone: '', logo: null });
  };

  const handleArchive = (id) => {
    setStakeholders(stakeholders.map(s => s.id === id ? { ...s, archived: !s.archived } : s));
    setOpenMenuId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this stakeholder? This action cannot be undone.')) {
      setStakeholders(stakeholders.filter(s => s.id !== id));
    }
    setOpenMenuId(null);
  };

  const InputField = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type={type} name={name} value={formData[name]} placeholder={placeholder}
        onChange={e => setFormData({ ...formData, [name]: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </div>
  );

  const SelectField = ({ label, name, options }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <select
          name={name} value={formData[name]}
          onChange={e => setFormData({ ...formData, [name]: e.target.value })}
          className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">Select</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-8 py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">General · Stakeholders</p>
            <h1 className="text-2xl font-semibold text-gray-900">Stakeholder Register</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Stakeholder
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stakeholders.filter(s => !s.archived).length },
            { label: 'Active Partners', value: stakeholders.filter(s => s.stage === 'Active Partner' && !s.archived).length },
            { label: 'Engaged', value: stakeholders.filter(s => s.stage === 'Engaged' && !s.archived).length },
            { label: 'Prospective', value: stakeholders.filter(s => s.stage === 'Prospective' && !s.archived).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg px-5 py-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex gap-1">
              {['current', 'archived'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search stakeholders..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Organization', 'Type', 'Stage', 'Importance', 'Influence', 'Interest', 'Owner', 'Next Action', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStakeholders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-16 text-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No stakeholders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredStakeholders.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{s.organization}</p>
                            <p className="text-xs text-gray-400">{s.stakeholderId} · {s.contactPerson}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{s.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><Badge label={s.stage} styles={STAGE_STYLES[s.stage]} /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Badge label={s.importance} styles={LEVEL_STYLES[s.importance]} /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Badge label={s.influence} styles={LEVEL_STYLES[s.influence]} /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Badge label={s.interest} styles={LEVEL_STYLES[s.interest]} /></td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{s.owner}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{s.nextAction}</td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === s.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1">
                              <button
                                onClick={() => { setSelectedStakeholder(s); setShowViewModal(true); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> View Details
                              </button>
                              <button
                                onClick={() => handleArchive(s.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4" /> {s.archived ? 'Unarchive' : 'Archive'}
                              </button>
                              <div className="border-t border-gray-100 my-1" />
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">{filteredStakeholders.length} stakeholder{filteredStakeholders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Stakeholder</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2"><InputField label="Organization Name" name="organization" placeholder="e.g. Ghana Ports Authority" /></div>
              <SelectField label="Type" name="type" options={['Government', 'Regulatory Body', 'International Body', 'Professional Body', 'NGO', 'Private Sector', 'Academic Institution']} />
              <SelectField label="Stage" name="stage" options={['Active Partner', 'Engaged', 'Prospective', 'Inactive']} />
              <SelectField label="Importance" name="importance" options={['High', 'Medium', 'Low']} />
              <SelectField label="Influence" name="influence" options={['High', 'Medium', 'Low']} />
              <SelectField label="Interest" name="interest" options={['High', 'Medium', 'Low']} />
              <SelectField label="Owner / Department" name="owner" options={['General', 'Admin & Finance', 'Technical', 'Corporate Affairs', 'Directorate']} />
              <InputField label="Contact Person" name="contactPerson" placeholder="Full name" />
              <InputField label="Email" name="email" type="email" placeholder="email@example.com" />
              <div className="col-span-2"><InputField label="Phone" name="phone" placeholder="+233 XX XXX XXXX" /></div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Next Action</label>
                <textarea
                  name="nextAction" value={formData.nextAction} rows="3"
                  onChange={e => setFormData({ ...formData, nextAction: e.target.value })}
                  placeholder="Describe the next planned action..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
                Add Stakeholder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStakeholder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Stakeholder Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1.5 hover:bg-gray-100 rounded-md">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedStakeholder.organization}</h3>
                  <p className="text-sm text-gray-400">{selectedStakeholder.stakeholderId} · {selectedStakeholder.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Stage', value: <Badge label={selectedStakeholder.stage} styles={STAGE_STYLES[selectedStakeholder.stage]} /> },
                  { label: 'Owner', value: selectedStakeholder.owner },
                  { label: 'Importance', value: <Badge label={selectedStakeholder.importance} styles={LEVEL_STYLES[selectedStakeholder.importance]} /> },
                  { label: 'Influence', value: <Badge label={selectedStakeholder.influence} styles={LEVEL_STYLES[selectedStakeholder.influence]} /> },
                  { label: 'Interest', value: <Badge label={selectedStakeholder.interest} styles={LEVEL_STYLES[selectedStakeholder.interest]} /> },
                  { label: 'Contact', value: selectedStakeholder.contactPerson },
                  { label: 'Email', value: selectedStakeholder.email },
                  { label: 'Phone', value: selectedStakeholder.phone },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm text-gray-900">{value}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Next Action</p>
                  <p className="text-sm text-gray-900">{selectedStakeholder.nextAction}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
