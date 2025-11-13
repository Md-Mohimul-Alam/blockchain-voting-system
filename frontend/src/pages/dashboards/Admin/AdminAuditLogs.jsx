import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Sheet, 
  Search, 
  Filter,
  RefreshCw,
  Calendar,
  User,
  Shield,
  Activity
} from "lucide-react";
import API from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchDid, setSearchDid] = useState("");
  const [searchAction, setSearchAction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("🔄 Fetching audit logs...");
      
      // Use the correct endpoint from your routes
      const endpoint = "/logs/audit";
      
      const response = await API.get(endpoint);
      
      console.log("📨 Audit logs response:", response);
      
      // Handle different response structures
      let logsData = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Structure: { success: true, data: [...] }
        logsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Structure: { success: true, data: { data: [...] } }
        logsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Single object or unexpected structure
        logsData = [response.data];
      } else {
        console.warn("⚠️ Unexpected response structure:", response.data);
        logsData = [];
      }
      
      console.log(`✅ Loaded ${logsData.length} audit logs`);
      setLogs(logsData);
      setFilteredLogs(logsData);
      
    } catch (err) {
      console.error("❌ Failed to fetch audit logs:", err);
      setError("Failed to fetch audit logs. Please check your connection.");
      toast({
        title: "Failed to load audit logs",
        description: err.response?.data?.error || "Please try again later",
        variant: "destructive",
      });
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Apply filters whenever search criteria change
  useEffect(() => {
    let filtered = logs;
    
    if (searchDid.trim()) {
      filtered = filtered.filter(log => 
        log.did?.toLowerCase().includes(searchDid.toLowerCase())
      );
    }
    
    if (searchAction.trim()) {
      filtered = filtered.filter(log => 
        log.action?.toLowerCase().includes(searchAction.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  }, [searchDid, searchAction, logs]);

  const handleDownloadJSON = () => {
    try {
      const dataStr = JSON.stringify(filteredLogs, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      saveAs(blob, `audit-logs-${new Date().toISOString().split('T')[0]}.json`);
      
      toast({
        title: "Download Successful",
        description: "Audit logs exported as JSON",
        variant: "success",
      });
    } catch (err) {
      console.error("❌ JSON download failed:", err);
      toast({
        title: "Download Failed",
        description: "Failed to export JSON file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = filteredLogs.map(log => ({
        Action: log.action || "N/A",
        DID: log.did || "N/A",
        Role: log.role || "N/A",
        Timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A",
        TransactionID: log.txId || "N/A",
        Date: log.timestamp ? new Date(log.timestamp).toLocaleDateString() : "N/A",
        Time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "N/A"
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");
      
      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Action
        { wch: 25 }, // DID
        { wch: 15 }, // Role
        { wch: 25 }, // Timestamp
        { wch: 30 }, // TransactionID
        { wch: 15 }, // Date
        { wch: 15 }  // Time
      ];
      worksheet['!cols'] = colWidths;

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      saveAs(blob, `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Download Successful",
        description: "Audit logs exported as Excel",
        variant: "success",
      });
    } catch (err) {
      console.error("❌ Excel download failed:", err);
      toast({
        title: "Download Failed",
        description: "Failed to export Excel file",
        variant: "destructive",
      });
    }
  };

  const getActionVariant = (action) => {
    if (!action) return "secondary";
    
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('login') || actionLower.includes('register')) {
      return "success";
    } else if (actionLower.includes('create') || actionLower.includes('approve')) {
      return "default";
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return "secondary";
    } else if (actionLower.includes('delete') || actionLower.includes('reject')) {
      return "destructive";
    } else if (actionLower.includes('vote') || actionLower.includes('cast')) {
      return "teal";
    } else {
      return "outline";
    }
  };

  const getRoleVariant = (role) => {
    if (!role) return "secondary";
    
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('admin')) {
      return "destructive";
    } else if (roleLower.includes('candidate')) {
      return "purple";
    } else if (roleLower.includes('voter')) {
      return "teal";
    } else if (roleLower.includes('election')) {
      return "indigo";
    } else {
      return "secondary";
    }
  };

  const clearFilters = () => {
    setSearchDid("");
    setSearchAction("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
      <Header />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12 shadow-xl">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Audit Logs</h1>
          </div>
          <p className="text-xl opacity-90">
            Monitor and track all system activities
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Stats and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Filter className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Filtered</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(logs.map(log => log.did)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Actions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(logs.map(log => log.action)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter
            </CardTitle>
            <CardDescription>
              Filter audit logs by DID, action, or other criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search by DID</label>
                <Input
                  placeholder="Enter user DID..."
                  value={searchDid}
                  onChange={(e) => setSearchDid(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search by Action</label>
                <Input
                  placeholder="Enter action type..."
                  value={searchAction}
                  onChange={(e) => setSearchAction(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-end space-x-2">
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
              
              <div className="flex items-end space-x-2">
                <Button 
                  onClick={fetchLogs}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Controls */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
                <p className="text-sm text-gray-600">
                  Download filtered audit logs in various formats
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleDownloadJSON}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export JSON
                </Button>
                <Button 
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Sheet className="w-4 h-4" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <Activity className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {logs.length} log entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getActionVariant(log.action)}>
                            {log.action || "Unknown Action"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {log.did || "Unknown User"}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={getRoleVariant(log.role)} size="sm">
                                  {log.role || "Unknown Role"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              {log.timestamp 
                                ? new Date(log.timestamp).toLocaleString() 
                                : "Unknown Time"
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                            {log.txId || "N/A"}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No audit logs found
                </h3>
                <p className="text-gray-500 mb-4">
                  {logs.length === 0 
                    ? "No audit logs available in the system." 
                    : "No logs match your current filters."
                  }
                </p>
                {logs.length === 0 && (
                  <Button onClick={fetchLogs} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminAuditLogs;