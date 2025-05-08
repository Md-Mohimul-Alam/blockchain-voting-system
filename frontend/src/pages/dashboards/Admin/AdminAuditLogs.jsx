import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchDid, setSearchDid] = useState("");
  const [searchAction, setSearchAction] = useState("");
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = searchDid.trim() ? `/logs/${searchDid}` : `/logs`;

      const { data } = await API.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError("Failed to fetch audit logs.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchDid]);

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchAction.toLowerCase())
  );

  const handleDownloadJSON = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/report/download", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "audit-logs.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download logs:", err);
      alert("Failed to download logs.");
    }
  };

  const handleDownloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredLogs);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `filtered-audit-logs-${Date.now()}.xlsx`);
    } catch (err) {
      console.error("Excel download failed:", err);
      alert("Failed to generate Excel.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow px-6 py-10 max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-teal-700 mb-10 text-center">Audit Logs</h1>
            <div className="flex flex-wrap gap-4 justify-center mb-15">
              <div className="border-teal-600 border-1 rounded-md p-1">
                <input
                  type="text"
                  placeholder="Search by DID"
                  value={searchDid}
                  onChange={(e) => setSearchDid(e.target.value)}
                  className="input input-bordered w-64 p-3 rounded-md"
                />
              </div>
              <div className="border-teal-600 border-1 rounded-md p-1">
                <input
                  type="text"
                  placeholder="Search by Action"
                  value={searchAction}
                  onChange={(e) => setSearchAction(e.target.value)}
                  className="border-teal-600 input input-bordered w-64 p-3 rounded-md"
                />
              </div>
              <button
                onClick={handleDownloadJSON}
                className="btn bg-teal-600 text-white hover:bg-teal-700 p-3 rounded-md"
              >
                Download JSON
              </button>
              <button
                onClick={handleDownloadExcel}
                className="btn bg-green-600 text-white hover:bg-green-700 p-3 rounded-md"
              >
                Download Excel
              </button>
            </div>
        </div>

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        <div className="overflow-x-auto rounded-md shadow-md">
          <table className="min-w-full bg-white text-sm text-left overflow-hidden">
            <thead className="bg-teal-600 text-white uppercase">
              <tr>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">DID</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">TxID</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2 text-blue-700">{log.did}</td>
                    <td className="px-4 py-2">{log.role || "—"}</td>
                    <td className="px-4 py-2">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 truncate">
                      {log.txId}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAuditLogs;
