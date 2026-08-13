import { useState } from 'react';
import { User, Mail, Phone, Calendar, Globe, Briefcase, MapPin, Linkedin, AlertCircle, CheckCircle } from 'lucide-react';
import { API_URL } from '../config/api';

const POSITION_OPTIONS = [
  'Executive Board Chairman',
  'Director Technical',
  'Director Finance and Administration'
];

// Formats digits as DD/MM/YYYY as the user types, so entering a date of
// birth never requires opening a calendar widget - important for older
// members who found the native calendar picker hard to use, especially
// on mobile.
const formatDobInput = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

// Converts a completed DD/MM/YYYY string to the ISO format the backend
// expects. Returns null if the string is incomplete or not a real date.
const parseDobToISO = (display) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  if (date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day)) {
    return null;
  }
  return `${year}-${month}-${day}`;
};

export default function BoardOfDirectorsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    position: '',
    address: '',
    bio: '',
    linkedIn: '',
    photo: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDobChange = (e) => {
    setFormData({ ...formData, dateOfBirth: formatDobInput(e.target.value) });
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image too large. Max 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let { width, height } = img;
        const maxSize = 400;
        if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        canvas.width = width; canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        setFormData((prev) => ({ ...prev, photo: compressed }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.dateOfBirth || !formData.countryCode || !formData.phoneNumber) {
      setError('Full name, email, date of birth, country code and phone number are required');
      return;
    }

    const isoDateOfBirth = parseDobToISO(formData.dateOfBirth);
    if (!isoDateOfBirth) {
      setError('Please enter a valid date of birth (DD/MM/YYYY)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/board-of-directors/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`.trim(),
          dateOfBirth: isoDateOfBirth
        })
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Submission failed');
      }
    } catch {
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8e3400] transition-all";

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-100">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            Your profile has been submitted and added to the GoGMI Board of Directors directory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8e3400 0%, #b54400 100%)' }}
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/gogmi-logo.png" alt="GoGMI" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-white leading-tight">
              Board of Directors<br />Directory
            </h1>
          </div>
          <p className="text-sm font-medium" style={{ color: '#132552' }}>
            Please complete your profile below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 p-8 space-y-5" style={{ borderColor: '#132552' }}>
          {error && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country Code *</label>
              <input
                type="text"
                inputMode="tel"
                name="countryCode"
                placeholder="+233"
                value={formData.countryCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8e3400] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date of Birth * <span className="text-gray-400 font-normal">(DD/MM/YYYY)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                name="dateOfBirth"
                placeholder="DD/MM/YYYY"
                value={formData.dateOfBirth}
                onChange={handleDobChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8e3400]">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Position / Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select position</option>
                {POSITION_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn / Website</label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="url" name="linkedIn" value={formData.linkedIn} onChange={handleChange} placeholder="https://" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8e3400]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm" />
            {formData.photo && (
              <img src={formData.photo} alt="Preview" className="mt-3 w-20 h-20 rounded-full object-cover border" />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#132552' }}
          >
            {submitting ? 'Submitting...' : 'Submit Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
