import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import Layout from '../../Components/Layout';

export default function MyLeave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveBalance();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leaves/employee/${userData.employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaveRequests(data.leaves);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leaves/balance/${userData.employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaveBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const numberOfDays = calculateDays(formData.startDate, formData.endDate);

    try {
      const response = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: userData.employeeId,
          employeeName: userData.name,
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          numberOfDays,
          reason: formData.reason
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave request submitted successfully!');
        setShowModal(false);
        setFormData({
          leaveType: 'Annual Leave',
          startDate: '',
          endDate: '',
          reason: ''
        });
        fetchLeaveRequests();
        fetchLeaveBalance();
      } else {
        alert(data.message || 'Failed to submit leave request');
      }
    } catch (error) {
      alert('Error submitting leave request');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/leaves/${leaveId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: userData.employeeId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave request cancelled successfully');
        fetchLeaveRequests();
        fetchLeaveBalance();
      } else {
        alert(data.message || 'Failed to cancel leave request');
      }
    } catch (error) {
      alert('Error cancelling leave request');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Approved': 'bg-green-100 text-green-700 border-green-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
      'Cancelled': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || colors.Pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
   <Layout> 
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          My Leave
        </h1>
        <p className="text-gray-600">
          Manage your leave requests and view your leave balance
        </p>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {leaveBalance.map((balance, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm mb-1">{balance.type}</p>
            <p className="text-3xl font-bold text-gray-700 mb-2">{balance.remaining}</p>
            <p className="text-sm text-gray-500">of {balance.total} days remaining</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Request Leave Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all shadow-md"
        >
          <Calendar className="w-5 h-5" />
          Request Leave
        </button>
      </div>

      {/* Leave Requests History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Leave History</h2>
        </div>

        {leaveRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No leave requests yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all"
            >
              Request Your First Leave
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{leave.leaveType}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{leave.reason}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {leave.numberOfDays} day(s)
                      </div>
                    </div>
                    {leave.status === 'Rejected' && leave.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {leave.rejectionReason}</p>
                      </div>
                    )}
                    {leave.status === 'Approved' && (
                      <div className="mt-2 text-sm text-green-600">
                        Approved by {leave.approvedBy} on {new Date(leave.approvedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    {getStatusIcon(leave.status)}
                    {leave.status === 'Pending' && (
                      <button
                        onClick={() => handleCancel(leave.id)}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Request Leave</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type *
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Compassionate Leave">Compassionate Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Total Days: <strong>{calculateDays(formData.startDate, formData.endDate)}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="Please provide a reason for your leave request..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
 </Layout>
  );
}
