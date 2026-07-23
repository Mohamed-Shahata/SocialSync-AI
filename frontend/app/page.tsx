import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Community from "../components/Community";
import Pricing from "../components/Pricing";
import CtaBanner from "../components/CtaBanner";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-bg">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Community />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
