import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Home, ChevronRight, Calendar, Banknote, Users, FileText, X } from 'lucide-react';
import { API_URL } from '../../config/api';

const NAVY = '#132552';
const RUST = '#8e3400';
const BRAND_GRADIENT = `linear-gradient(135deg, ${NAVY} 0%, ${RUST} 100%)`;

const formatMoney = (amount) =>
  parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const initials = (name = '') =>
  name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const inputClass = 'w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#132552]/15 focus:border-[#132552] transition-colors';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

function Field({ label, required, children }) {
  return (
    <div>
      <label className={labelClass}>
        {label}{required && <span className="text-[#8e3400]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</div>
    </div>
  );
}

export default function Payroll() {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const resetForm = () => {
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
  };

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/payslips`);
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
      const response = await fetch(`${API_URL}/api/users`);
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
      const response = await fetch(`${API_URL}/api/payslips`, {
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
        resetForm();
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

  const totalPayout = payslips.reduce((sum, p) => sum + parseFloat(p.netPay || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors">
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <button onClick={() => navigate('/admin-finance')} className="text-gray-500 hover:text-gray-900 transition-colors">
            Admin &amp; Finance
          </button>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="font-medium" style={{ color: NAVY }}>Payroll</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payroll</h1>
            <p className="text-gray-500 mt-1">Create and manage employee payslips</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
            style={{ background: BRAND_GRADIENT }}
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Close Form' : 'Create Payslip'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Payslips" value={payslips.length} icon={FileText} />
          <StatCard
            label="This Month"
            value={payslips.filter(p => p.month === months[new Date().getMonth()]).length}
            icon={Calendar}
          />
          <StatCard label="Employees" value={employees.length} icon={Users} />
          <div className="rounded-xl p-5 text-white" style={{ background: BRAND_GRADIENT }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wide text-white/70">Total Payout</span>
              <Banknote className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-2xl font-semibold tabular-nums">GH₵{formatMoney(totalPayout)}</div>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl border border-gray-200 mb-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">New Payslip</h2>
              <p className="text-sm text-gray-500 mt-0.5">Select an employee and enter the pay details for this period.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Employee" required>
                  <select
                    value={formData.employeeId}
                    onChange={handleEmployeeSelect}
                    className={inputClass}
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Month" required>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Year" required>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </Field>
              </div>

              {selectedEmployee && (
                <>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                      style={{ background: BRAND_GRADIENT }}
                    >
                      {initials(selectedEmployee.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{selectedEmployee.name}</p>
                      <p className="text-sm text-gray-500 truncate">{selectedEmployee.employeeId} · {selectedEmployee.department}</p>
                    </div>
                  </div>

                  <Section title="Employee Details">
                    <Field label="Cost Centre">
                      <input type="text" name="costCentre" value={formData.costCentre} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Region">
                      <input type="text" name="region" value={formData.region} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Band/Grade">
                      <input type="text" name="band" value={formData.band} onChange={handleChange} placeholder="e.g., Band H" className={inputClass} />
                    </Field>
                    <Field label="Annual Salary">
                      <input type="number" step="0.01" name="annualSalary" value={formData.annualSalary} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="SSNIT No">
                      <input type="text" name="ssnitNo" value={formData.ssnitNo} onChange={handleChange} className={inputClass} />
                    </Field>
                  </Section>

                  <Section title="Earnings">
                    <Field label="Basic Salary Hours">
                      <input type="number" step="0.01" name="basicSalaryHrs" value={formData.basicSalaryHrs} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Basic Salary Amount" required>
                      <input type="number" step="0.01" name="basicSalaryAmount" value={formData.basicSalaryAmount} onChange={handleChange} className={inputClass} required />
                    </Field>
                    <Field label="Bonus">
                      <input type="number" step="0.01" name="bonus" value={formData.bonus} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Other Allowances">
                      <input type="number" step="0.01" name="otherAllowances" value={formData.otherAllowances} onChange={handleChange} className={inputClass} />
                    </Field>

                    <div className="md:col-span-2 flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
                      <span className="text-sm font-medium text-emerald-800">Total Earnings</span>
                      <span className="text-lg font-semibold text-emerald-800 tabular-nums">GH₵{formatMoney(totals.earnings)}</span>
                    </div>
                  </Section>

                  {/* Employer Contributions kept off-form intentionally (values still submitted via formData defaults) */}
                  <div className="hidden">
                    <input type="number" step="0.01" name="employerSSF" value={formData.employerSSF} onChange={handleChange} />
                    <input type="number" step="0.01" name="totalSSF" value={formData.totalSSF} onChange={handleChange} />
                    <input type="number" step="0.01" name="employerPF" value={formData.employerPF} onChange={handleChange} />
                    <input type="number" step="0.01" name="totalPF" value={formData.totalPF} onChange={handleChange} />
                  </div>

                  <Section title="Deductions">
                    <Field label="SSNIT">
                      <input type="number" step="0.01" name="ssnit" value={formData.ssnit} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Income Tax">
                      <input type="number" step="0.01" name="incomeTax" value={formData.incomeTax} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Provident Fund">
                      <input type="number" step="0.01" name="providentFund" value={formData.providentFund} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Loans/Advances">
                      <input type="number" step="0.01" name="loans" value={formData.loans} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Other Deductions">
                      <input type="number" step="0.01" name="otherDeductions" value={formData.otherDeductions} onChange={handleChange} className={inputClass} />
                    </Field>

                    <div className="md:col-span-2 flex items-center justify-between rounded-lg bg-rose-50 border border-rose-100 px-4 py-3">
                      <span className="text-sm font-medium text-rose-800">Total Deductions</span>
                      <span className="text-lg font-semibold text-rose-800 tabular-nums">GH₵{formatMoney(totals.deductions)}</span>
                    </div>
                  </Section>

                  <Section title="Bank Details">
                    <Field label="Bank Name">
                      <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g., BARCLAYS BANK GH LTD" className={inputClass} />
                    </Field>
                    <Field label="Account Number">
                      <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={inputClass} />
                    </Field>
                    <Field label="Taxable Benefits">
                      <input type="number" step="0.01" name="taxableBenefits" value={formData.taxableBenefits} onChange={handleChange} className={inputClass} />
                    </Field>
                  </Section>

                  {/* Net Pay */}
                  <div className="rounded-xl p-6 flex items-center justify-between border-t border-gray-100 pt-6 mt-2" style={{ background: BRAND_GRADIENT }}>
                    <span className="text-white/80 font-medium">Net Pay (Take Home)</span>
                    <span className="text-white text-3xl font-bold tabular-nums">GH₵{formatMoney(totals.netPay)}</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowCreateForm(false); resetForm(); }}
                      className="flex-1 px-5 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: BRAND_GRADIENT }}
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-base font-semibold text-gray-900">All Payslips</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ID..."
                className="pl-9 pr-4 py-2 text-sm w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#132552]/15 focus:border-[#132552] transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div
                className="w-8 h-8 border-2 border-gray-200 rounded-full mx-auto mb-3 animate-spin"
                style={{ borderTopColor: NAVY }}
              />
              <p className="text-sm text-gray-500">Loading payslips...</p>
            </div>
          ) : filteredPayslips.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-gray-100">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                {searchQuery ? 'No payslips found' : 'No payslips yet'}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery ? 'Try a different search term.' : 'Create the first payslip to see it listed here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Gross Pay</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Pay</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayslips.map((payslip) => (
                    <tr key={payslip.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ background: BRAND_GRADIENT }}
                          >
                            {initials(payslip.employeeName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{payslip.employeeName}</p>
                            <p className="text-xs text-gray-500">{payslip.staffNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{payslip.month} {payslip.year}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {payslip.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-gray-900 whitespace-nowrap">
                        GH₵{formatMoney(payslip.totalEarnings)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-semibold whitespace-nowrap" style={{ color: NAVY }}>
                        GH₵{formatMoney(payslip.netPay)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => window.open(`/payslip/${payslip.id}`, '_blank')}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Payslip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
