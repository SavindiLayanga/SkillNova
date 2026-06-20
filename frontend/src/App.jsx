import { Navigate, Route, Routes } from "react-router-dom";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute.jsx";
import AdminPublicRoute from "./components/admin/AdminPublicRoute.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute.jsx";
import RequireCVRoute from "./components/auth/RequireCVRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import AdminChangePassword from "./pages/admin/AdminChangePassword.jsx";
import AdminCourses from "./pages/admin/AdminCourses.jsx";
import AdminCvReviews from "./pages/admin/AdminCvReviews.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminJobs from "./pages/admin/AdminJobs.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import CVUpload from "./pages/CVUpload.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import JobMatches from "./pages/JobMatches.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import LearningPath from "./pages/LearningPath.jsx";
import Profile from "./pages/Profile.jsx";
import ProgressTracking from "./pages/ProgressTracking.jsx";
import Register from "./pages/Register.jsx";
import Settings from "./pages/Settings.jsx";
import SkillTests from "./pages/SkillTests.jsx";
import SkillGapAnalysis from "./pages/SkillGapAnalysis.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AdminPublicRoute />}>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      <Route element={<AdminProtectedRoute allowDefaultPassword />}>
        <Route path="/admin/change-password" element={<AdminChangePassword />} />
      </Route>

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/cv-reviews" element={<AdminCvReviews />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cv-upload" element={<CVUpload />} />
          <Route path="/settings" element={<Settings />} />

          <Route element={<RequireCVRoute />}>
            <Route path="/skill-gap" element={<SkillGapAnalysis />} />
            <Route path="/job-matches" element={<JobMatches />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/skill-tests" element={<SkillTests />} />
            <Route path="/progress" element={<ProgressTracking />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
