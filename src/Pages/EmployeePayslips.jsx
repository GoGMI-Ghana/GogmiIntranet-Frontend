import { useState, useEffect } from 'react';
import { Eye, Download, Calendar, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout';

export default function EmployeePayslips() {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMyPayslips();
  }, []);

  const fetchMyPayslips = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/payslips/employee/${userData.employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        setPayslips(data.payslips);
      }
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Download specific payslip - opens in new tab for download
  const handleDownload = (payslipId) => {
    window.open(`/payslip/${payslipId}`, '_blank');
  };

  const filteredPayslips = payslips.filter(payslip =>
    payslip.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payslip.year.toString().includes(searchQuery)
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
   <Layout>
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          My Payslips
        </h1>
        <p className="text-gray-600">
          View and download your salary payslips
        </p>
      </div>

      {/* Employee Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ background: 'linear-gradient(135deg, #132552 0%, #8e3400 100%)' }}>
            {userData.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
            <p className="text-gray-600">{userData.position || 'Employee'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Employee ID</p>
            <p className="font-mono font-bold text-gray-900">{userData.employeeId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-semibold text-gray-900">
              {userData.department === 'admin-finance' ? 'Admin & Finance' :
               userData.department === 'corporate-affairs' ? 'Corporate Affairs' :
               userData.department?.charAt(0).toUpperCase() + userData.department?.slice(1) || 'General'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Payslips</p>
              <p className="text-2xl font-bold text-gray-700">{payslips.length}</p>
            </div>
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Year</p>
              <p className="text-2xl font-bold text-gray-700">
                {payslips.filter(p => p.year === new Date().getFullYear()).length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Latest Net Pay</p>
              <p className="text-2xl font-bold text-gray-700">
                {payslips.length > 0 
                  ? `GH₵${parseFloat(payslips[0].netPay).toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
            <FileText className="w-10 h-10 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by month or year..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Payslips List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your payslips...</p>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {searchQuery ? 'No payslips found' : 'No payslips available yet'}
            </p>
            <p className="text-sm text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Your payslips will appear here once they are generated'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
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
                {filteredPayslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payslip.month} {payslip.year}</div>
                          <div className="text-xs text-gray-500">{payslip.referenceNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      GH₵{parseFloat(payslip.totalEarnings).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      GH₵{parseFloat(payslip.totalDeductions).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                      GH₵{parseFloat(payslip.netPay).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {payslip.status || 'Approved'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`/payslip/${payslip.id}`, '_blank')}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Payslip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(payslip.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
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

      {/* Info Banner */}
      {payslips.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Need Help?</h3>
              <p className="text-gray-600">
                If you have any questions about your payslip or notice any discrepancies, please contact the HR department at <span className="font-semibold">hr@gogmi.org.gh</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </Layout>
  );
}
