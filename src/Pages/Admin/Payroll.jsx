import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Download, Calendar, DollarSign, Users, FileText } from 'lucide-react';

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('all');
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // UPDATED: Removed fuel, housing, transport, utility, maintenance allowances
  const [formData, setFormData] = useState({
    employeeId: '',
    month: '',
    year: new Date().getFullYear(),
    staffNo: '',
    employeeName: '',
    department: '',
    position: '',
    costCentre: '',
    region: 'Headquarters',
    band: '',
    annualSalary: '',
    basicSalaryHrs: '',
    basicSalaryAmount: '',
    bonus: '',
    otherAllowances: '',
    employerSSF: '',
    totalSSF: '',
    employerPF: '',
    totalPF: '',
    ssnit: '',
    incomeTax: '',
    providentFund: '',
    loans: '',
    otherDeductions: '',
    bankName: '',
    accountNumber: '',
    ssnitNo: '',
    taxableBenefits: ''
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payslips');
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

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.users);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, []);

  const handleEmployeeSelect = (e) => {
    const empId = e.target.value;
    const employee = employees.find(emp => emp.employeeId === empId);
    
    if (employee) {
      setFormData({
        ...formData,
        employeeId: employee.employeeId,
        staffNo: employee.employeeId,
        employeeName: employee.name,
        department: employee.department,
        position: employee.position || '',
        costCentre: employee.costCentre || '',
        band: employee.band || ''
      });        
 setSelectedEmployee(employee);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // UPDATED: Removed allowances from calculation
  const calculateTotals = () => {
    const earnings = parseFloat(formData.basicSalaryAmount || 0) +
                    parseFloat(formData.bonus || 0) +
                    parseFloat(formData.otherAllowances || 0);

    const deductions = parseFloat(formData.ssnit || 0) +
                      parseFloat(formData.incomeTax || 0) +
                      parseFloat(formData.providentFund || 0) +
                      parseFloat(formData.loans || 0) +
                      parseFloat(formData.otherDeductions || 0);

    const netPay = earnings - deductions;

    return { earnings, deductions, netPay };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/payslips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Payslip created successfully!');
        setShowCreateForm(false);
        fetchPayslips();
        // UPDATED: Reset form without allowances
        setFormData({
          employeeId: '',
          month: '',
          year: new Date().getFullYear(),
          staffNo: '',
          employeeName: '',
          department: '',
          position: '',
          costCentre: '',
          region: 'Headquarters',
          band: '',
          annualSalary: '',
          basicSalaryHrs: '',
          basicSalaryAmount: '',
          bonus: '',
          otherAllowances: '',
          employerSSF: '',
          totalSSF: '',
          employerPF: '',
          totalPF: '',
          ssnit: '',
          incomeTax: '',
          providentFund: '',
          loans: '',
          otherDeductions: '',
          bankName: '',
          accountNumber: '',
          ssnitNo: '',
          taxableBenefits: ''
        });
        setSelectedEmployee(null);
      } else {
        alert(data.message || 'Failed to create payslip');
      }
    } catch (error) {
      alert('Error creating payslip');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  const filteredPayslips = payslips.filter(payslip =>
    payslip.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payslip.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Payroll Management
        </h1>
        <p className="text-gray-600">
          Create and manage employee payslips
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-700">
                {payslips.filter(p => p.month === months[new Date().getMonth()]).length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Employees</p>
              <p className="text-2xl font-bold text-gray-700">{employees.length}</p>
            </div>
            <Users className="w-10 h-10 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Payout</p>
              <p className="text-2xl font-bold text-gray-700">
                GH₵{payslips.reduce((sum, p) => sum + parseFloat(p.netPay || 0), 0).toLocaleString()}
              </p>
            </div>
          
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold text-white transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create New Payslip
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Create New Payslip
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={formData.employeeId}
                  onChange={handleEmployeeSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  required
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month *
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  required
                >
                  <option value="">-- Select Month --</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {selectedEmployee && (
              <>
                {/* Employee Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Employee Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost Centre
                      </label>
                      <input
                        type="text"
                        name="costCentre"
                        value={formData.costCentre}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Band/Grade
                      </label>
                      <input
                        type="text"
                        name="band"
                        value={formData.band}
                        onChange={handleChange}
                        placeholder="e.g., Band H"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Salary
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="annualSalary"
                        value={formData.annualSalary}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SSNIT No
                      </label>
                      <input
                        type="text"
                        name="ssnitNo"
                        value={formData.ssnitNo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* EARNINGS SECTION - UPDATED: Only Basic Salary, Bonus, Other Allowances */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Earnings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Basic Salary Hours
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="basicSalaryHrs"
                        value={formData.basicSalaryHrs}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Basic Salary Amount *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="basicSalaryAmount"
                        value={formData.basicSalaryAmount}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonus
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="bonus"
                        value={formData.bonus}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Allowances
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="otherAllowances"
                        value={formData.otherAllowances}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Total Earnings Display */}
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <p className="text-sm font-medium text-gray-600">Total Earnings:</p>
                    <p className="text-2xl font-bold text-gray-800">
                      GH₵{totals.earnings.toFixed(2).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* EMPLOYER CONTRIBUTIONS */}
                <div className="border-t border-gray-200 pt-6 hidden">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Employer Contributions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employer SSF
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="employerSSF"
                        value={formData.employerSSF}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total SSF
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="totalSSF"
                        value={formData.totalSSF}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employer PF
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="employerPF"
                        value={formData.employerPF}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total PF
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="totalPF"
                        value={formData.totalPF}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* DEDUCTIONS SECTION */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Deductions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SSNIT
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="ssnit"
                        value={formData.ssnit}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Income Tax
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="incomeTax"
                        value={formData.incomeTax}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provident Fund
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="providentFund"
                        value={formData.providentFund}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loans/Advances
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="loans"
                        value={formData.loans}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Deductions
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="otherDeductions"
                        value={formData.otherDeductions}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Total Deductions Display */}
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <p className="text-sm font-medium text-gray-600">Total Deductions:</p>
                    <p className="text-2xl font-bold text-gray-800">
                      GH₵{totals.deductions.toFixed(2).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* BANK DETAILS */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="e.g., BARCLAYS BANK GH LTD"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxable Benefits
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="taxableBenefits"
                        value={formData.taxableBenefits}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* NET PAY SUMMARY */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="p-6 bg-gray-700 rounded-lg">
                    <div className="text-center text-white">
                      <p className="text-sm font-medium mb-2">NET PAY (Take Home)</p>
                      <p className="text-4xl font-bold">
                        GH₵{totals.netPay.toFixed(2).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Payslip'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* Payslips List */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">All Payslips</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payslips...</p>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payslips found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payslip.employeeName}</div>
                        <div className="text-sm text-gray-500">{payslip.staffNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payslip.month} {payslip.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payslip.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      GH₵{parseFloat(payslip.totalEarnings).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                      GH₵{parseFloat(payslip.netPay).toLocaleString()}
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
    </div>
  );
}
