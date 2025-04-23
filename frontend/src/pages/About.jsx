import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent,CardTitle } from "@/components/ui/card";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Intro Section */}
        <section className="bg-gradient-to-r from-teal-900 to-teal-900 text-white">
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Vote-Chain</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-200">
              Vote-Chain is committed to revolutionizing the democratic process by ensuring
              secure, verifiable, and transparent elections powered by blockchain technology.
            </p>
          </div>
        </section>

        {/* Mission and Vision */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10">
            <div>
                <Card className="animate-pulse">
                    <CardContent className="p-6">
                        <CardTitle className="text-3xl font-bold text-teal-900 mb-4">Our Mission</CardTitle>
                        <p className="text-gray-700 text-lg">
                            To empower organizations and governments to conduct tamper-proof elections using a
                            decentralized and transparent system.
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card className="animate-pulse">
                    <CardContent className="p-6">
                        <CardTitle className="text-3xl font-bold text-teal-900 mb-4">Our Vision</CardTitle>
                        <p className="text-gray-700 text-lg">
                            A world where every election is secure, every vote is counted, and every citizen has
                            confidence in the outcome.
                        </p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-teal-900 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Whether you're a voter, an organizer, or a curious innovator, you can help shape the
              future of democracy with Vote-Chain.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-white text-teal-900 hover:bg-gray-100"
                onClick={() => navigate("/register")}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;