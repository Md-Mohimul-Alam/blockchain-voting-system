import React, { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, User, Shield, Vote, Filter, Eye, X, Download } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";

const ELManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        console.log("🔄 Fetching users...");
        const response = await API.get("/users/all");
        
        console.log("📦 Full API response:", response);
        console.log("📦 Response data:", response.data);
        
        // Handle different response structures
        let usersData = [];
        
        if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          usersData = response.data.data;
        } else if (response.data && response.data.data) {
          console.warn("Unexpected data structure:", response.data);
          usersData = [response.data.data];
        } else {
          console.warn("No users data found in response");
          usersData = [];
        }
        
        console.log(`✅ Extracted ${usersData.length} users`);
        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
        
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        setLoading(false);
        toast.error("Failed to fetch users");
      }
    };

    fetchAllUsers();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.did?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role?.toLowerCase() === roleFilter.toLowerCase());
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleViewDetails = (user) => {
    setModalUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalUser(null);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: "bg-red-100 text-red-800", icon: <Shield className="w-3 h-3" /> },
      voter: { color: "bg-blue-100 text-blue-800", icon: <User className="w-3 h-3" /> },
      candidate: { color: "bg-green-100 text-green-800", icon: <Vote className="w-3 h-3" /> },
      electioncommission: { color: "bg-purple-100 text-purple-800", icon: <Users className="w-3 h-3" /> }
    };
    
    const config = roleConfig[role?.toLowerCase()] || { color: "bg-gray-100 text-gray-800", icon: <User className="w-3 h-3" /> };
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {role}
      </Badge>
    );
  };

  const exportUsers = () => {
    const csvContent = [
      ['Role', 'DID', 'Username', 'Full Name', 'Date of Birth', 'Birthplace'],
      ...filteredUsers.map(user => [
        user.role,
        user.did,
        user.username,
        user.fullName || 'N/A',
        user.dob || 'N/A',
        user.birthplace || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Users exported successfully");
  };

  const UserCard = ({ user }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-teal-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.fullName || "Unknown User"}</h3>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </div>
          </div>
          {getRoleBadge(user.role)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500">DID:</span>
            <p className="font-mono text-gray-900 truncate">{user.did}</p>
          </div>
          <div>
            <span className="text-gray-500">Birthplace:</span>
            <p className="text-gray-900">{user.birthplace || "N/A"}</p>
          </div>
        </div>
        
        <Button 
          onClick={() => handleViewDetails(user)}
          variant="outline" 
          className="w-full border-teal-200 hover:bg-teal-50 text-teal-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  const UserTable = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">DID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Birthplace</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName || "Unknown User"}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4">
                  <code className="text-sm text-gray-600 font-mono">{user.did}</code>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.birthplace || "N/A"}</td>
                <td className="px-6 py-4">
                  <Button
                    onClick={() => handleViewDetails(user)}
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const UserDetailsModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform ${showModal ? 'scale-100' : 'scale-95'}`}>
        {modalUser && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{modalUser.fullName || "Unknown User"}</h2>
                  <p className="text-gray-600">@{modalUser.username}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getRoleBadge(modalUser.role)}
                    <Badge variant="outline" className="text-gray-600">
                      DID: {modalUser.did}
                    </Badge>
                  </div>
                  <p className="text-gray-600">Registered user in the system</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                    <p className="text-gray-900">{modalUser.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
                    <p className="text-gray-900">{modalUser.dob || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Birthplace</h3>
                    <p className="text-gray-900">{modalUser.birthplace || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Username</h3>
                    <p className="text-gray-900">@{modalUser.username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                    <p className="text-gray-900">{modalUser.role}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">DID</h3>
                    <code className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {modalUser.did}
                    </code>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end">
                <Button onClick={handleCloseModal} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">User Management</h1>
              <p className="text-teal-100 text-lg mt-2">
                Manage and monitor all registered users in the system
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 flex-grow">
        {/* Stats and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Filtered</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Filter className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-teal-500"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-teal-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="voter">Voter</option>
                  <option value="candidate">Candidate</option>
                  <option value="electioncommission">Election Commission</option>
                </select>
                <Button onClick={exportUsers} variant="outline" className="whitespace-nowrap">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Display */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {users.length === 0 ? "No users registered in the system." : "No users match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Card View (for smaller screens) */}
            <div className="lg:hidden space-y-4">
              {filteredUsers.map((user, index) => (
                <UserCard key={index} user={user} />
              ))}
            </div>
            
            {/* Table View (for larger screens) */}
            <div className="hidden lg:block">
              <UserTable />
            </div>
          </>
        )}

        {/* Modal */}
        <UserDetailsModal />
      </main>

      <Footer />
    </div>
  );
};

export default ELManageUsersPage;