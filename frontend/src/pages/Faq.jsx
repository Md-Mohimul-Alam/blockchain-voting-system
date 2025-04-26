// src/pages/Faq.jsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Faq = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-teal-700">Frequently Asked Questions</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">What is Vote-Chain?</h2>
            <p className="text-gray-600">Vote-Chain is a secure, blockchain-based voting platform designed for transparency and accessibility.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">How do I register to vote?</h2>
            <p className="text-gray-600">You can register by clicking the "Register" button on the top right and filling out your details with proper identification.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Can I change my vote?</h2>
            <p className="text-gray-600">No. Once a vote is cast, it is immutable to preserve integrity and prevent fraud.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Faq;