import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const AdminNotify = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow px-6 py-10 max-w-5xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-teal-700 mb-6">Notifications Broadcaster</h1>
        <p className="text-gray-600 text-lg">This is the Notifications Broadcaster page. Add your logic and components here.</p>
      </main>
      <Footer />
    </div>
  );
};

export default AdminNotify;
