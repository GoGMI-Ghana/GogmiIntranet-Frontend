import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, IdCard, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    if (!formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
       localStorage.setItem('token', data.token);
       localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Cannot connect to server. Please make sure the backend is running!');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex"
      style={{
        background: 'linear-gradient(135deg, #132552 0%, #1a3a6b 50%, #132552 100%)'
      }}>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20 rounded-full blur-3xl" 
          style={{ background: '#8e3400' }}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-10 rounded-full blur-3xl"
          style={{ background: '#8e3400' }}></div>
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute top-8 right-8 z-20">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #132552 0%, #8e3400 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
         <img src="/gogmi-logo.png" alt="GoGMI" className="w-10 h-10 object-contain" />
        </div>
      </div>

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
              Welcome!
            </h1>
            <div className="w-24 h-1 rounded-full mb-8" 
              style={{ background: '#8e3400' }}></div>
            <p className="text-white/90 text-lg leading-relaxed max-w-md">
              Access the company's Intranet portal. Manage your work, collaborate with teams and stay connected on all updates.
            </p>
          </div>

          <div className="mt-auto">
            <p className="text-white/60 text-sm">
              © 2026 GoGMI Intranet. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          
          <div 
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              background: 'rgba(19, 37, 82, 0.3)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
            }}>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Sign in</h2>
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

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@gogmi.com"
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

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(142, 52, 0, 0.5)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-white/70 hover:text-white transition-colors inline-block"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-6 rounded-lg font-semibold text-white text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'linear-gradient(135deg, #8e3400 0%, #b54400 100%)'
                }}
              >
                {loading ? 'Signing in...' : 'Submit'}
              </button>

              <div className="mt-6 text-center pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">
                  Don't have login credentials?{' '}
                  <button
                    type="button"
                   
                    className="text-white font-semibold hover:underline transition-all"
                    style={{ color: '#8e3400' }}
                  >
                    Contact the Administrator
                  </button>
                </p>
                <p className="text-white/60 text-sm">email : info@gogmi.org.gh</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
