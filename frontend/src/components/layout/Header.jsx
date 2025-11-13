import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutIconCustom from "@/components/ui/LogoutIconCustom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  Vote,
  BarChart4,
  Settings,
  Users,
  FileText,
  MessageSquare,
  Shield,
} from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Safe JSON parsing function
  const safeJsonParse = (str) => {
    try {
      if (!str || str === 'undefined' || str === 'null') {
        return null;
      }
      return JSON.parse(str);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        console.log("Header - Token:", token);
        console.log("Header - User string:", userStr);

        if (token && userStr) {
          const user = safeJsonParse(userStr);
          console.log("Header - Parsed user:", user);
          
          if (user && typeof user === 'object') {
            setIsAuthenticated(true);
            setCurrentUser(user);
          } else {
            // Invalid user data, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Header - Error checking auth status:", error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };

    checkAuthStatus();
  }, [location.pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setCurrentUser(null);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  const getDashboardRoute = () => {
    if (!currentUser?.role) return "/dashboard";
    const role = currentUser.role.toLowerCase();
    
    // Map roles to dashboard paths
    const roleMap = {
      'admin': 'admin',
      'electioncommission': 'ec', // Fixed: map to 'ec' not 'electioncommunity'
      'voter': 'voter',
      'candidate': 'candidate'
    };
    
    return `/dashboard/${roleMap[role] || 'voter'}`;
  };

  const getAvatarFallback = () => {
    if (currentUser?.fullName) {
      return currentUser.fullName.charAt(0).toUpperCase();
    }
    if (currentUser?.username) {
      return currentUser.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleDashboardClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast({
        title: "Access Denied",
        description: "You need to log in to access the dashboard.",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  // Safe image URL generation
  const getAvatarImageSrc = () => {
    if (!currentUser?.image) return undefined;
    
    try {
      // Check if image is already a URL or base64 data
      if (currentUser.image.startsWith('http')) {
        return currentUser.image;
      }
      if (currentUser.image.startsWith('data:')) {
        return currentUser.image;
      }
      // Assume it's base64 data without the prefix
      return `data:image/png;base64,${currentUser.image}`;
    } catch (error) {
      console.error("Error generating avatar image URL:", error);
      return undefined;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Vote className="h-8 w-8 text-teal-600" />
          <Link to="/" className="text-xl font-bold text-teal-700">
            Vote<span className="text-blue-700">-Chain</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium ${
              location.pathname === "/" ? "text-teal-700" : "text-gray-600 hover:text-teal-600"
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium ${
              location.pathname === "/about" ? "text-teal-700" : "text-gray-600 hover:text-teal-600"
            }`}
          >
            About
          </Link>
          <Link
            to={getDashboardRoute()}
            className={`text-sm font-medium ${
              location.pathname.startsWith("/dashboard") ? "text-teal-700" : "text-gray-600 hover:text-teal-600"
            }`}
            onClick={handleDashboardClick}
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated && currentUser ? (
            <DropdownMenu className="bg-teal-700 text-white">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={getAvatarImageSrc()} 
                    />
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-teal-700  text-white " align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.fullName || currentUser.username || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.role || "Unknown Role"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                  <BarChart4 className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/my-votes")}>
                  <Vote className="mr-2 h-4 w-4" />
                  <span>My Votes</span>
                </DropdownMenuItem>

                {/* Admin Menu Items */}
                {currentUser.role?.toLowerCase() === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin/manage-users")}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Manage Users</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/reports")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Reports</span>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Candidate Menu Items */}
                {currentUser.role?.toLowerCase() === "candidate" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard/candidate")}>
                      <BarChart4 className="mr-2 h-4 w-4" />
                      <span>Candidate Panel</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/candidate/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Election Commission Menu Items - FIXED */}
                {currentUser.role?.toLowerCase() === "electioncommission" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard/ec")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>EC Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/el/users")}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Manage Users</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/el/create-election")}>
                      <Vote className="mr-2 h-4 w-4" />
                      <span>Create Election</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/complaint")}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Complaints</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-teal-600" 
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
              <Button 
                onClick={() => navigate("/register")} 
                variant="ghost" 
                className="text-gray-600 hover:text-teal-600"
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;