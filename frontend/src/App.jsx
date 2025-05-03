import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

import CreateElectionEl from "./pages/dashboards/el/CreateElectionPageEL";
import ELManageUsersPage from "./pages/dashboards/el/users";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/vote" element={<VoteNow />} />

          {/* Role-based Dashboards */}
          <Route path="/dashboard/voter" element={<VoterDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/candidate" element={<CandidateDashboard />} />
          <Route path="/dashboard/electioncommunity" element={<ElectionCommunityDashboard />} />

          {/* Static Pages */}
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Admin Extended Pages */}
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/logs" element={<AdminAuditLogs />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/system-health" element={<AdminSystemHealth />} />
          <Route path="/admin/team" element={<AdminTeam />} />
          <Route path="/admin/Requests" element={<Requests />} />
          <Route path="/admin/notify" element={<AdminNotify />} />
          <Route path="/admin/notes" element={<AdminNotes />} />
          <Route path="/admin/manage-users" element={<ManageUsersPage />} />
          <Route path="/admin/reset-system" element={<ResetSystemPage />} />
          <Route path="/admin/create-election" element={<CreateElection />} />

          <Route path="/el/create-election" element={<CreateElectionEl />} />
          <Route path="/admin/election-management" element={<ElectionManagement />} />
          <Route path="/el/users" element={<ELManageUsersPage />} />

          {/* 404 Not Found */}

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
