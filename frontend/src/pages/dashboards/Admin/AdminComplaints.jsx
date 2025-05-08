import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [searchDid, setSearchDid] = useState("");
  const [replyText, setReplyText] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = searchDid.trim()
        ? `/complaints/user/${searchDid}`
        : "/complaints";

      const { data } = await API.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(data);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [searchDid]);

  const handleReply = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/complaint/reply",
        {
          complaintId: selectedComplaintId,
          responderDid: JSON.parse(atob(token.split(".")[1])).did,
          responseText: replyText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText("");
      setSelectedComplaintId(null);
      fetchComplaints();
    } catch (error) {
      console.error("Failed to reply to complaint:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-700 mb-4 text-center">Complaints Management</h1>

        <div className="mb-6 flex justify-center gap-4 ">
          <input
            type="text"
            placeholder="Search by DID"
            value={searchDid}
            onChange={(e) => setSearchDid(e.target.value)}
            className="input input-bordered border-1 p-2 rounded-md w-64"
          />
        </div>

        <div className="overflow-x-auto rounded-md shadow-md">
          <table className="min-w-full bg-white text-sm text-left">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="px-4 py-2">DID</th>
                <th className="px-4 py-2">Content</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Response</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{c.did}</td>
                  <td className="px-4 py-2">{c.content}</td>
                  <td className="px-4 py-2">{new Date(c.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2">{c.response || "—"}</td>
                  <td className="px-4 py-2">
                    {!c.response && (
                      <button
                        onClick={() => setSelectedComplaintId(c.key || c.txId)}
                        className="btn btn-xs bg-teal-600 text-white p-2 hover:bg-teal-700 rounded-md"
                      >
                        Reply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedComplaintId && (
          <div className="mt-6 max-w-xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-2">Reply to Complaint</h2>
            <textarea
              className="textarea textarea-bordered border-1 rounded-md w-full mb-4 border-teal-900"
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Enter your reply here"
            />
            <button
              onClick={handleReply}
              className="btn bg-teal-600 text-white hover:bg-teal-700 rounded-md p-2"
            >
              Submit Reply
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminComplaints;
