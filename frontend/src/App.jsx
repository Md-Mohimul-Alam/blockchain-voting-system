import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginRegister from "./pages/LoginRegister";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

// Layout Wrapper to ensure Navbar and Footer are always present
const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-gray-100">
    <Navbar />
    <main className="flex-grow pt-16 pb-12">{children}</main> {/* ✅ Prevents overlap */}
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<LoginRegister />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
