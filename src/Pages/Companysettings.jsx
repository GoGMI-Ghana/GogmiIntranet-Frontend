import { useState, useEffect } from 'react';
import { Building2, Upload, Save, Eye, Image, Loader } from 'lucide-react';

export default function CompanySettings() {
  const [settings, setSettings] = useState({
    companyName: 'GULF OF GUINEA MARITIME INSTITUTE',
    companyAcronym: 'GoGMI',
    hrEmail: 'hr@gogmi.org.gh',
    logoPath: null
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/company-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size should be less than 2MB');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/company-settings/upload-logo', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSettings({
          ...settings,
          logoPath: data.logoPath
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.message || 'Failed to upload logo');
      }
    } catch (error) {
      setError('Error uploading logo');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/company-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName: settings.companyName,
          companyAcronym: settings.companyAcronym,
          hrEmail: settings.hrEmail
        })
      });

      const data = await response.json();

      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (error) {
      setError('Error saving settings');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Company Settings
        </h1>
        <p className="text-gray-600">
          Configure company information and branding
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">✓ Settings saved successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">✗ {error}</p>
        </div>
      )}

      {/* Settings Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl">
        <div className="space-y-8">
          {/* Company Logo Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Company Logo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`cursor-pointer flex flex-col items-center ${uploading ? 'opacity-50' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-12 h-12 text-gray-400 mb-2 animate-spin" />
                        <span className="text-sm text-gray-600 mb-1">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 mb-1">Click to upload logo</span>
                        <span className="text-xs text-gray-500">PNG, JPG, SVG (max 2MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Preview Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Preview
                </label>
                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                  {settings.logoPath ? (
                    <img
                      src={settings.logoPath}
                      alt="Company Logo"
                      className="max-w-full h-32 object-contain mx-auto"
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Building2 className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">No logo uploaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={settings.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acronym
                </label>
                <input
                  type="text"
                  name="companyAcronym"
                  value={settings.companyAcronym}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HR Contact Email
                </label>
                <input
                  type="email"
                  name="hrEmail"
                  value={settings.hrEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Preview Payslip Header */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Payslip Header Preview
            </h2>

            <div className="border-2 border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-center gap-4">
                {settings.logoPath ? (
                  <img
                    src={settings.logoPath}
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
                    {settings.companyName}
                  </h1>
                  <p className="text-sm text-gray-600">({settings.companyAcronym})</p>
                </div>
              </div>
              <div className="text-center mt-4 pt-4 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Pay Advice Slip</h2>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all shadow-md disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Upload your company logo (PNG, JPG, or SVG format recommended)</li>
          <li>• Logo will appear on all generated payslips for ALL employees</li>
          <li>• Maximum file size: 2MB</li>
          <li>• For best results, use a transparent background logo</li>
          <li>• Recommended dimensions: 300x300 pixels or similar square ratio</li>
          <li>• Logo is stored on the server and visible to all users</li>
        </ul>
      </div>
    </div>
  );
}