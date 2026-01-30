import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (employeeId, username, password) => {
    const demoUsers = [
      { 
        id: 1, 
        employeeId: 'EMP-AFN-001',
        username: 'john_doe',
        name: 'John Doe', 
        password: 'password123', 
        department: 'admin-finance',
        departmentName: 'Admin & Finance',
        position: 'Finance Manager',
        lineManager: 'Jonas Aryeh',
        workAnniversary: 'Feb 1st',
        timeInCompany: '2 years 3 months',
      },
      { 
        id: 2, 
        employeeId: 'EMP-TEC-001',
        username: 'sarah_tech',
        name: 'Sarah Johnson', 
        password: 'password123', 
        department: 'technical',
        departmentName: 'Technical',
        position: 'Research Manager',
        lineManager: 'Caleb Harrison',
        workAnniversary: 'Mar 15th',
        timeInCompany: '1 year 8 months',
      },
      { 
        id: 3, 
        employeeId: 'EMP-CRP-001',
        username: 'mike_corp',
        name: 'Mike Williams', 
        password: 'password123', 
        department: 'corporate-affairs',
        departmentName: 'Corporate Affairs',
        position: 'Communications Specialist',
        lineManager: 'Jonas Aryeh',
        workAnniversary: 'Jan 10th',
        timeInCompany: '3 years 2 months',
      },
      { 
        id: 4, 
        employeeId: 'EMP-DIR-001',
        username: 'emma_dir',
        name: 'Emma Davis', 
        password: 'password123', 
        department: 'directorate',
        departmentName: 'Directorate',
        position: 'Executive Assistant',
        lineManager: 'CEO',
        workAnniversary: 'Sep 5th',
        timeInCompany: '4 years 1 month',
      }
    ];

    const foundUser = demoUsers.find(u => 
      u.employeeId === employeeId && 
      u.username === username && 
      u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    return { success: false, error: 'Invalid Employee ID, Username or Password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasAccessToDepartment = (departmentId) => {
    if (!user) return false;
    // General is accessible to everyone
    if (departmentId === 'general') return true;
    // Users can access their own department
    return user.department === departmentId;
  };

  const value = {
    user,
    login,
    logout,
    hasAccessToDepartment,
    loading
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}