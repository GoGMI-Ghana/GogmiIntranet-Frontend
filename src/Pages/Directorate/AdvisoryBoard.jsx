import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Mail, X, RefreshCw, Clock, CheckCircle, Trash2, Send } from 'lucide-react';
import { API_URL } from '../../config/api';

const POLL_INTERVAL_MS = 15000;

export default function AdvisoryBoard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '' });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchMembers = useCallback(async ({ silent } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/advisory-board`, { headers: getAuthHeaders() });
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
    // Directory members submit their profile from an external link with no
    // login of their own, so we poll instead of relying on a manual refresh.
    const interval = setInterval(() => fetchMembers({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMembers]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    if (!inviteForm.fullName || !inviteForm.email) {
      setInviteError('Full name and email are required');
      return;
    }
    setInviting(true);
    try {
      const response = await fetch(`${API_URL}/api/advisory-board/invite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(inviteForm)
      });
      const data = await response.json();
      if (data.success) {
        setShowInviteModal(false);
        setInviteForm({ fullName: '', email: '' });
        fetchMembers();
      } else {
        setInviteError(data.message || 'Failed to send invite');
      }
    } catch {
      setInviteError('Cannot connect to server. Please make sure the backend is running!');
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/advisory-board/${id}/resend`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      alert(data.message);
    } catch {
      alert('Error resending invite');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this member from the directory?')) return;
    try {
      const response = await fetch(`${API_URL}/api/advisory-board/${id}`, {
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

  const pendingCount = members.filter((m) => m.status === 'Pending').length;
  const completedCount = members.filter((m) => m.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Advisory Board Directory</h1>
            <p className="text-gray-600">{completedCount} member{completedCount !== 1 ? 's' : ''} on file &middot; {pendingCount} invite{pendingCount !== 1 ? 's' : ''} pending</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchMembers()}
              className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white shadow hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #8e3400 0%, #b54400 100%)' }}
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading directory...</div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
              <Users className="w-10 h-10 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No members yet</h2>
            <p className="text-gray-500 mb-6">Invite an advisory board member to start building the directory.</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #8e3400 0%, #b54400 100%)' }}
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() => member.status === 'Completed' && setSelectedMember(member)}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all ${
                  member.status === 'Completed'
                    ? 'border-green-500 hover:shadow-xl cursor-pointer'
                    : 'border-amber-400'
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
                    <div className="mt-2">
                      {member.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Profile complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Awaiting response
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {member.status === 'Pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleResend(member.id); }}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-2.5 py-1.5"
                    >
                      <Send className="w-3 h-3" /> Resend invite
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-md px-2.5 py-1.5"
                    >
                      <Trash2 className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Invite Advisory Board Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              {inviteError && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-3 text-sm text-red-700">{inviteError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8e3400]"
                  disabled={inviting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8e3400]"
                    disabled={inviting}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="w-full py-2.5 px-6 rounded-lg font-semibold text-white shadow disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8e3400 0%, #b54400 100%)' }}
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
          </div>
        </div>
      )}

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

            <button
              onClick={() => handleDelete(selectedMember.id)}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-md px-3 py-2"
            >
              <Trash2 className="w-4 h-4" /> Remove from directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
