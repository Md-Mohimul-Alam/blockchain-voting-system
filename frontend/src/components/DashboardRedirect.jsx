// src/components/DashboardRedirect.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardRedirect = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    console.log("🔄 DashboardRedirect - User:", user);
    console.log("🔄 DashboardRedirect - Is authenticated:", isAuthenticated);

    if (!isAuthenticated || !user) {
      console.log("❌ Not authenticated, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }

    // Small delay to ensure state is stable
    const redirectTimer = setTimeout(() => {
      try {
        // Enhanced role handling with better mapping
        const userRole = user.role?.toLowerCase()?.trim() || 'voter';
        
        // Map various role formats to consistent dashboard paths
        const roleMap = {
          'admin': 'admin',
          'electioncommission': 'ec',
          'election commission': 'ec',
          'ec': 'ec',
          'voter': 'voter',
          'candidate': 'candidate'
        };

        const dashboardRole = roleMap[userRole] || 'voter';
        const validRoles = ['admin', 'ec', 'voter', 'candidate'];
        
        if (!validRoles.includes(dashboardRole)) {
          console.warn(`⚠️ Invalid role: ${userRole}, mapped to: ${dashboardRole}, defaulting to voter`);
          navigate("/dashboard/voter", { replace: true });
          return;
        }

        const dashboardPath = `/dashboard/${dashboardRole}`;
        console.log("🎯 Redirecting to:", dashboardPath);
        console.log("📋 Role mapping:", { original: userRole, mapped: dashboardRole });
        
        navigate(dashboardPath, { replace: true });
        
      } catch (error) {
        console.error("🚨 Redirect error:", error);
        navigate("/dashboard/voter", { replace: true });
      } finally {
        setRedirectAttempted(true);
      }
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [user, isAuthenticated, navigate]);

  // Show loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-teal-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Preparing Your Dashboard</h2>
        <p className="text-gray-600">Redirecting you to the appropriate dashboard...</p>
        {redirectAttempted && (
          <p className="text-sm text-orange-600 mt-2">
            Taking longer than expected? <button 
              onClick={() => navigate("/dashboard/voter")} 
              className="text-teal-600 hover:text-teal-700 underline"
            >
              Click here
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardRedirect;