// src/components/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  console.log("🔒 ProtectedRoute - User:", user);
  console.log("🔒 ProtectedRoute - Is authenticated:", isAuthenticated);
  console.log("🔒 ProtectedRoute - Allowed roles:", allowedRoles);
  console.log("🔒 ProtectedRoute - Required role:", requiredRole);

  if (!isAuthenticated || !user) {
    console.log("❌ Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Normalize roles to lowercase for comparison
  const normalizedUserRole = user.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map(role => role.toLowerCase());
  const normalizedRequiredRole = requiredRole?.toLowerCase();

  // Handle both allowedRoles and requiredRole
  let hasAccess = false;
  
  if (normalizedAllowedRoles) {
    hasAccess = normalizedAllowedRoles.includes(normalizedUserRole);
  } else if (normalizedRequiredRole) {
    hasAccess = normalizedUserRole === normalizedRequiredRole;
  }

  if (!hasAccess) {
    console.log(`❌ Access denied: User role ${user.role} not in allowed roles`);
    
    // Redirect to appropriate dashboard based on user's actual role
    const dashboardPath = `/dashboard/${normalizedUserRole}`;
    console.log(`🔄 Redirecting to: ${dashboardPath}`);
    
    return <Navigate to={dashboardPath} replace />;
  }

  console.log("✅ Access granted to protected route");
  return children;
};

export default ProtectedRoute;