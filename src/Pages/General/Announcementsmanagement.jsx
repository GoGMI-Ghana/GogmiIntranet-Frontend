import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Megaphone, Calendar, User } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    expiryDate: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/announcements/all`);
      const data = await response.json();
      
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingAnnouncement
        ? `${API_URL}/api/announcements/${editingAnnouncement.id}`
        : `${API_URL}/api/announcements`;
      
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        author: userData.name,
        authorId: userData.employeeId
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingAnnouncement ? 'Announcement updated!' : 'Announcement created!');
        setShowModal(false);
        setEditingAnnouncement(null);
        setFormData({
          title: '',
          content: '',
          category: 'General',
          priority: 'Medium',
          expiryDate: ''
        });
        fetchAnnouncements();
      } else {
        alert(data.message || 'Failed to save announcement');
      }
    } catch (error) {
      alert('Error saving announcement');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      expiryDate: announcement.expiryDate ? announcement.expiryDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleToggleActive = async (announcement) => {
    try {
      const response = await fetch(`${API_URL}/api/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !announcement.isActive
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`${API_URL}/api/announcements/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        alert(data.message || 'Failed to delete announcement');
      }
    } catch (error) {
      alert('Error deleting announcement');
      console.error('Error:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Important': 'bg-red-100 text-red-700 border-red-200',
      'General': 'bg-blue-100 text-blue-700 border-blue-200',
      'Event': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[category] || colors.General;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-gray-100 text-gray-700'
    };
    return colors[priority] || colors.Medium;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Announcements Management
        </h1>
        <p className="text-gray-600">
          Create and manage company-wide announcements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Announcements</p>
              <p className="text-2xl font-bold text-gray-700">{announcements.length}</p>
            </div>
            <Megaphone className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl font-bold text-gray-700">
                {announcements.filter(a => a.isActive).length}
              </p>
            </div>
            <Eye className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Important</p>
              <p className="text-2xl font-bold text-gray-700">
                {announcements.filter(a => a.category === 'Important').length}
              </p>
            </div>
            <Megaphone className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-700">
                {announcements.filter(a => {
                  const created = new Date(a.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setFormData({
              title: '',
              content: '',
              category: 'General',
              priority: 'Medium',
              expiryDate: ''
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading && announcements.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No announcements yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all"
            >
              Create Your First Announcement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(announcement.category)}`}>
                        {announcement.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                      {!announcement.isActive && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {announcement.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                      {announcement.expiryDate && (
                        <div className="flex items-center gap-1">
                          <span>Expires:</span>
                          {new Date(announcement.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(announcement)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={announcement.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAnnouncement(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="e.g., Office Closure Notice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="Enter announcement details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="Important">Important</option>
                    <option value="Event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAnnouncement(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}