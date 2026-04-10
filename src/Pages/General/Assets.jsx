import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, X, Search, Eye, Archive, ArchiveRestore, Download, FileSpreadsheet, Edit, Home, ChevronRight, Monitor, Armchair, Car, Wrench, LayoutGrid } from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config/api';

const CATEGORY_CONFIG = {
  'Electronics': { icon: Monitor, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Furniture': { icon: Armchair, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Vehicles': { icon: Car, color: 'bg-green-50 text-green-700 border-green-200' },
  'Equipment': { icon: Wrench, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Other': { icon: Package, color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [editMode, setEditMode] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', category: '', description: '', modelNumber: '', serialNumber: '',
    purchaseDate: '', assignedTo: '', location: '', condition: 'Good', notes: '', image: null
  });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/assets`, { headers: getAuthHeaders() });
      const data = await response.json();
      if (data.success) setAssets(data.data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image too large. Max 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let { width, height } = img;
        const maxSize = 400;
        if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        canvas.width = width; canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.5);
        if (compressed.length > 500000) { alert('Image too large after compression. Try a smaller image.'); return; }
        setFormData({ ...formData, image: compressed });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/assets`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) { setShowModal(false); resetForm(); fetchAssets(); }
      else alert(data.message || 'Failed');
    } catch { alert('Error creating asset'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/assets/${editingAsset.id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) { setShowModal(false); setEditMode(false); setEditingAsset(null); resetForm(); fetchAssets(); }
      else alert(data.message || 'Failed');
    } catch { alert('Error updating asset'); }
    finally { setLoading(false); }
  };

  const resetForm = () => setFormData({
    name: '', category: '', description: '', modelNumber: '', serialNumber: '',
    purchaseDate: '', assignedTo: '', location: '', condition: 'Good', notes: '', image: null
  });

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this asset?')) return;
    try {
      const res = await fetch(`${API_URL}/api/assets/${id}/archive`, { method: 'PUT', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) fetchAssets();
    } catch { alert('Error archiving'); }
  };

  const handleUnarchive = async (id) => {
    if (!window.confirm('Unarchive this asset?')) return;
    try {
      const res = await fetch(`${API_URL}/api/assets/${id}/unarchive`, { method: 'PUT', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) fetchAssets();
    } catch { alert('Error unarchiving'); }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name, category: asset.category, description: asset.description || '',
      modelNumber: asset.model_number || '', serialNumber: asset.serial_number || '',
      purchaseDate: asset.purchase_date ? asset.purchase_date.split('T')[0] : '',
      assignedTo: asset.assigned_to || '', location: asset.location || '',
      condition: asset.condition, notes: asset.notes || '', image: asset.image || null
    });
    setEditMode(true); setShowModal(true);
  };

  const handleExportExcel = () => {
    const data = filteredAssets.map(a => ({
      'Asset ID': a.asset_id || '', 'Name': a.name, 'Category': a.category,
      'Location': a.location || '', 'Status': a.status, 'Assigned To': a.assigned_to || '',
      'Condition': a.condition || '', 'Serial No': a.serial_number || '', 'Model No': a.model_number || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assets');
    XLSX.writeFile(wb, `Assets_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    const headers = ['Asset ID', 'Name', 'Category', 'Location', 'Status', 'Assigned To', 'Condition', 'Serial No', 'Model No'];
    const rows = filteredAssets.map(a => [
      a.asset_id || '', a.name, a.category, a.location || '', a.status,
      a.assigned_to || '', a.condition || '', a.serial_number || '', a.model_number || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Assets_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  // Stats
  const activeAssets = assets.filter(a => a.status !== 'archived');
  const stats = {
    total: assets.length,
    active: activeAssets.length,
    archived: assets.filter(a => a.status === 'archived').length,
  };

  // Category breakdown (active only)
  const categoryStats = Object.keys(CATEGORY_CONFIG).map(cat => ({
    name: cat,
    count: activeAssets.filter(a => a.category === cat).length,
    ...CATEGORY_CONFIG[cat]
  }));

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.asset_id && a.asset_id.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === 'current' ? a.status !== 'archived' : a.status === 'archived';
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesTab && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 hover:text-gray-900">
            <Home className="w-4 h-4" /> Dashboard
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button onClick={() => navigate('/corporate-affairs')} className="text-gray-500 hover:text-gray-900">Corporate Affairs</button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Assets</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Asset Management</h1>
            <p className="text-gray-500 text-sm mt-1">Track and manage all GoGMI assets</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => { setEditMode(false); resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors">
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Assets', value: stats.total, icon: Package, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Active', value: stats.active, icon: Package, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Archived', value: stats.archived, icon: Archive, bg: 'bg-gray-100', iconColor: 'text-gray-600' },
          ].map(({ label, value, icon: Icon, bg, iconColor }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">By Category</h2>
            {categoryFilter !== 'all' && (
              <button onClick={() => setCategoryFilter('all')} className="text-xs text-blue-600 hover:underline">
                Clear filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categoryStats.map(({ name, count, icon: Icon, color }) => (
              <button
                key={name}
                onClick={() => setCategoryFilter(categoryFilter === name ? 'all' : name)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  categoryFilter === name
                    ? 'ring-2 ring-gray-900 border-gray-900'
                    : `${color} hover:opacity-80`
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium">{name}</p>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex gap-1">
              {['current', 'archived'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'current' ? 'Current Assets' : 'Archived'}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab === 'current' ? stats.active : stats.archived}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name or asset ID..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Loading assets...</p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No assets found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Asset ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {asset.image ? (
                            <img src={asset.image} alt={asset.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{asset.name}</p>
                            <p className="text-xs text-gray-400">{asset.condition || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {asset.asset_id || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{asset.category}</td>
                      <td className="px-6 py-4 text-gray-600">{asset.location || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{asset.assigned_to || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          asset.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' :
                          'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEdit(asset)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedAsset(asset); setShowViewModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {asset.status === 'archived' ? (
                            <button onClick={() => handleUnarchive(asset.id)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Unarchive">
                              <ArchiveRestore className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleArchive(asset.id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Archive">
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">{filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}{categoryFilter !== 'all' ? ` in ${categoryFilter}` : ''}</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{editMode ? 'Edit Asset' : 'Add New Asset'}</h2>
                {editMode && <p className="text-xs text-gray-400 mt-0.5">{editingAsset?.asset_id}</p>}
              </div>
              <button onClick={() => { setShowModal(false); setEditMode(false); setEditingAsset(null); resetForm(); }} className="p-1.5 hover:bg-gray-100 rounded-md">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={editMode ? handleUpdate : handleSubmit} className="p-6">
              {/* Image Upload */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <img src={formData.image} className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 flex-shrink-0">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-600" />
                    <p className="text-xs text-gray-400 mt-1">Compressed to 400px max, 50% quality</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Name *', name: 'name', type: 'text', required: true, span: 1 },
                  { label: 'Model Number', name: 'modelNumber', type: 'text', span: 1 },
                  { label: 'Serial Number', name: 'serialNumber', type: 'text', span: 1 },
                  { label: 'Purchase Date', name: 'purchaseDate', type: 'date', span: 1 },
                  { label: 'Assigned To', name: 'assignedTo', type: 'text', span: 1 },
                ].map(({ label, name, type, required, span }) => (
                  <div key={name} className={span === 2 ? 'col-span-2' : ''}>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                    <input type={type} name={name} value={formData[name]} onChange={handleChange} required={required}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                    <option value="">Select</option>
                    {Object.keys(CATEGORY_CONFIG).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
                  <select name="location" value={formData.location} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                    <option value="">Select</option>
                    {['Finance and Admin', 'Technical Department', 'Corporate Affairs', 'Directorate', 'Main Office'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Condition</label>
                  <select name="condition" value={formData.condition} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                    {['Excellent', 'Good', 'Fair', 'Poor'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowModal(false); setEditMode(false); setEditingAsset(null); resetForm(); }}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50">
                  {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Asset' : 'Add Asset')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedAsset.name}</h2>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{selectedAsset.asset_id}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1.5 hover:bg-gray-100 rounded-md">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {selectedAsset.image && (
                <img src={selectedAsset.image} className="w-full h-52 object-cover rounded-lg mb-5 border border-gray-200" />
              )}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Category', value: selectedAsset.category },
                  { label: 'Condition', value: selectedAsset.condition },
                  { label: 'Status', value: selectedAsset.status },
                  { label: 'Location', value: selectedAsset.location || '—' },
                  { label: 'Assigned To', value: selectedAsset.assigned_to || '—' },
                  { label: 'Model No', value: selectedAsset.model_number || '—' },
                  { label: 'Serial No', value: selectedAsset.serial_number || '—' },
                  { label: 'Purchase Date', value: selectedAsset.purchase_date ? new Date(selectedAsset.purchase_date).toLocaleDateString() : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm text-gray-900">{value}</p>
                  </div>
                ))}
                {selectedAsset.description && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-sm text-gray-900">{selectedAsset.description}</p>
                  </div>
                )}
                {selectedAsset.notes && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-gray-900">{selectedAsset.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
