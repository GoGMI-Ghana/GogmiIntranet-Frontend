import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Printer, Home, ChevronRight } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Layout from '../Components/Layout';
import { API_URL } from '../config/api';

const NAVY = '#132552';
const RUST = '#8e3400';
const BRAND_GRADIENT = `linear-gradient(135deg, ${NAVY} 0%, ${RUST} 100%)`;

const formatMoney = (amount) =>
  parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 text-sm border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function LineItem({ label, value, muted }) {
  return (
    <div className="flex justify-between items-baseline py-1.5">
      <span className={`text-sm ${muted ? 'text-gray-500' : 'text-gray-700'}`}>{label}</span>
      <span className="text-sm font-medium text-gray-900 tabular-nums">GH₵{formatMoney(value)}</span>
    </div>
  );
}

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
      const response = await fetch(`${API_URL}/api/company-settings`);
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
      const response = await fetch(`${API_URL}/api/payslips/${id}`);
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
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: RUST }}></div>
            <p className="text-gray-500 text-sm">Loading payslip...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!payslip) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Payslip not found</p>
            <button
              onClick={() => navigate('/admin-finance/payroll')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
              style={{ background: BRAND_GRADIENT }}
            >
              Back to Payroll
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const hasEmployerContributions =
    parseFloat(payslip.employerSSF || 0) > 0 ||
    parseFloat(payslip.totalSSF || 0) > 0 ||
    parseFloat(payslip.employerPF || 0) > 0 ||
    parseFloat(payslip.totalPF || 0) > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          {/* Breadcrumb + toolbar - hidden when printing */}
          <div className="print:hidden">
            <div className="flex items-center gap-2 text-sm mb-6">
              <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition-colors">
                Payroll
              </button>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <span className="font-medium" style={{ color: NAVY }}>Payslip</span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {payslip.month} {payslip.year} Payslip
                </h1>
                <p className="text-gray-500 mt-1 text-sm">{payslip.employeeName} &middot; {payslip.staffNo}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-shadow"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* Payslip Document */}
          <div id="payslip-content" className="bg-white rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-0 print:rounded-none overflow-hidden">
            {/* Header band */}
            <div className="p-8 text-white" style={{ background: BRAND_GRADIENT }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {companySettings.logoPath ? (
                    <img
                      src={companySettings.logoPath}
                      alt="Company Logo"
                      className="w-16 h-16 object-contain rounded bg-white/10 p-1"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-white/10 flex items-center justify-center text-xs font-semibold tracking-wide">
                      {companySettings.companyAcronym}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold leading-tight">{companySettings.companyName}</h2>
                    <p className="text-sm text-white/70">{companySettings.companyAcronym}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">Pay Advice Slip</p>
                  <p className="text-base font-semibold">{payslip.month} {payslip.year}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Employee Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 mb-8">
                <div>
                  <DetailRow label="Name" value={payslip.employeeName} />
                  <DetailRow label="Staff No" value={payslip.staffNo} />
                  <DetailRow label="Department" value={payslip.department} />
                  <DetailRow label="Region" value={payslip.region} />
                </div>
                <div>
                  <DetailRow label="Bank" value={payslip.bankName || 'N/A'} />
                  <DetailRow label="Acct No" value={payslip.accountNumber || 'N/A'} />
                  <DetailRow label="Cost Centre" value={payslip.costCentre || 'N/A'} />
                  <DetailRow label="Band" value={payslip.band || 'N/A'} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 mb-8 pb-8 border-b border-gray-100">
                <DetailRow label="PSF No" value={payslip.psfNo || 'N/A'} />
                <DetailRow label="Annual Salary" value={`GH₵${formatMoney(payslip.annualSalary)}`} />
              </div>

              {/* Earnings and Deductions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* EARNINGS */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: NAVY }}>Earnings</h3>
                  <div className="rounded-lg border border-gray-100 px-4 py-1 divide-y divide-gray-100">
                    {payslip.basicSalaryHrs && (
                      <LineItem label={`Basic Salary (Hrs: ${payslip.basicSalaryHrs})`} value={payslip.basicSalaryAmount} muted />
                    )}
                    {!payslip.basicSalaryHrs && (
                      <LineItem label="Basic Salary" value={payslip.basicSalaryAmount} />
                    )}
                    {parseFloat(payslip.bonus || 0) > 0 && (
                      <LineItem label="Bonus" value={payslip.bonus} />
                    )}
                    {parseFloat(payslip.otherAllowances || 0) > 0 && (
                      <LineItem label="Other Allowances" value={payslip.otherAllowances} />
                    )}
                  </div>
                  <div className="flex justify-between items-baseline px-4 py-3 mt-2 rounded-lg bg-gray-50">
                    <span className="text-sm font-semibold text-gray-900">Total Earnings</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">GH₵{formatMoney(payslip.totalEarnings)}</span>
                  </div>

                  {hasEmployerContributions && (
                    <div className="mt-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3 text-gray-400">Employer Contributions</h3>
                      <div className="rounded-lg border border-gray-100 px-4 py-1 divide-y divide-gray-100">
                        <LineItem label="Employer SSF" value={payslip.employerSSF} muted />
                        <LineItem label="Total SSF" value={payslip.totalSSF} muted />
                        <LineItem label="PF (Employer)" value={payslip.employerPF} muted />
                        <LineItem label="Total PF" value={payslip.totalPF} muted />
                      </div>
                    </div>
                  )}
                </div>

                {/* DEDUCTIONS */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: RUST }}>Deductions</h3>
                  <div className="rounded-lg border border-gray-100 px-4 py-1 divide-y divide-gray-100">
                    {parseFloat(payslip.ssfEmployee || 0) > 0 && (
                      <LineItem label="SSF Employee" value={payslip.ssfEmployee} />
                    )}
                    {parseFloat(payslip.incomeTax || 0) > 0 && (
                      <LineItem label="Income Tax" value={payslip.incomeTax} />
                    )}
                    {parseFloat(payslip.providentFund || 0) > 0 && (
                      <LineItem label="Provident Fund" value={payslip.providentFund} />
                    )}
                    {parseFloat(payslip.loans || 0) > 0 && (
                      <LineItem label="Loans/Advances" value={payslip.loans} />
                    )}
                    {parseFloat(payslip.otherDeductions || 0) > 0 && (
                      <LineItem label="Other Deductions" value={payslip.otherDeductions} />
                    )}
                  </div>
                  <div className="flex justify-between items-baseline px-4 py-3 mt-2 rounded-lg bg-gray-50">
                    <span className="text-sm font-semibold text-gray-900">Total Deductions</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">GH₵{formatMoney(payslip.totalDeductions)}</span>
                  </div>

                  {parseFloat(payslip.taxableBenefits || 0) > 0 && (
                    <div className="mt-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3 text-gray-400">Benefits In Kind</h3>
                      <div className="rounded-lg border border-gray-100 px-4 py-1">
                        <LineItem label="Taxable Value" value={payslip.taxableBenefits} muted />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* NET PAY */}
              <div className="rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-white" style={{ background: BRAND_GRADIENT }}>
                <span className="font-semibold">Net Pay (Take Home)</span>
                <span className="text-2xl font-bold tabular-nums">GH₵{formatMoney(payslip.netPay)}</span>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-6 mt-8 text-sm text-gray-500">
                <p>Reference No: {payslip.referenceNo}</p>
                <p className="mt-3">In the event of any queries, please contact:</p>
                <p className="font-semibold text-gray-700">Human Resource Department</p>
                <p>{companySettings.hrEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
