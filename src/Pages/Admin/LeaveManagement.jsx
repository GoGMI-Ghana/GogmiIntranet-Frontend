import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Filter, Users, FileText, AlertCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchLeaveRequests();
  }, [filterStatus]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all'
        ? `${API_URL}/api/leaves`
        : `${API_URL}/api/leaves?status=${filterStatus}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setLeaveRequests(data.leaves);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (leave, actionType) => {
    setSelectedLeave(leave);
    setAction(actionType);
    setShowModal(true);
    setRejectionReason('');
  };

  const handleSubmitAction = async () => {
    if (action === 'Rejected' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/leaves/${selectedLeave.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action,
          approvedBy: userData.name,
          approvedById: userData.employeeId,
          rejectionReason: action === 'Rejected' ? rejectionReason : null
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Leave request ${action.toLowerCase()} successfully!`);
        setShowModal(false);
        setSelectedLeave(null);
        setRejectionReason('');
        fetchLeaveRequests();
      } else {
        alert(data.message || 'Failed to update leave request');
      }
    } catch (error) {
      alert('Error updating leave request');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
      'Cancelled': 'bg-slate-50 text-slate-600 border-slate-200'
    };
    return colors[status] || colors.Pending;
  };

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(l => l.status === 'Pending').length,
    approved: leaveRequests.filter(l => l.status === 'Approved').length,
    rejected: leaveRequests.filter(l => l.status === 'Rejected').length
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Leave Management
        </h1>
        <p className="text-gray-600">
          Review and manage employee leave requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-slate-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1 font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <Users className="w-7 h-7 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1 font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <Clock className="w-7 h-7 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1 font-medium">Approved</p>
              <p className="text-3xl font-bold text-gray-800">{stats.approved}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-gray-800">{stats.rejected}</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-lg">
              <XCircle className="w-7 h-7 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-700 bg-white"
        >
          <option value="all">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <span className="ml-auto text-sm text-gray-500">
          Showing {leaveRequests.length} {leaveRequests.length === 1 ? 'request' : 'requests'}
        </span>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading leave requests...</p>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No leave requests found</p>
            <p className="text-gray-500 text-sm">
              {filterStatus === 'all' ? 'No requests have been submitted yet' : `No ${filterStatus.toLowerCase()} requests`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{leave.employeeName}</h3>
                      <span className="text-sm text-gray-500 font-mono">({leave.employeeId})</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    
                    {/* Leave Type Badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {leave.leaveType}
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{leave.reason}</p>
                    </div>
                    
                    {/* Date Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{new Date(leave.startDate).toLocaleDateString('en-GB')}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{new Date(leave.endDate).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{leave.numberOfDays}</span>
                        <span>{leave.numberOfDays === 1 ? 'day' : 'days'}</span>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {leave.status === 'Rejected' && leave.rejectionReason && (
                      <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-rose-900 mb-1">Rejection Reason</p>
                            <p className="text-sm text-rose-700">{leave.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Approval/Rejection Info */}
                    {(leave.status === 'Approved' || leave.status === 'Rejected') && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium">{leave.status === 'Approved' ? 'Approved' : 'Rejected'} by</span>
                        <span className="text-gray-700 font-medium">{leave.approvedBy}</span>
                        <span>•</span>
                        <span>{new Date(leave.approvedDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {leave.status === 'Pending' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(leave, 'Approved')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(leave, 'Rejected')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-lg transition-colors font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {action === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500">&times;</span>
              </button>
            </div>

            {/* Request Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Employee</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedLeave.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Leave Type</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedLeave.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Duration</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedLeave.numberOfDays} {selectedLeave.numberOfDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Dates</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(selectedLeave.startDate).toLocaleDateString('en-GB')} - {new Date(selectedLeave.endDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            </div>

            {/* Rejection Reason Input */}
            {action === 'Rejected' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                  placeholder="Please provide a clear reason for rejecting this request..."
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors shadow-sm ${
                  action === 'Approved' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {action === 'Approved' ? 'Approve Request' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}