// Department IDs are what the backend stores and checks; names are for display
export const DEPARTMENTS = [
  { id: 'directorate', name: 'Directorate' },
  { id: 'admin-finance', name: 'Admin & Finance' },
  { id: 'technical', name: 'Technical' },
  { id: 'corporate-affairs', name: 'Corporate Affairs' },
  { id: 'general', name: 'General' }
];

// Older records may hold display names such as "Finance and Administration"
const ALIASES = {
  directorate: 'directorate',
  adminfinance: 'admin-finance',
  adminandfinance: 'admin-finance',
  financeandadmin: 'admin-finance',
  financeandadministration: 'admin-finance',
  administrationandfinance: 'admin-finance',
  technical: 'technical',
  corporateaffairs: 'corporate-affairs',
  general: 'general'
};

// Map any spelling of a department to its ID (unknown values are returned unchanged)
export const normalizeDepartment = (department) => {
  if (!department) return '';
  const key = department.toLowerCase().replace(/[^a-z]/g, '');
  return ALIASES[key] || department;
};

// Directorate can open every department, and General is open to all.
// Must match requireDepartment() in the backend auth middleware.
export const canAccessDepartment = (userDepartment, requiredDepartment) => {
  const userDept = normalizeDepartment(userDepartment);
  const required = normalizeDepartment(requiredDepartment);
  return required === 'general' || userDept === 'directorate' || userDept === required;
};

export const departmentName = (department) => {
  const id = normalizeDepartment(department);
  return DEPARTMENTS.find(d => d.id === id)?.name || department || 'General';
};
