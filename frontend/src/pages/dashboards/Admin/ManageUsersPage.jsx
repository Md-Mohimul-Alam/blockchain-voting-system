import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  User, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Shield,
  Vote,
  Award,
  Settings,
  Mail,
  Calendar,
  MapPin,
  UserCheck,
  UserX
} from "lucide-react";
import API from "@/services/api";

const ManageUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching users...");
      
      const response = await API.get("/users/all");
      console.log("📨 Users response:", response);
      
      // Handle different response structures
      let usersData = [];
      
      if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        usersData = [response.data];
      } else {
        console.warn("⚠️ Unexpected response structure:", response.data);
        usersData = [];
      }
      
      // Enhanced user data cleaning and validation
      const validUsers = [];
      const seenDIDs = new Set();
      
      usersData.forEach(user => {
        // Skip if user is invalid
        if (!user || !user.did || user.did === 'unknown' || !user.role) {
          console.warn("⚠️ Skipping invalid user:", user);
          return;
        }
        
        // Skip duplicates
        if (seenDIDs.has(user.did)) {
          console.warn(`⚠️ Skipping duplicate user with DID: ${user.did}`);
          return;
        }
        
        seenDIDs.add(user.did);
        
        // Clean and validate user data
        const cleanedUser = {
          ...user,
          role: user.role || 'unknown',
          did: user.did || 'unknown',
          username: user.username || 'unknown',
          fullName: user.fullName || 'Unknown User',
          dob: user.dob || 'Not provided',
          birthplace: user.birthplace || 'Not provided'
        };
        
        validUsers.push(cleanedUser);
      });
      
      console.log(`✅ Loaded ${validUsers.length} valid users (filtered from ${usersData.length} total records)`);
      
      if (usersData.length > validUsers.length) {
        console.warn(`🗑️ Filtered out ${usersData.length - validUsers.length} invalid/duplicate users`);
      }
      
      setUsers(validUsers);
      
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast({
        title: "Failed to load users",
        description: error.response?.data?.error || "Please try again later",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = users.filter(user => {
      const matchesSearch = 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.did?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role?.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });

    setFilteredUsers(filtered);
  };

  const handleViewDetails = (user) => {
    setModalUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalUser(null);
  };

  const handleDeleteUser = async (user) => {
  if (!user.did || user.did === 'unknown' || !user.role || user.role === 'unknown') {
    toast({
      title: "Cannot delete user",
      description: "User data is incomplete or invalid",
      variant: "destructive",
    });
    return;
  }

  if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
    return;
  }

  try {
    setDeleting(true);
    
    const encodedDid = encodeURIComponent(user.did);
    const encodedRole = encodeURIComponent(user.role);
    
    console.log(`🗑️ Deleting user: ${user.username}, Role: ${user.role}, DID: ${user.did}`);
    
    const response = await API.delete(`/user/${encodedRole}/${encodedDid}`);
    
    if (response.data.success) {
      toast({
        title: "User deleted successfully",
        description: `${user.username} has been removed from the system`,
        variant: "success",
      });
      
      // Refresh the list
      fetchAllUsers();
    } else {
      throw new Error(response.data.error || "Delete failed");
    }
    
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    
    let errorMessage = "Failed to delete user";
    let userMessage = errorMessage;
    let variant = "destructive";
    
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
      userMessage = error.response.data.error;
      
      // Handle specific error cases
      if (error.response.status === 202) {
        // Accepted but processing
        userMessage = "User deletion is being processed. It may take a moment to complete.";
        variant = "default";
        
        // Remove from local state for better UX
        setUsers(prevUsers => prevUsers.filter(u => u.did !== user.did));
        setFilteredUsers(prevUsers => prevUsers.filter(u => u.did !== user.did));
      } else if (error.response.status === 503) {
        // Service unavailable - remove locally
        userMessage = "Blockchain network unavailable. User removed from local view.";
        variant = "default";
        
        setUsers(prevUsers => prevUsers.filter(u => u.did !== user.did));
        setFilteredUsers(prevUsers => prevUsers.filter(u => u.did !== user.did));
      } else if (error.response.status === 404) {
        userMessage = "User not found in blockchain. It may have been already deleted.";
        variant = "default";
        
        setUsers(prevUsers => prevUsers.filter(u => u.did !== user.did));
        setFilteredUsers(prevUsers => prevUsers.filter(u => u.did !== user.did));
      }
    } else if (error.message.includes('503') || error.code === 'ERR_BAD_RESPONSE') {
      userMessage = "Blockchain network is temporarily unavailable. User removed from local view.";
      variant = "default";
      
      setUsers(prevUsers => prevUsers.filter(u => u.did !== user.did));
      setFilteredUsers(prevUsers => prevUsers.filter(u => u.did !== user.did));
    }
    
    toast({
      title: variant === "destructive" ? "Delete failed" : "Notice",
      description: userMessage,
      variant: variant,
    });
  } finally {
    setDeleting(false);
  }
};

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { variant: "destructive", icon: Shield, color: "bg-red-100 text-red-800 border-red-200" },
      voter: { variant: "default", icon: User, color: "bg-blue-100 text-blue-800 border-blue-200" },
      candidate: { variant: "success", icon: Award, color: "bg-green-100 text-green-800 border-green-200" },
      electioncommission: { variant: "info", icon: Settings, color: "bg-purple-100 text-purple-800 border-purple-200" },
      unknown: { variant: "secondary", icon: UserX, color: "bg-gray-100 text-gray-800 border-gray-200" }
    };

    const normalizedRole = role?.toLowerCase() || 'unknown';
    const config = roleConfig[normalizedRole] || roleConfig.unknown;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 capitalize border ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {normalizedRole}
      </Badge>
    );
  };

  const getRoleStats = () => {
    if (!Array.isArray(users)) return {};
    
    return users.reduce((stats, user) => {
      const role = user.role?.toLowerCase() || 'unknown';
      stats[role] = (stats[role] || 0) + 1;
      stats.total = (stats.total || 0) + 1;
      return stats;
    }, {});
  };

  const roleStats = getRoleStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading users...</p>
            <p className="text-gray-400 text-sm mt-2">Fetching user data from blockchain</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
      <Header />

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-16 shadow-2xl">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">User Management</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Manage all registered users across the blockchain voting platform
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-6 py-8 -mt-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { label: "Total Users", value: roleStats.total || 0, icon: Users, color: "teal" },
            { label: "Admins", value: roleStats.admin || 0, icon: Shield, color: "red" },
            { label: "Voters", value: roleStats.voter || 0, icon: User, color: "blue" },
            { label: "Candidates", value: roleStats.candidate || 0, icon: Award, color: "green" },
            { label: "EC Members", value: roleStats.electioncommission || 0, icon: Settings, color: "purple" },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              teal: "bg-teal-500",
              red: "bg-red-500", 
              blue: "bg-blue-500",
              green: "bg-green-500",
              purple: "bg-purple-500"
            };
            
            return (
              <Card key={index} className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-2xl ${colorClasses[stat.color]} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <Card className="bg-white shadow-xl border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-4 flex-1 w-full">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search users by name, username, DID, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-w-[180px]"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="voter">Voter</option>
                    <option value="candidate">Candidate</option>
                    <option value="electioncommission">Election Commission</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={fetchAllUsers}
                  variant="outline"
                  className="flex items-center gap-2 border-2 rounded-xl px-6 py-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </Button>
                <Button className="flex items-center gap-2 rounded-xl px-6 py-3 bg-teal-600 hover:bg-teal-700">
                  <Download className="w-5 h-5" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">User Directory</CardTitle>
                <CardDescription className="text-lg">
                  {filteredUsers.length} user(s) found
                  {searchTerm && ` for "${searchTerm}"`}
                  {roleFilter !== "all" && ` in ${roleFilter} role`}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <UserCheck className="w-4 h-4 mr-2" />
                Total: {users.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!Array.isArray(filteredUsers) || filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">No users found</h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  {searchTerm || roleFilter !== "all" 
                    ? "Try adjusting your search or filter criteria" 
                    : "No users are currently registered in the system"
                  }
                </p>
                {(searchTerm || roleFilter !== "all") && (
                  <Button 
                    onClick={() => { setSearchTerm(""); setRoleFilter("all"); }}
                    variant="outline" 
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUsers.map((user, index) => (
                  <Card key={index} className="bg-white border-2 border-gray-100 hover:border-teal-200 hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      {/* User Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={`data:image/jpeg;base64,${user.image}`}
                              alt={user.fullName}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-100"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center border-2 border-teal-200">
                              <User className="w-6 h-6 text-teal-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{user.fullName}</h3>
                            <p className="text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>

                      {/* User Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {user.did}
                          </code>
                        </div>
                        {user.dob && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Born: {user.dob}</span>
                          </div>
                        )}
                        {user.birthplace && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{user.birthplace}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <Button
                          onClick={() => handleViewDetails(user)}
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center gap-2 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user)}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2 rounded-lg"
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* User Details Modal */}
      {showModal && modalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start gap-6 mb-8">
                {modalUser.image ? (
                  <img
                    src={`data:image/jpeg;base64,${modalUser.image}`}
                    alt={modalUser.fullName}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-teal-100 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center border-4 border-teal-200 shadow-lg">
                    <User className="w-8 h-8 text-teal-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{modalUser.fullName}</h2>
                  <div className="flex items-center gap-3 mb-3">
                    {getRoleBadge(modalUser.role)}
                    <span className="text-gray-500 text-lg">@{modalUser.username}</span>
                  </div>
                  <code className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">
                    {modalUser.did}
                  </code>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border-2 border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Username</label>
                      <p className="text-lg font-semibold">{modalUser.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Role</label>
                      <div>{getRoleBadge(modalUser.role)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Personal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
                      <p className="text-lg">{modalUser.fullName || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Date of Birth</label>
                      <p className="text-lg">{modalUser.dob || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Birthplace</label>
                      <p className="text-lg">{modalUser.birthplace || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end border-t pt-6">
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  className="rounded-xl px-6 py-3"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(modalUser)}
                  disabled={deleting}
                  className="rounded-xl px-6 py-3"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  {deleting ? "Deleting..." : "Delete User"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageUsersPage;