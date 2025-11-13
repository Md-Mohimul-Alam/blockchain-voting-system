// src/App.jsx
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardRedirect from "./components/DashboardRedirect";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import About from "./pages/About";
import ContactPage from "./pages/Contact";
import UserProfile from "./pages/UserProfile";
import VoteNow from "./pages/VoteNow";

// Role-based dashboards
import VoterDashboard from "./pages/dashboards/VoterDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CandidateDashboard from "./pages/dashboards/CandidateDashboard";
import ElectionCommunityDashboard from "./pages/dashboards/ElectionCommunityDashboard";

// Static pages
import Faq from "./pages/Faq";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Admin extended pages
import AdminAnalytics from "./pages/dashboards/Admin/AdminAnalytics";
import AdminAuditLogs from "./pages/dashboards/Admin/AdminAuditLogs";
import AdminComplaints from "./pages/dashboards/Admin/AdminComplaints";
import AdminSystemHealth from "./pages/dashboards/Admin/AdminSystemHealth";
import AdminTeam from "./pages/dashboards/Admin/AdminTeam";
import Requests from "./pages/dashboards/Admin/Requests";
import AdminNotify from "./pages/dashboards/Admin/AdminNotify";
import ElectionManagement from "./pages/dashboards/Admin/ElectionManagement";
import AdminNotes from "./pages/dashboards/Admin/AdminNotes";
import CreateElection from "./pages/dashboards/Admin/CreateElectionPage";
import ManageUsersPage from "./pages/dashboards/Admin/ManageUsersPage";
import ResetSystemPage from "./pages/dashboards/Admin/ResetSystemPage";

// Election Community extended pages
import CreateElectionEl from "./pages/dashboards/el/CreateElectionPageEL";
import ELManageUsersPage from "./pages/dashboards/el/users";
import ELAnalytics from "./pages/dashboards/el/ELAnalytics";
import ELRequests from "./pages/dashboards/el/ELRequests.jsx";
import ELLogs from "./pages/dashboards/el/ELLogs";
import ELComplaints from "./pages/dashboards/el/ELComplaints";

// Voter extended pages
import VoterHistory from "./pages/dashboards/Voter/VoterHistory";
import VoterElections from "./pages/dashboards/Voter/VoterElections";

// Candidate extended pages
import CandidateApplications from "./pages/dashboards/Candidate/CandidateApplications";
import CandidateProfile from "./pages/dashboards/Candidate/CandidateProfile";

// Shared components
import UserComplaintForm from "./pages/UserComplaintForm";
import ResetCandidatePassword from "./pages/dashboards/Admin/ResetCandidatePassword";
import ElectionResults from "./pages/ElectionResults";
import ElectionCalendar from "./pages/ElectionCalendar";
import CandidateDirectory from "./pages/CandidateDirectory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/complaint" element={<UserComplaintForm />} />
            <Route path="/election-results" element={<ElectionResults />} />
            <Route path="/election-calendar" element={<ElectionCalendar />} />
            <Route path="/Candidates" element={<CandidateDirectory />} />

            {/* Dashboard Redirect Routes */}
            <Route path="/dashboard" element={<Navigate to="/dashboard/redirect" replace />} />
            <Route path="/dashboard/redirect" element={<DashboardRedirect />} />

            {/* Protected Routes - Shared */}
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['Admin', 'Voter', 'Candidate', 'ElectionCommission']}>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/vote" element={
              <ProtectedRoute allowedRoles={['Voter', 'Admin', 'ElectionCommission']}>
                <VoteNow />
              </ProtectedRoute>
            } />

            {/* Role-based Dashboard Routes - FIXED: Consistent allowedRoles pattern */}
            <Route path="/dashboard/Admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/Voter" element={
              <ProtectedRoute allowedRoles={['Voter']}>
                <VoterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/Candidate" element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ec" element={
              <ProtectedRoute allowedRoles={['ElectionCommission']}>
                <ElectionCommunityDashboard />
              </ProtectedRoute>
            } />

            {/* ==================== ADMIN ROUTES ==================== */}
            <Route path="/Admin/analytics" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/Admin/logs" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminAuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/Admin/complaints" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminComplaints />
              </ProtectedRoute>
            } />
            <Route path="/Admin/system-health" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminSystemHealth />
              </ProtectedRoute>
            } />
            <Route path="/Admin/team" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminTeam />
              </ProtectedRoute>
            } />
            <Route path="/Admin/requests" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Requests />
              </ProtectedRoute>
            } />
            <Route path="/Admin/notify" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminNotify />
              </ProtectedRoute>
            } />
            <Route path="/Admin/notes" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminNotes />
              </ProtectedRoute>
            } />
            
            <Route path="/Admin/manage-users" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/Admin/reset-system" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ResetSystemPage />
              </ProtectedRoute>
            } />
            <Route path="/Admin/create-election" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <CreateElection />
              </ProtectedRoute>
            } />
            <Route path="/Admin/election-management" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ElectionManagement />
              </ProtectedRoute>
            } />
            <Route path="/Admin/reset-password" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ResetCandidatePassword />
              </ProtectedRoute>
            } />

            {/* ==================== ELECTION COMMUNITY ROUTES ==================== */}
            <Route path="/el/create-election" element={
              <ProtectedRoute allowedRoles={['ElectionCommission']}>
                <CreateElectionEl />
              </ProtectedRoute>
            } />
            <Route path="/el/users" element={
              <ProtectedRoute allowedRoles={['ElectionCommission']}>
                <ELManageUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/el/analytics" element={
              <ProtectedRoute allowedRoles={['ElectionCommission']}>
                <ELAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/el/requests" element={
              <ProtectedRoute allowedRoles={['ElectionCommission']}>
                <ELRequests />
              </ProtectedRoute>
            } />
            <Route path="/el/logs" element={
              <ProtectedRoute allowedRoles={['ElectionCommission']}>
                <ELLogs />
              </ProtectedRoute>
            } />
            <Route path="/el/complaints" element={
              <ProtectedRoute allowedRoles={['ElectionCommission']}>
                <ELComplaints />
              </ProtectedRoute>
            } />
            <Route path="/el/election-management" element={
              <ProtectedRoute allowedRoles={['ElectionCommission']}>
                <ElectionManagement />
              </ProtectedRoute>
            } />

            {/* ==================== VOTER ROUTES ==================== */}
            <Route path="/Voter/history" element={
              <ProtectedRoute allowedRoles={['Voter']}>
                <VoterHistory />
              </ProtectedRoute>
            } />
            <Route path="/Voter/elections" element={
              <ProtectedRoute allowedRoles={['Voter']}>
                <VoterElections />
              </ProtectedRoute>
            } />

            {/* ==================== CANDIDATE ROUTES ==================== */}
            <Route path="/Candidate/applications" element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <CandidateApplications />
              </ProtectedRoute>
            } />
            <Route path="/Candidate/profile" element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <CandidateProfile />
              </ProtectedRoute>
            } />

            {/* ==================== SHARED ELECTION ROUTES ==================== */}
            <Route path="/elections/:electionId/results" element={
              <ProtectedRoute allowedRoles={['Admin', 'Voter', 'Candidate', 'ElectionCommission']}>
                <ElectionResults />
              </ProtectedRoute>
            } />
            <Route path="/elections/:electionId/details" element={
              <ProtectedRoute allowedRoles={['Admin', 'Voter', 'Candidate', 'ElectionCommission']}>
                <ElectionManagement />
              </ProtectedRoute>
            } />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;