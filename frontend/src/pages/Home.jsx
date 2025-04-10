import { Link } from "react-router-dom";
import { FaShieldAlt, FaClipboardCheck, FaUsers, FaVoteYea, FaLock, FaChartBar } from 'react-icons/fa'; 

const Home = () => {
  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center px-6">
      
      {/* Hero Section */}
      <div className="text-center max-w-2xl mt-20">
        <div className="text-3xl font-extrabold text-sky-700 mb-4">
          Secure Blockchain-Based E-Voting System
        </div>
        <h4 className="text-lg text-gray-600 mb-6">
          Experience secure, transparent, and tamper-proof voting with blockchain technology.
        </h4>

        <Link 
          to="/auth" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all"
        >
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

      {/* Additional Sections */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="text-4xl font-bold mb-4 text-sky-700">System Architecture Overview</div>
          <div className="text-gray-600 max-w-2xl mx-auto">
            The blockchain voting system ensures secure authentication, transparent vote counting, and immutable results.
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto backdrop-blur-md rounded-xl p-8 shadow-2xl">
          {[
            { Icon: FaLock, title: "Admin Functions", list: ["📌 Candidate registration", "📌 Election control", "📌 Voter authentication", "📌 Vote counting", "📌 Declare winner"] },
            { Icon: FaVoteYea, title: "Voter Functions", list: ["📌 Secure registration", "📌 Tamper-proof voting", "📌 Candidate viewing", "📌 Profile management", "📌 View election results"] }
          ].map(({ Icon, title, list }, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900  p-6 rounded-xl border border-white/30 transition-all hover:shadow-2xl transform hover:scale-105"
            >
              <div className="flex items-center gap-6 mb-4">
                <Icon className="text-2xl text-sky-200 hover:text-yellow-500 transition-all" />
                <div className="text-2xl font-bold text-white ">{title}</div>
              </div>
              <ul className="space-y-3 text-gray-300">
                {list.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="text-4xl font-bold mb-4 text-sky-700  drop-shadow-md">System Architecture Overview</div>
          <div className="text-gray-600 max-w-2xl mx-auto">
            The blockchain voting system ensures secure authentication, transparent vote counting, and immutable results.
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { Icon: FaShieldAlt, title: "Voter Registration", desc: "Government issues digital credentials & voters create DIDs via Hyperledger Indy." },
            { Icon: FaClipboardCheck, title: "Voter Authentication", desc: "Voter identity verified using Hyperledger Aries; unauthorized access blocked." },
            { Icon: FaVoteYea, title: "Casting the Vote", desc: "Votes securely recorded on Hyperledger Fabric via smart contracts." },
            { Icon: FaChartBar, title: "Real-time Counting", desc: "Votes automatically counted & stored securely on the blockchain." },
            { Icon: FaLock, title: "Election Integrity", desc: "Tamper-proof results are publicly auditable for verification." },
          ].map(({ Icon, title, desc }, idx) => (
            <div 
              key={idx} 
              className="feature-card rounded-xl bg-gray-800 p-6 border border-white/30 transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              <Icon className="text-4xl mb-4 text-blue-400 hover:text-blue-500 transition-all" />
              <div className="text-xl font-bold mt-4 mb-2 text-yellow-400">{title}</div>
              <div className="text-gray-300">{desc}</div>
            </div>
          ))}
        </div>
        </section>
    </div>
  );
};

export default Home;
