const SidebarUser = ({ setSelectedTab }) => {
    return (
      <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
        <h2 className="text-xl font-bold mb-6">User Panel</h2>
        <ul className="space-y-4">
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("vote")}>Vote Now</li>
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("results")}>Election Results</li>
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("profile")}>My Profile</li>
        </ul>
      </aside>
    );
  };
  
  export default SidebarUser;
  