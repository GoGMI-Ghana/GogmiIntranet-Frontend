import { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, Trash2, X, Archive, ArchiveRestore } from 'lucide-react';
import { API_URL } from '../../config/api';

const POLL_INTERVAL_MS = 15000;

export default function BoardOfDirectors() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchMembers = useCallback(async ({ silent } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/board-of-directors`, { headers: getAuthHeaders() });
      const data = await response.json();
      if (data.success) {
        setMembers(data.members);
        setError('');
      } else {
        setError(data.message || 'Failed to load directory');
      }
    } catch {
      setError('Cannot connect to server. Please make sure the backend is running!');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    // Members submit their own profile from a public form link with no
    // login of their own, so we poll instead of relying on a manual refresh.
    const interval = setInterval(() => fetchMembers({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMembers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this member from the directory? This cannot be undone - archive instead if they may return.')) return;
    try {
      const response = await fetch(`${API_URL}/api/board-of-directors/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSelectedMember(null);
        fetchMembers();
      }
    } catch {
      alert('Error removing member');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this member? Use this when they are no longer active (e.g. they have left).')) return;
    try {
      const response = await fetch(`${API_URL}/api/board-of-directors/${id}/archive`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSelectedMember(null);
        fetchMembers();
      }
    } catch {
      alert('Error archiving member');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/board-of-directors/${id}/unarchive`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSelectedMember(null);
        fetchMembers();
      }
    } catch {
      alert('Error unarchiving member');
    }
  };

  const currentMembers = members.filter((m) => !m.archived);
  const archivedMembers = members.filter((m) => m.archived);
  const visibleMembers = activeTab === 'current' ? currentMembers : archivedMembers;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Board of Directors Directory</h1>
            <p className="text-gray-600">{currentMembers.length} active member{currentMembers.length !== 1 ? 's' : ''} on file</p>
          </div>
          <button
            onClick={() => fetchMembers()}
            className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {['current', 'archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'current' ? 'Current Members' : 'Archived'}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab === 'current' ? currentMembers.length : archivedMembers.length}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading directory...</div>
        ) : visibleMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
              <Users className="w-10 h-10 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {activeTab === 'current' ? 'No members yet' : 'No archived members'}
            </h2>
            <p className="text-gray-500">
              {activeTab === 'current'
                ? 'Members will appear here as soon as they submit the Board of Directors form.'
                : 'Members you archive will show up here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-xl cursor-pointer transition-all ${
                  member.archived ? 'border-gray-300 opacity-75' : 'border-green-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  {member.photo ? (
                    <img src={member.photo} alt={member.fullName} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-rose-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{member.fullName}</h3>
                    <p className="text-sm text-gray-500 truncate">{member.position || member.email}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {member.archived ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnarchive(member.id); }}
                        className="text-gray-300 hover:text-emerald-600 transition-colors"
                        title="Restore to active directory"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleArchive(member.id); }}
                        className="text-gray-300 hover:text-gray-600 transition-colors"
                        title="Archive (e.g. member has left)"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
                      className="text-gray-300 hover:text-red-600 transition-colors"
                      title="Permanently remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {selectedMember.photo ? (
                <img src={selectedMember.photo} alt={selectedMember.fullName} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
                  <Users className="w-8 h-8 text-rose-600" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedMember.fullName}</h3>
                <p className="text-gray-500">{selectedMember.position}{selectedMember.organization ? ` — ${selectedMember.organization}` : ''}</p>
                {selectedMember.archived && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Archived</span>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-800">{selectedMember.email}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-800">{selectedMember.phoneNumber || '—'}</dd></div>
              <div><dt className="text-gray-500">Date of Birth</dt><dd className="font-medium text-gray-800">{selectedMember.dateOfBirth || '—'}</dd></div>
              <div><dt className="text-gray-500">Gender</dt><dd className="font-medium text-gray-800">{selectedMember.gender || '—'}</dd></div>
              <div><dt className="text-gray-500">Nationality</dt><dd className="font-medium text-gray-800">{selectedMember.nationality || '—'}</dd></div>
              <div><dt className="text-gray-500">Address</dt><dd className="font-medium text-gray-800">{selectedMember.address || '—'}</dd></div>
              {selectedMember.linkedIn && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">LinkedIn / Website</dt>
                  <dd><a href={selectedMember.linkedIn} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{selectedMember.linkedIn}</a></dd>
                </div>
              )}
            </dl>

            {selectedMember.bio && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedMember.bio}</p>
              </div>
            )}

            <div className="flex gap-2">
              {selectedMember.archived ? (
                <button
                  onClick={() => handleUnarchive(selectedMember.id)}
                  className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 border border-emerald-200 rounded-md px-3 py-2"
                >
                  <ArchiveRestore className="w-4 h-4" /> Restore to active directory
                </button>
              ) : (
                <button
                  onClick={() => handleArchive(selectedMember.id)}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-2"
                >
                  <Archive className="w-4 h-4" /> Archive
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedMember.id)}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-md px-3 py-2"
              >
                <Trash2 className="w-4 h-4" /> Remove permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
