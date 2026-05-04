import { useNavigate } from 'react-router-dom';
import { ExternalLink, CreditCard, ArrowLeft } from 'lucide-react';

const PAYMENT_LINKS = [
  {
    name: 'Paystack Dashboard',
    description: 'View transactions, payouts, customers and payment analytics',
    url: 'https://dashboard.paystack.com',
    icon: '🟢',
  },
];

export default function Payments() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin-finance')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin & Finance
          </button>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Admin & Finance · Payments</p>
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Access GoGMI payment platforms and tools</p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {PAYMENT_LINKS.map((link) => (
            
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-6 py-5 hover:shadow-sm hover:border-gray-300 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                  {link.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{link.name}</p>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Links open in a new tab. Contact IT for access credentials.
        </p>
      </div>
    </div>
  );
}
