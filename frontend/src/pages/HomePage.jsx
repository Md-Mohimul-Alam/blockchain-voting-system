import React from "react";
import { 
    Vote, 
    ShieldCheck, 
    History, 
    Users, 
    Calendar, 
    ArrowRight 
  } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
const features = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-trustblue-600" />,
    title: "Secure Blockchain Voting",
    description: "Every vote is securely recorded on an immutable ledger, making tampering impossible.",
  },
  {
    icon: <History className="h-10 w-10 text-election-600" />,
    title: "Transparent Audit Trail",
    description: "Complete history of all voting activities with verifiable cryptographic proof.",
  },
  {
    icon: <Users className="h-10 w-10 text-secure-600" />,
    title: "Identity Verification",
    description: "Advanced identity verification ensures only eligible voters can participate.",
  },
  {
    icon: <Calendar className="h-10 w-10 text-trustblue-600" />,
    title: "Flexible Election Management",
    description: "Configurable elections for any scale, from local committees to national polls.",
  },
];

const HomePage = () => {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="text-center py-20 bg-blue-100">
        <h1 className="text-5xl font-bold text-blue-800 mb-4">Welcome to ElectTrustLedger</h1>
        <p className="text-lg text-gray-700">A secure, transparent, and efficient blockchain-based voting platform.</p>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ElectTrustLedger?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
    
  );
};

export default HomePage;
