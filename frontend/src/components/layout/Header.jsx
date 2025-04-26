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
import LogoutIconCustom from "@/components/ui/LogoutIconCustom"; // Make sure path is correct
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
} from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/login");
  };

  const getDashboardRoute = () => {
    const role = currentUser?.role?.toLowerCase();
    return role ? `/dashboard/${role}` : "/dashboard";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Vote className="h-8 w-8 text-trueblues-600" />
          <Link to="/" className="text-xl font-bold text-teal-700">
            Vote<span className="text-secure-700">-Chain</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium ${location.pathname === "/" ? "text-teal-700" : "text-gray-600 hover:text-teal-600"}`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium ${location.pathname === "/about" ? "text-teal-700" : "text-gray-600 hover:text-teal-600"}`}
          >
            About
          </Link>
          <Link
            to={getDashboardRoute()}
            className={`text-sm font-medium ${location.pathname.startsWith("/dashboard") ? "text-teal-700" : "text-gray-600 hover:text-teal-600"}`}
            onClick={() => {
              if (!isAuthenticated) {
                toast({
                  title: "Access Denied",
                  description: "You need to log in to access the dashboard.",
                  variant: "destructive",
                });
                navigate("/login");
              }
            }}
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="bg-teal-700">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`data:image/png;base64,${currentUser?.image}`} alt={currentUser?.fullName} />
                    <AvatarFallback className="bg-secure-100 text-secure-700">
                      {currentUser?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-teal-600" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-amber-50">{currentUser?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground text-amber-50">{currentUser?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate(getDashboardRoute())}>
                  <BarChart4 className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/profile")}> <User className="mr-2 h-4 w-4" /> <span>Profile</span> </DropdownMenuItem>
                <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/my-votes")}> <Vote className="mr-2 h-4 w-4" /> <span>My Votes</span> </DropdownMenuItem>

                {currentUser?.role?.toLowerCase() === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/admin/users")}> <Users className="mr-2 h-4 w-4" /> <span>Manage Users</span> </DropdownMenuItem>
                    <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/admin/reports")}> <FileText className="mr-2 h-4 w-4" /> <span>Reports</span> </DropdownMenuItem>
                  </>
                )}

                {currentUser?.role?.toLowerCase() === "candidate" && (
                  <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/dashboard/candidate")}> <BarChart4 className="mr-2 h-4 w-4" /> <span>Candidate Panel</span> </DropdownMenuItem>
                )}

                {currentUser?.role?.toLowerCase() === "electioncommunity" && (
                  <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/dashboard/electioncommunity")}> <BarChart4 className="mr-2 h-4 w-4" /> <span>EC Dashboard</span> </DropdownMenuItem>
                )}

                <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/complaints")}> <MessageSquare className="mr-2 h-4 w-4" /> <span>Complaints</span> </DropdownMenuItem>
                <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/settings")}> <Settings className="mr-2 h-4 w-4" /> <span>Settings</span> </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="bg-teal-600 hover:bg-teal-700" onClick={handleLogout}> <LogOut className="mr-2 h-4 w-4" /> <span>Log out</span> </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="text-gray-600 hover:text-teal-600" onClick={() => navigate("/login")}> Log in </Button>
              <Button onClick={() => navigate("/register")} variant="ghost" className="text-gray-600 hover:text-teal-600">Register</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
