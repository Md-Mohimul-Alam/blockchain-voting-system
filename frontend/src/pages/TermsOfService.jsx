// src/pages/TermsOfService.jsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-teal-700">Terms of Service</h1>
        <p className="text-gray-700 mb-4">By using Vote-Chain, you agree to our terms of service. You must be a verified user to participate in any elections.</p>
        <p className="text-gray-700">Any misuse or fraudulent activity will result in permanent suspension and legal action where applicable.</p>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
