import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import LoginPage from "./pages/LoginPage";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignBuilderPage from "./pages/CampaignBuilderPage";
import AssessmentRoom from "./pages/AssessmentRoom";
import LiveInterviewRoom from "./pages/LiveInterviewRoom";
import ResultsPage from "./pages/ResultsPage";
import InterviewsPage from "./pages/InterviewsPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";
import ActiveAssessmentsPage from "./pages/ActiveAssessmentsPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import HelpPage from "./pages/HelpPage";
import "./styles.css";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-on-surface-variant">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    case "RECRUITER":
      return <Navigate to="/recruiter" replace />;
    case "CANDIDATE":
      return <Navigate to="/candidate" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleBasedRedirect />} />
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={["CANDIDATE"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute allowedRoles={["CANDIDATE"]}>
            <ActiveAssessmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/:campaignId/details"
        element={
          <ProtectedRoute allowedRoles={["CANDIDATE"]}>
            <CampaignDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute allowedRoles={["CANDIDATE", "RECRUITER"]}>
            <CampaignsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/:campaignId/builder"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN"]}>
            <CampaignBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/:sessionId"
        element={
          <ProtectedRoute allowedRoles={["CANDIDATE"]}>
            <AssessmentRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/:campaignId"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN"]}>
            <ResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute allowedRoles={["CANDIDATE"]}>
            <ResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "CANDIDATE"]}>
            <InterviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews/:sessionId/live"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "CANDIDATE"]}>
            <LiveInterviewRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "CANDIDATE"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "CANDIDATE"]}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute allowedRoles={["CANDIDATE", "ADMIN"]}>
            <HelpPage />
          </ProtectedRoute>
        }
      />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
