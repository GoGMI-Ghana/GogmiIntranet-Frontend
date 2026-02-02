import { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Building, Calendar, Edit2, Save, X, Lock, Upload, Camera } from 'lucide-react';
import Layout from '../Components/Layout';

export default function Profile() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(userData.profilePicture || null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '+233 24 123 4567',
    location: userData.location || 'Accra',
    department: userData.department || 'general',
    position: userData.position || 'Employee',
    dateJoined: userData.dateJoined || '2021-02-01',
    employeeId: userData.employeeId || 'EMP-GEN-001',
    bio: userData.bio || '',
    emergencyContact: userData.emergencyContact || '',
    emergencyPhone: userData.emergencyPhone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Profile Picture Upload Handler
  const handleProfilePictureClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  
const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Upload to backend
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userId', userData.id);

    try {
      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setProfilePicture(data.profilePicture);
        
        // Update localStorage
        const updatedUser = { ...userData, profilePicture: data.profilePicture };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        alert('Profile picture updated successfully!');
      } else {
        alert(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture');
    }
};



const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          name: formData.name,
          phoneNumber: formData.phone,
          dateOfBirth: formData.dateOfBirth
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    }
  };







  const handleCancel = () => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '+233 24 123 4567',
      location: userData.location || 'Accra',
      department: userData.department || 'general',
      position: userData.position || 'Employee',
      dateJoined: userData.dateJoined || '2021-02-01',
      employeeId: userData.employeeId || 'EMP-GEN-001',
      bio: userData.bio || '',
      emergencyContact: userData.emergencyContact || '',
      emergencyPhone: userData.emergencyPhone || ''
    });
    setProfilePicture(userData.profilePicture || null);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // In production, this would call an API
    alert('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const getDepartmentName = (dept) => {
    const departments = {
      'general': 'General',
      'admin-finance': 'Admin & Finance',
      'technical': 'Technical',
      'corporate-affairs': 'Corporate Affairs',
      'directorate': 'Directorate'
    };
    return departments[dept] || dept;
   };

  return (
   
 <Layout>
 <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          My Profile
        </h1>
        <p className="text-gray-600">
          View and manage your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {/* Profile Picture Display */}
                <div 
                  onClick={handleProfilePictureClick}
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg overflow-hidden ${
                    isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                  }`}
                  style={profilePicture ? {} : { background: 'linear-gradient(135deg, #132552 0%, #8e3400 100%)' }}
                >
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.name?.split(' ').map(n => n[0]).join('') || 'EN'
                  )}
                </div>
                
                {/* Upload Button Overlay */}
                {isEditing && (
                  <button 
                    onClick={handleProfilePictureClick}
                    className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Click on the photo or camera icon to upload
                </p>
              )}
              <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">{formData.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{formData.position}</p>
              <p className="text-gray-500 text-xs font-mono mt-2">{formData.employeeId}</p>
            </div>

            {/* Quick Info */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Building className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Department</p>
                  <p className="text-gray-900 font-medium">{getDepartmentName(formData.department)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Joined</p>
                  <p className="text-gray-900 font-medium">{new Date(formData.dateJoined).toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Location</p>
                  <p className="text-gray-900 font-medium">{formData.location}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t space-y-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {formData.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {formData.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {formData.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {formData.location}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                />
              ) : (
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 min-h-[100px]">
                  {formData.bio || 'No bio added yet'}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Emergency Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {formData.emergencyContact || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    placeholder="+233 XX XXX XXXX"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {formData.emergencyPhone || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employment Details (Read-only) */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Employment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-mono">
                  {formData.employeeId}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                  {getDepartmentName(formData.department)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                  {formData.position}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Joined
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                  {new Date(formData.dateJoined).toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Employment details can only be updated by HR. Contact your HR department for changes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  Password must be at least 6 characters long
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
 </Layout>
  );
}
