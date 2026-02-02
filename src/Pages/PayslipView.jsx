import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Layout from '../Components/Layout';

export default function PayslipView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState({
    logoUrl: null,
    companyName: 'GULF OF GUINEA MARITIME INSTITUTE',
    companyAcronym: 'GoGMI',
    hrEmail: 'hr@gogmi.org.gh'
  });

  useEffect(() => {
    fetchPayslip();
    fetchCompanySettings();
  }, [id]);

  const fetchCompanySettings = async () => {
    try {
      const response = await fetch('/api/company-settings');
      const data = await response.json();
      
      if (data.success) {
        setCompanySettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    }
  };

  const fetchPayslip = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/payslips/${id}`);
      const data = await response.json();
      if (data.success) {
        setPayslip(data.payslip);
      }
    } catch (error) {
      console.error('Error fetching payslip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('payslip-content');
    const opt = {
      margin: 0.5,
      filename: `Payslip_${payslip.month}_${payslip.year}_${payslip.staffNo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payslip...</p>
        </div>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Payslip not found</p>
          <button
            onClick={() => navigate('/admin-finance/payroll')}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            Back to Payroll
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Action Buttons - Hide when printing */}
      <div className="max-w-4xl mx-auto px-4 mb-4 print:hidden">
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Payslip Document */}
      <div id="payslip-content" className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
        <div className="p-8">
          {/* Header with Logo */}
          <div className="border-b-2 border-gray-800 pb-6 mb-6">
            <div className="flex items-center justify-between">
              {/* Company Logo */}
              <div className="flex items-center gap-4">
                {companySettings.logoPath ? (
                  <img
                    src={companySettings.logoPath}
                    alt="Company Logo"
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 border-2 border-gray-300 rounded flex items-center justify-center text-xs text-gray-400">
                    LOGO
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {companySettings.companyName}
                  </h1>
                  <p className="text-sm text-gray-600">({companySettings.companyAcronym})</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <h2 className="text-xl font-bold text-gray-800">Pay Advice Slip</h2>
            </div>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 text-sm">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Month:</span>
              <span className="text-gray-900">{payslip.month} {payslip.year}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Bank:</span>
              <span className="text-gray-900">{payslip.bankName || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Staff No:</span>
              <span className="text-gray-900">{payslip.staffNo}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Acct No:</span>
              <span className="text-gray-900">{payslip.accountNumber || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Name:</span>
              <span className="text-gray-900">{payslip.employeeName}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Cost Centre:</span>
              <span className="text-gray-900">{payslip.costCentre || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Department:</span>
              <span className="text-gray-900">{payslip.department}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Region:</span>
              <span className="text-gray-900">{payslip.region}</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm border-t border-gray-300 pt-4">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">PSF No:</span>
              <span className="text-gray-900">{payslip.psfNo || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Band:</span>
              <span className="text-gray-900">{payslip.band || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-40">Annual Salary:</span>
              <span className="text-gray-900">GH₵{parseFloat(payslip.annualSalary || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Earnings and Deductions Table */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* LEFT SIDE - EARNINGS */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">EARNINGS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Description</span>
                  <span className="text-gray-700 font-semibold">Amount</span>
                </div>
                
                {payslip.basicSalaryHrs && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Salary (Hrs: {payslip.basicSalaryHrs})</span>
                    <span className="text-gray-900"></span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Basic Salary</span>
                  <span className="text-gray-900">{parseFloat(payslip.basicSalaryAmount).toFixed(2)}</span>
                </div>

                {parseFloat(payslip.bonus || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Bonus</span>
                    <span className="text-gray-900">{parseFloat(payslip.bonus).toFixed(2)}</span>
                  </div>
                )}

                {parseFloat(payslip.otherAllowances || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Other Allowances</span>
                    <span className="text-gray-900">{parseFloat(payslip.otherAllowances).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
                  <span className="text-gray-800">TOTAL EARNINGS</span>
                  <span className="text-gray-900">{parseFloat(payslip.totalEarnings).toFixed(2)}</span>
                </div>

                {/* Employer Contributions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Employer SSF</span>
                    <span className="text-gray-900">{parseFloat(payslip.employerSSF || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total SSF</span>
                    <span className="text-gray-900">{parseFloat(payslip.totalSSF || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">PF (Employer)</span>
                    <span className="text-gray-900">{parseFloat(payslip.employerPF || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total PF</span>
                    <span className="text-gray-900">{parseFloat(payslip.totalPF || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - DEDUCTIONS */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">DEDUCTIONS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Description</span>
                  <span className="text-gray-700 font-semibold">Amount</span>
                </div>

                {parseFloat(payslip.ssfEmployee || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">SSF Employee</span>
                    <span className="text-gray-900">{parseFloat(payslip.ssfEmployee).toFixed(2)}</span>
                  </div>
                )}

                {parseFloat(payslip.incomeTax || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Income Tax</span>
                    <span className="text-gray-900">{parseFloat(payslip.incomeTax).toFixed(2)}</span>
                  </div>
                )}

                {parseFloat(payslip.providentFund || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Provident Fund</span>
                    <span className="text-gray-900">{parseFloat(payslip.providentFund).toFixed(2)}</span>
                  </div>
                )}

                {parseFloat(payslip.loans || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Loans/Advances</span>
                    <span className="text-gray-900">{parseFloat(payslip.loans).toFixed(2)}</span>
                  </div>
                )}

                {parseFloat(payslip.otherDeductions || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Other Deductions</span>
                    <span className="text-gray-900">{parseFloat(payslip.otherDeductions).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
                  <span className="text-gray-800">TOTAL DEDUCTIONS</span>
                  <span className="text-gray-900">{parseFloat(payslip.totalDeductions).toFixed(2)}</span>
                </div>

                {/* NET PAY */}
                <div className="mt-4 p-4 bg-gray-700 rounded">
                  <div className="flex justify-between text-white">
                    <span className="font-bold">NET PAY</span>
                    <span className="font-bold text-lg">{parseFloat(payslip.netPay).toFixed(2)}</span>
                  </div>
                </div>

                {parseFloat(payslip.taxableBenefits || 0) > 0 && (
                  <div className="mt-4 pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Taxable Value of Benefits In Kind</span>
                      <span className="text-gray-900">{parseFloat(payslip.taxableBenefits).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-4 mt-6 text-sm text-gray-600">
            <p>Reference No: {payslip.referenceNo}</p>
            <p className="mt-2">In the event of any queries, please contact:</p>
            <p className="font-semibold">Human Resource Department</p>
            <p>HR Email: {companySettings.hrEmail}</p>
          </div>
        </div>
      </div>
    </div>
 </Layout>
  );
}
