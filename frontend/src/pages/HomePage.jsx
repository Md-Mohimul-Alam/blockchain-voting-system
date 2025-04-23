
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {  
  ShieldCheck, 
  History, 
  Users, 
  Calendar, 
  ArrowRight 
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Index = () => {
  const navigate = useNavigate();
  

  const features = [
    {
      icon: <ShieldCheck className="h-10 w-10 text-teal-600" />,
      title: "Secure Blockchain Voting",
      description: "Every vote is securely recorded on an immutable ledger, making tampering impossible."
    },
    {
      icon: <History className="h-10 w-10 text-teal-600" />,
      title: "Transparent Audit Trail",
      description: "Complete history of all voting activities with verifiable cryptographic proof."
    },
    {
      icon: <Users className="h-10 w-10 text-teal-600" />,
      title: "Identity Verification",
      description: "Advanced identity verification ensures only eligible voters can participate."
    },
    {
      icon: <Calendar className="h-10 w-10 text-teal-600" />,
      title: "Flexible Election Management",
      description: "Configurable elections for any scale, from local committees to national polls."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-900 to-teal-900 text-white">
          <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Secure, Transparent Blockchain Elections
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-200">
                Vote-Chain provides a tamper-proof voting platform backed by blockchain 
                technology, ensuring election integrity and transparency.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-white text-teal-900 hover:bg-gray-100"
                  onClick={() => navigate("/elections")}
                >
                  View Elections
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate("/register")}
                >
                  Register to Vote
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Vote-Chain?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-4 gap-4 relative">
              {/* Connection lines */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -z-10"></div>
              
              {/* Steps */}
              <div className="bg-white rounded-lg shadow-md p-6 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">1</div>
                <h3 className="text-lg font-semibold mb-3 mt-2 text-center">Register</h3>
                <p className="text-gray-600 text-center">Create your secure account with verified identity credentials</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">2</div>
                <h3 className="text-lg font-semibold mb-3 mt-2 text-center">Authenticate</h3>
                <p className="text-gray-600 text-center">Verify your eligibility for specific elections</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">3</div>
                <h3 className="text-lg font-semibold mb-3 mt-2 text-center">Cast Vote</h3>
                <p className="text-gray-600 text-center">Submit your encrypted vote securely on the blockchain</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">4</div>
                <h3 className="text-lg font-semibold mb-3 mt-2 text-center">Verify</h3>
                <p className="text-gray-600 text-center">Receive a receipt and verify your vote was counted correctly</p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                size="lg"
                onClick={() => navigate("/how-it-works")}
              >
                Learn More About Our Process <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-teal-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to experience secure elections?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of organizations and millions of voters who trust Vote-Chain 
              for secure, transparent, and verifiable voting.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-teal-900 hover:bg-gray-100"
                onClick={() => navigate("/register")}
              >
                Register Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/contact")}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
