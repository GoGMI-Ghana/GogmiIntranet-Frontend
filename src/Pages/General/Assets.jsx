import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, X, Search, Eye, Archive, ArchiveRestore, Download, FileSpreadsheet, Edit, Home, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config/api';

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
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    modelNumber: '',
    serialNumber: '',
    purchaseDate: '',
    assignedTo: '',
    location: '',
    condition: 'Good',
    notes: '',
    image: null
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/assets`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAssets(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large. Max 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width;
          let height = img.height;
          
          // More aggressive compression - max 400px
          const maxSize = 400;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to 50% quality
          const compressed = canvas.toDataURL('image/jpeg', 0.5);
          
          // Check if still too large (>500KB base64)
          if (compressed.length > 500000) {
            alert('Image still too large after compression. Try a smaller image.');
            return;
          }
          
          setFormData({ ...formData, image: compressed });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/assets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        alert('Asset created!');
        setShowModal(false);
        resetForm();
        fetchAssets();
      } else {
        alert(data.message || 'Failed');
      }
    } catch (error) {
      alert('Error creating asset');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: '', description: '', modelNumber: '', serialNumber: '',
      purchaseDate: '', assignedTo: '', location: '', condition: 'Good', notes: '', image: null
    });
  };

  const handleArchive = async (id) => {
    if (window.confirm('Archive this asset for compliance?')) {
      try {
        const response = await fetch(`${API_URL}/api/assets/${id}/archive`, { 
          method: 'PUT',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('Archived!');
          fetchAssets();
        }
      } catch (error) {
        alert('Error archiving');
      }
    }
  };

  const handleUnarchive = async (id) => {
    if (window.confirm('Unarchive this asset?')) {
      try {
        const response = await fetch(`${API_URL}/api/assets/${id}/unarchive`, { 
          method: 'PUT',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('Unarchived!');
          fetchAssets();
        }
      } catch (error) {
        alert('Error unarchiving');
      }
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      category: asset.category,
      description: asset.description || '',
      modelNumber: asset.model_number || '',
      serialNumber: asset.serial_number || '',
      purchaseDate: asset.purchase_date ? asset.purchase_date.split('T')[0] : '',
      assignedTo: asset.assigned_to || '',
      location: asset.location || '',
      condition: asset.condition,
      notes: asset.notes || '',
      image: asset.image || null
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/assets/${editingAsset.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        alert('Asset updated!');
        setShowModal(false);
        setEditMode(false);
        setEditingAsset(null);
        resetForm();
        fetchAssets();
      } else {
        alert(data.message || 'Failed');
      }
    } catch (error) {
      alert('Error updating asset');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const data = filteredAssets.map(a => ({
      'Asset ID': a.id,
      'Name': a.name,
      'Category': a.category,
      'Location': a.location || '',
      'Status': a.status,
      'Assigned To': a.assigned_to || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assets');
    XLSX.writeFile(wb, `Assets_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    const headers = ['Asset ID', 'Name', 'Category', 'Location', 'Status', 'Assigned To'];
    const rows = filteredAssets.map(a => [
      a.id, a.name, a.category, a.location || '', a.status, a.assigned_to || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Assets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredAssets = assets.filter(a => {
    const matches = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (a.id && a.id.toString().includes(searchQuery));
    const tabMatch = activeTab === 'current' ? a.status !== 'archived' : a.status === 'archived';
    return matches && tabMatch;
  });

  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    archived: assets.filter(a => a.status === 'archived').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button onClick={() => navigate('/corporate-affairs')} className="text-gray-600 hover:text-gray-900 transition-colors">
            Corporate Affairs
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-semibold">Assets</span>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Asset Management</h1>
              <p className="text-gray-600 text-lg">Professional asset tracking with compliance archiving</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm font-medium">
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm font-medium text-gray-700">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm font-medium">
                <Plus className="w-5 h-5" /> Add Asset
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Archived</p>
                <p className="text-3xl font-bold text-gray-900">{stats.archived}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Archive className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('current')} className={`px-4 py-2 font-medium rounded-lg transition-all ${activeTab === 'current' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  Current Assets
                </button>
                <button onClick={() => setActiveTab('archived')} className={`px-4 py-2 font-medium rounded-lg transition-all ${activeTab === 'archived' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  Archived
                </button>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assets found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {asset.image ? (
                            <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-500">#{asset.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{asset.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{asset.location || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${asset.status === 'active' ? 'bg-green-100 text-green-800' : asset.status === 'archived' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(asset)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedAsset(asset); setShowViewModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {asset.status === 'archived' ? (
                            <button onClick={() => handleUnarchive(asset.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Unarchive">
                              <ArchiveRestore className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleArchive(asset.id)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Archive">
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
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{editMode ? "Edit Asset" : "Add Asset"}</h2>
                    <p className="text-gray-600 mt-1">{editMode ? `#${editingAsset?.id}` : "ID auto-generated"}</p>
                  </div>
                  <button onClick={() => { setShowModal(false); setEditMode(false); setEditingAsset(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <form onSubmit={editMode ? handleUpdate : handleSubmit} className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image (Optional - max 400px, compressed)</label>
                    <div className="flex items-center gap-4">
                      {formData.image ? <img src={formData.image} className="w-32 h-32 object-cover rounded-lg border" /> : <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed"><Package className="w-12 h-12 text-gray-400" /></div>}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="flex-1 px-4 py-2 border rounded-lg" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Images are compressed to 400px max and 50% quality</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg" required /></div>
                    <div><label className="block text-sm font-medium mb-2">Category *</label><select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg" required><option value="">Select</option><option>Electronics</option><option>Furniture</option><option>Vehicles</option><option>Equipment</option><option>Other</option></select></div>
                    <div><label className="block text-sm font-medium mb-2">Model Number</label><input type="text" name="modelNumber" value={formData.modelNumber} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Serial Number</label><input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Purchase Date</label><input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Location</label><select name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg"><option value="">Select</option><option>Finance and Admin</option><option>Technical Department</option><option>Corporate Affairs</option><option>Directorate</option><option>Main Office</option></select></div>
                    <div><label className="block text-sm font-medium mb-2">Assigned To</label><input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Condition</label><select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg"><option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option></select></div>
                    <div className="col-span-2"><label className="block text-sm font-medium mb-2">Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 border rounded-lg"></textarea></div>
                    <div className="col-span-2"><label className="block text-sm font-medium mb-2">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full px-4 py-2.5 border rounded-lg"></textarea></div>
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditMode(false); setEditingAsset(null); resetForm(); }} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white disabled:opacity-50">{loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update' : 'Create')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showViewModal && selectedAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAsset.name}</h2>
                    <p className="text-gray-600">#{selectedAsset.id}</p>
                  </div>
                  <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
                </div>
              </div>
              <div className="p-8">
                {selectedAsset.image && <img src={selectedAsset.image} className="w-full h-64 object-cover rounded-lg mb-6 border" />}
                <div className="grid grid-cols-2 gap-6">
                  <div><p className="text-sm text-gray-500">Category</p><p className="text-lg font-medium">{selectedAsset.category}</p></div>
                  <div><p className="text-sm text-gray-500">Status</p><span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${selectedAsset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedAsset.status}</span></div>
                  <div><p className="text-sm text-gray-500">Model</p><p className="text-lg font-medium">{selectedAsset.model_number || '-'}</p></div>
                  <div><p className="text-sm text-gray-500">Serial</p><p className="text-lg font-medium">{selectedAsset.serial_number || '-'}</p></div>
                  <div><p className="text-sm text-gray-500">Location</p><p className="text-lg font-medium">{selectedAsset.location || '-'}</p></div>
                  <div><p className="text-sm text-gray-500">Assigned</p><p className="text-lg font-medium">{selectedAsset.assigned_to || '-'}</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
