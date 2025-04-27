import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
// Layouts
import AdminLayout from './layouts/AdminLayout';
import MentorLayout from './layouts/MentorLayout';
import StudentLayout from './layouts/StudentLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageMentors from './pages/admin/ManageMentors';
import AdminNotices from './pages/admin/Notices';
import AdminUploadMarks from './pages/admin/UploadMarks';
import AdminAttendance from './pages/admin/Attendance';

// Mentor Pages
import MentorDashboard from './pages/mentor/Dashboard';
import MenteesOverview from './pages/mentor/MenteesOverview';
import MenteeProfile from './pages/mentor/MenteeProfile';
import MentorSessions from './pages/mentor/MentorSessions';
import MentorInternships from './pages/mentor/Internships';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentAttendance from './pages/student/Attendance';
import StudentMarks from './pages/student/Marks';
import StudentLeave from './pages/student/LeaveApplication';
import StudentInternship from './pages/student/Internship';

function App() {
  const { currentUser, loading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Admin Routes */}
      <Route 
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<ManageStudents />} />
        <Route path="/admin/mentors" element={<ManageMentors />} />
        <Route path="/admin/notices" element={<AdminNotices />} />
        <Route path="/admin/marks" element={<AdminUploadMarks />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
      </Route>

      {/* Mentor Routes */}
      <Route 
        element={
          <ProtectedRoute role="mentor">
            <MentorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/mentor/mentees" element={<MenteesOverview />} />
        <Route path="/mentor/mentees/:id" element={<MenteeProfile />} />
        <Route path="/mentor/sessions" element={<MentorSessions />} />
        <Route path="/mentor/internships" element={<MentorInternships />} />
      </Route>

      {/* Student Routes */}
      <Route 
        element={
          <ProtectedRoute role="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/marks" element={<StudentMarks />} />
        <Route path="/student/leave" element={<StudentLeave />} />
        <Route path="/student/internship" element={<StudentInternship />} />
      </Route>

      <Route path="/" element={<Navigate to={getHomeRoute(currentUser?.role)} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Helper Components
interface ProtectedRouteProps {
  role: string;
  children: React.ReactNode;
}

function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  if (!currentUser || currentUser.role !== role) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function getHomeRoute(role?: string) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'mentor':
      return '/mentor';
    case 'student':
      return '/student';
    default:
      return '/login';
  }
}

export default App;