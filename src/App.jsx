import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Components/Layout';
import Login from './Pages/Login';
import RequestAccess from './Pages/RequestAccess';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import Dashboard from './Pages/Dashboard';
import General from './Pages/General';
import Admin from './Pages/Admin';
import Technical from './Pages/Technical';
import Corporate from './Pages/Corporate';
import Directorate from './Pages/Directorate';
import PayslipView from './Pages/PayslipView';
import EmployeePayslips from './Pages/EmployeePayslips';
import CompanySettings from './Pages/Companysettings';
import AnnouncementsManagement from './Pages/General/Announcementsmanagement';
import MyLeave from './Pages/General/MyLeave';
import LeaveManagement from './Pages/Admin/LeaveManagement';
import Profile from './Pages/Profile';
import Settings from './Pages/Settings';

import Policies from './Pages/General/Policies';
import Stakeholders from './Pages/General/Stakeholders';
import Assets from './Pages/General/Assets';
import IMSWG from './Pages/General/IMSWG';
import EmployeeData from './Pages/General/EmployeeData';

import Payroll from './Pages/Admin/Payroll';
import AdminAssets from './Pages/Admin/AdminAssets';
import Budgets from './Pages/Admin/Budgets';
import Procurement from './Pages/Admin/Procurement';
import HR from './Pages/Admin/Hr';

import ResearchWork from './Pages/Technical/ResearchWork';

import CorporateStakeholders from './Pages/Corporate/CorporateStakeholders';
import IT from './Pages/Corporate/IT';
import RegisterEmployee from './Pages/Corporate/RegisterEmployee';

import ExecutiveManagement from './Pages/Directorate/ExecutiveManagement';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/my-payslips" element={
          <ProtectedRoute>
            <EmployeePayslips />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/general" element={
          <ProtectedRoute>
            <Layout>
              <General />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-finance" element={
          <ProtectedRoute>
            <Layout>
              <Admin />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/technical" element={
          <ProtectedRoute>
            <Layout>
              <Technical />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/corporate-affairs" element={
          <ProtectedRoute>
            <Layout>
              <Corporate />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/directorate" element={
          <ProtectedRoute>
            <Layout>
              <Directorate />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/general/policies" element={
          <ProtectedRoute>
            <Layout>
              <Policies />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/general/stakeholders" element={
          <ProtectedRoute>
            <Layout>
              <Stakeholders />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/general/assets" element={
          <ProtectedRoute>
            <Assets />
          </ProtectedRoute>
        } />
        
        <Route path="/general/imswg" element={
          <ProtectedRoute>
            <Layout>
              <IMSWG />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/general/employee-data" element={
          <ProtectedRoute>
            <Layout>
              <EmployeeData />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-finance/payroll" element={
          <ProtectedRoute>
            <Layout>
              <Payroll />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-finance/assets" element={
          <ProtectedRoute>
            <Layout>
              <AdminAssets />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-finance/budgets" element={
          <ProtectedRoute>
            <Layout>
              <Budgets />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-finance/procurement" element={
          <ProtectedRoute>
            <Layout>
              <Procurement />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-finance/hr" element={
          <ProtectedRoute>
            <Layout>
              <HR />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/technical/research-work" element={
          <ProtectedRoute>
            <Layout>
              <ResearchWork />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/corporate-affairs/register-employee" element={
          <ProtectedRoute>
            <Layout>
              <RegisterEmployee />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/corporate-affairs/stakeholders" element={
          <ProtectedRoute>
            <Layout>
              <CorporateStakeholders />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/corporate-affairs/it" element={
          <ProtectedRoute>
            <Layout>
              <IT />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/general/announcements" element={
          <ProtectedRoute>
            <AnnouncementsManagement />
          </ProtectedRoute>
        } />

        <Route path="/payslip/:id" element={
          <ProtectedRoute>
            <PayslipView />
          </ProtectedRoute>
        } />
        
        <Route path="/directorate/executive-management" element={
          <ProtectedRoute>
            <Layout>
              <ExecutiveManagement />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin-finance/settings" element={
          <ProtectedRoute>
            <CompanySettings />
          </ProtectedRoute>
        } />

        <Route path="/general/my-leave" element={
          <ProtectedRoute>
            <MyLeave />
          </ProtectedRoute>
        } />

        <Route path="/admin-finance/leave-management" element={
          <ProtectedRoute>
            <LeaveManagement />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;