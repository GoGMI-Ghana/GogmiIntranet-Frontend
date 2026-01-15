import { useState } from 'react';
import { UserPlus, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterEmployee() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: '',
    location: 'Accra',
    employeeType: 'Full-time',
    contractEndDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (formData.employeeType === 'Contract' && !formData.contractEndDate) {
      setErrorMessage('Contract end date is required for contract employees');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        position: formData.position,
        location: formData.location,
        employeeType: formData.employeeType,
        contractEndDate: formData.employeeType === 'Contract' ? formData.contractEndDate : null
      };

      const response = await fetch('http://localhost:5000/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Employee registered successfully! Employee ID: ${data.user.employeeId}`);
        setGeneratedEmployeeId(data.user.employeeId);
        
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          department: '',
          position: '',
          location: 'Accra',
          employeeType: 'Full-time',
          contractEndDate: ''
        });

        setTimeout(() => {
          setSuccessMessage('');
          setGeneratedEmployeeId('');
        }, 10000);
      } else {
        setErrorMessage(data.message || 'Error registering employee');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('Connection error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gray-700 p-3 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#132552' }}>
                Register New Employee
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Add new employees to the GOGMI Intranet system
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium">{successMessage}</p>
                  {generatedEmployeeId && (
                    <p className="text-green-700 text-sm mt-1">
                      Please save this Employee ID: <span className="font-mono font-bold">{generatedEmployeeId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{errorMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="employee@gogmi.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Type *
                </label>
                <select
                  name="employeeType"
                  value={formData.employeeType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-12"
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-12"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="general">General</option>
                  <option value="admin-finance">Admin & Finance</option>
                  <option value="technical">Technical</option>
                  <option value="corporate-affairs">Corporate Affairs</option>
                  <option value="directorate">Directorate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="e.g., Software Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Office location"
                />
              </div>

              {formData.employeeType === 'Contract' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract End Date *
                  </label>
                  <input
                    type="date"
                    name="contractEndDate"
                    value={formData.contractEndDate}
                    onChange={handleInputChange}
                    required={formData.employeeType === 'Contract'}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> Employee ID will be auto-generated in the format:
              </p>
              <div className="mt-2 space-y-1 text-sm text-blue-700">
                <p>Full-time: GoGMI2010F001, GoGMI2010F002...</p>
                <p>Contract: GoGMI2010C001, GoGMI2010C002...</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    department: '',
                    position: '',
                    location: 'Accra',
                    employeeType: 'Full-time',
                    contractEndDate: ''
                  });
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Register Employee</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}