// src/pages/PrivacyPolicy.jsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-teal-700">Privacy Policy</h1>
        <p className="text-gray-700 mb-4">We value your privacy. Vote-Chain ensures your personal data is encrypted and never shared without your consent.</p>
        <p className="text-gray-700">We use your information only for identification and voting purposes, and we do not store any sensitive credentials in plain text.</p>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
