export const API_URL = import.meta.env.VITE_API_URL || 'https://api.intranet.gogmi.org.gh';

export const resolveFileUrl = (filePath) => {
  if (!filePath) return filePath;
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }
  return `${API_URL}${filePath}`;
};

export const getToken = () => localStorage.getItem('token');

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('verifiedDepartments');
};

// fetch() wrapper: prefixes the API URL, attaches the auth token,
// and sends the user back to login when the session has expired
export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = { ...options.headers };
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401 && token) {
    clearSession();
    window.location.assign('/login');
  }

  return response;
};
