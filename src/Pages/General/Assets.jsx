import { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, Archive, Search, X, Upload, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Assets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('current');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    location: '',
    product: '',
    model: '',
    quantity: 1,
    status: '',
    owner: '',
    purchaseDate: '',
    image: null
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/assets');
      const data = await response.json();

      if (data.success) {
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesTab = activeTab === 'current' ? asset.status !== 'Disposed' : asset.status === 'Disposed';
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.location && asset.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Disposed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  const handleUpload = async () => {
    try {
      const payload = {
        name: formData.product,
        category: formData.owner,
        serialNumber: formData.model,
        purchaseDate: formData.purchaseDate,
        location: formData.location,
        status: formData.status === 'In good condition' ? 'Active' : 
                formData.status === 'Needs repair' ? 'Under Maintenance' : 'Active',
        condition: formData.status === 'In good condition' ? 'Good' : 
                   formData.status === 'Needs repair' ? 'Poor' : 'Good',
        notes: `Quantity: ${formData.quantity}`
      };

      const response = await fetch('http://localhost:5000/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        await fetchAssets();
        setShowUploadModal(false);
        setFormData({
          location: '',
          product: '',
          model: '',
          quantity: 1,
          status: '',
          owner: '',
          purchaseDate: '',
          image: null
        });
        alert('Asset created successfully with ID: ' + data.asset.assetId);
      } else {
        alert('Error creating asset: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Error creating asset');
    }
  };

  const handleArchive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Disposed' ? 'Active' : 'Disposed';
      
      const response = await fetch(`http://localhost:5000/api/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        await fetchAssets();
      }
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/assets/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          await fetchAssets();
          if (showViewModal) {
            setShowViewModal(false);
          }
        }
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleView = (asset) => {
    setSelectedAsset(asset);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getQuantity = (notes) => {
    if (!notes) return 1;
    const match = notes.match(/Quantity: (\d+)/);
    return match ? match[1] : 1;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8 pb-6 bg-gradient-to-r from-gray-700 to-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/general')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Back to General"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Assets Register</h1>
                <p className="text-white/80 text-sm">
                  Track, archive and unarchive company assets with image support and per-location IDs
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Asset</span>
          </button>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl shadow-xl">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-6">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'current'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Current Assets
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'archived'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Archived Assets
                </button>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeTab === 'current' ? 'Current Assets' : 'Archived Assets'}
              </h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {filteredAssets.length} items
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading assets...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Asset ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Owner/Dept
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Purchased
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src="/api/placeholder/80/80"
                          alt={asset.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                          {asset.assetId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{asset.location || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{asset.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{asset.serialNumber || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{getQuantity(asset.notes)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                          {asset.condition === 'Good' ? 'In good condition' : 
                           asset.condition === 'Poor' ? 'Needs repair' : asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{asset.category || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(asset.purchaseDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(asset)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(asset.id, asset.status)}
                            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            title={asset.status === 'Disposed' ? "Unarchive" : "Archive"}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
            )}

            {!loading && filteredAssets.length === 0 && (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No assets found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? 'Try a different search term' : 'Upload your first asset to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Asset</h2>
                <p className="text-sm text-gray-500 mt-1">Asset ID will be auto-generated (AST-001, AST-002...)</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Location</option>
                    <option value="Storage Room">Storage Room</option>
                    <option value="Main Office">Main Office</option>
                    <option value="Executive Office">Executive Office</option>
                    <option value="Conference Room">Conference Room</option>
                    <option value="Reception">Reception</option>
                    <option value="IT Department">IT Department</option>
                    <option value="Finance Department">Finance Department</option>
                    <option value="HR Department">HR Department</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Parking Lot">Parking Lot</option>
                    <option value="Server Room">Server Room</option>
                    <option value="Archive Room">Archive Room</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name/Category
                  </label>
                  <input
                    type="text"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter product name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model/Product No
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Model number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Status</option>
                    <option value="In good condition">In good condition</option>
                    <option value="Needs repair">Needs repair</option>
                    <option value="Under maintenance">Under maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To (Department)
                  </label>
                  <select
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Department</option>
                    <option value="General">General</option>
                    <option value="Admin & Finance">Admin & Finance</option>
                    <option value="Technical">Technical</option>
                    <option value="Corporate Affairs">Corporate Affairs</option>
                    <option value="Directorate">Directorate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                      />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    )}
                    <p className="text-sm text-gray-600">
                      {formData.image ? 'Click to change image' : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG/PNG/GIF/WEBP up to 5MB
                    </p>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Upload Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Asset Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <img
                    src="/api/placeholder/400/300"
                    alt={selectedAsset.name}
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Asset ID</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedAsset.assetId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-lg text-gray-900">{selectedAsset.location || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Product</label>
                  <p className="text-lg text-gray-900">{selectedAsset.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Model</label>
                  <p className="text-lg text-gray-900">{selectedAsset.serialNumber || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-lg text-gray-900">{getQuantity(selectedAsset.notes)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAsset.status)}`}>
                      {selectedAsset.condition === 'Good' ? 'In good condition' : 
                       selectedAsset.condition === 'Poor' ? 'Needs repair' : selectedAsset.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To (Department)</label>
                  <p className="text-lg text-gray-900">{selectedAsset.category || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                  <p className="text-lg text-gray-900">{formatDate(selectedAsset.purchaseDate)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}