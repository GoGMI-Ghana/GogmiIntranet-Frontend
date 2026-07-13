export const API_URL = import.meta.env.VITE_API_URL || 'https://api.intranet.gogmi.org.gh';

export const resolveFileUrl = (filePath) => {
  if (!filePath) return filePath;
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }
  return `${API_URL}${filePath}`;
};
