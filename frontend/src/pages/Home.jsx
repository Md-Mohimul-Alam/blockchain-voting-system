import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="bg-white-900 text-white min-h-screen  flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <div className="text-center max-w-2xl">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Secure Blockchain-Based E-Voting System
        </h2>
        <h4 className="text-lg text-gray-300 mb-6">
          Experience secure, transparent, and tamper-proof voting with blockchain technology.
        </h4>

        <Link to="/auth" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all">
          Get Started
        </Link>
      </div>

      {/* Features Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition">
          <h3 className="text-2xl font-bold text-white">🔒 Tamper-proof Voting</h3>
          <p className="text-gray-400 mt-2">Ensures election integrity with blockchain security.</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition">
          <h3 className="text-2xl font-bold text-white">📜 Transparent Process</h3>
          <p className="text-gray-400 mt-2">Every vote is recorded on an immutable ledger.</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition">
          <h3 className="text-2xl font-bold text-white">👥 Admin & Voter Access</h3>
          <p className="text-gray-400 mt-2">Secure login for both admin and users.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
