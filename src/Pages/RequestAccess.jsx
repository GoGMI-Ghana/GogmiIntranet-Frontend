import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, IdCard, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config/api';

export default function RequestAccess() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    department: 'general'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.username || !formData.name) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/request-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setCredentials(data.credentials);
      } else {
        setError(data.message || 'Request failed');
      }
    } catch (error) {
      setError('Cannot connect to server. Please make sure the backend is running!');
      console.error('Request access error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex"
      style={{
        background: 'linear-gradient(135deg, #132552 0%, #1a3a6b 50%, #132552 100%)'
      }}>
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20 rounded-full blur-3xl" 
          style={{ background: '#8e3400' }}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-10 rounded-full blur-3xl"
          style={{ background: '#8e3400' }}></div>
      </div>

      {/* Logo - Top Right */}
      <div className="absolute top-8 right-8 z-20">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #132552 0%, #8e3400 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
          <span className="text-white font-bold text-2xl">I</span>
        </div>
      </div>

      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/background.jpeg)',
            filter: 'brightness(0.5)'
          }}>
        </div>
        
        <div className="absolute inset-0" 
          style={{
            background: 'linear-gradient(135deg, rgba(19, 37, 82, 0.7) 0%, rgba(142, 52, 0, 0.4) 100%)'
          }}></div>

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Join Us!
            </h1>
            <div className="w-24 h-1 rounded-full mb-8" 
              style={{ background: '#8e3400' }}></div>
            <p className="text-white/90 text-lg leading-relaxed max-w-md">
              Request access to the company intranet. Only employees with @gogmi.org.gh email addresses can register.
            </p>
          </div>

          <div className="mt-auto">
            <p className="text-white/60 text-sm">
              © 2025 Company Intranet. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Request Access Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Success Message */}
          {success && credentials ? (
            <div 
              className="rounded-2xl p-8 shadow-2xl"
              style={{
                background: 'rgba(19, 37, 82, 0.3)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
              }}>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
                <p className="text-white/70 text-sm">Your credentials have been generated</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <p className="text-xs text-white/60 mb-1">Employee ID</p>
                  <p className="text-white font-mono text-lg">{credentials.employeeId}</p>
                </div>

                <div className="p-4 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <p className="text-xs text-white/60 mb-1">Username</p>
                  <p className="text-white font-mono text-lg">{credentials.username}</p>
                </div>

                <div className="p-4 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <p className="text-xs text-white/60 mb-1">Temporary Password</p>
                  <p className="text-white font-mono text-lg">{credentials.tempPassword}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg mb-6"
                style={{
                  background: 'rgba(234, 179, 8, 0.2)',
                  border: '1px solid rgba(234, 179, 8, 0.3)'
                }}>
                <p className="text-xs text-yellow-200">
                  ⚠️ Please save these credentials! You'll need them to login. Make sure to change your password after first login.
                </p>
              </div>

              <button
                onClick={handleGoToLogin}
                className="w-full py-2.5 px-6 rounded-lg font-semibold text-white text-sm shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #8e3400 0%, #b54400 100%)'
                }}
              >
                Go to Login
              </button>
            </div>
          ) : (
            /* Request Access Form */
            <div 
              className="rounded-2xl p-8 shadow-2xl"
              style={{
                background: 'rgba(19, 37, 82, 0.3)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
              }}>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Request Access</h2>
                <p className="text-white/70 text-sm mt-2">Create your intranet account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="border rounded-lg p-3 flex items-start space-x-2"
                    style={{
                      background: 'rgba(220, 38, 38, 0.2)',
                      borderColor: 'rgba(248, 113, 113, 0.3)'
                    }}>
                    <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-200">{error}</p>
                  </div>
                )}

                {/* Company Email */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">
                    Company Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@gogmi.org.gh"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(142, 52, 0, 0.5)'}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">Only @gogmi.org.gh emails allowed</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(142, 52, 0, 0.5)'}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">
                    Username *
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="john_doe"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(142, 52, 0, 0.5)'}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">
                    Department (Optional)
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm rounded-lg text-white focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    disabled={loading}
                  >
                    <option value="general">General</option>
                    <option value="admin-finance">Admin & Finance</option>
                    <option value="technical">Technical</option>
                    <option value="corporate-affairs">Corporate Affairs</option>
                    <option value="directorate">Directorate</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-6 rounded-lg font-semibold text-white text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-5"
                  style={{
                    background: loading 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'linear-gradient(135deg, #8e3400 0%, #b54400 100%)'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Request Access'}
                </button>
              </form>

              {/* Link to Login */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="text-white/70 hover:text-white text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Already have an account? Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}