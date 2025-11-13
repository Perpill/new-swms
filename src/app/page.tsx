// @ts-nocheck
"use client";
import "./globals.css";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  LeafyGreen,
  Recycle,
  Users,
  Coins,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ContractInteraction from "@/components/ContractInteraction";
import {
  getRecentReports,
  getAllRewards,
  getWasteCollectionTasks,
  getUserByEmail,
} from "@/utils/db/actions"; // Combined import
import AuthModal from "@/components/AuthModal";

function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-blue-700 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-blue-600 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-blue-500 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-blue-400 opacity-80 animate-bounce"></div>
      {/* <Leaf className="absolute inset-0 m-auto h-16 w-16 text-blue-600 animate-pulse" /> */}
    </div>
  );
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0,
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const email = localStorage.getItem("userEmail");
        if (email) {
          const userData = await getUserByEmail(email);
          if (userData) {
            setUserRole(userData.role); // "0" for reporter, "1" for collector
            setLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    async function fetchImpactData() {
      try {
        const [reports, rewards, tasks] = await Promise.all([
          getRecentReports(100),
          getAllRewards(),
          getWasteCollectionTasks(100),
        ]);

        const wasteCollected = tasks.reduce((total, task) => {
          const match = task.amount.match(/(\d+(\.\d+)?)/);
          return total + (match ? parseFloat(match[0]) : 0);
        }, 0);

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10,
          reportsSubmitted: reports.length,
          tokensEarned: rewards.reduce(
            (total, reward) => total + (reward.points || 0),
            0
          ),
          co2Offset: Math.round(wasteCollected * 0.5 * 10) / 10,
        });
      } catch (error) {
        console.error("Error fetching impact data:", error);
        setImpactData({
          wasteCollected: 0,
          reportsSubmitted: 0,
          tokensEarned: 0,
          co2Offset: 0,
        });
      }
    }

    fetchUserData();
    fetchImpactData();
  }, []);

  const handleLoginSuccess = (email: string, name: string, role: string) => {
    setLoggedIn(true);
    setUserRole(role);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);
    setShowAuthModal(false);
  };

  const handleGetStartedClick = () => {
    if (!loggedIn) {
      setShowAuthModal(true);
    }
    // If loggedIn, the Link component will handle the navigation
  };

  const getDestinationPath = () => {
    if (userRole === "0") {
      return "/report";
    } else if (userRole === "1") {
      return "/collect";
    }
    return "/"; // Default fallback
  };

  // Only show report button if user is a reporter (role "0") or not logged in
  const shouldShowReportButton = !loggedIn || userRole === "0";

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-20">
        <AnimatedGlobe />
        <h1 className="text-6xl font-bold mb-6 text-gray-800 tracking-tight">
          <span className="text-blue-600">Waste Management</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Join us in making waste management more efficient and rewarding!
        </p>

        {!loggedIn ? (
          <Button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 hover:bg-primary text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Link href={getDestinationPath()}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
              {userRole === "0" ? "Report Waste" : "Collect Waste"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-10 mb-20">
        <FeatureCard
          icon={LeafyGreen}
          title="Eco-Friendly"
          description="Contribute to a cleaner environment by reporting and collecting waste."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get tokens for your contributions to waste management efforts."
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Be part of a growing community committed to sustainable practices."
        />
      </section>

      <section className="bg-white p-10 rounded-3xl shadow-lg mb-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
          Impact
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <ImpactCard
            title="Collected Waste"
            value={`${impactData.wasteCollected} kg`}
            icon={Recycle}
          />
          <ImpactCard
            title="Submitted Reports"
            value={impactData.reportsSubmitted.toString()}
            icon={MapPin}
          />
          <ImpactCard
            title="Earned Tokens"
            value={impactData.tokensEarned.toString()}
            icon={Coins}
          />
          <ImpactCard
            title="CO2 Offset"
            value={`${impactData.co2Offset} kg`}
            icon={LeafyGreen}
          />
        </div>
      </section>
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

function ImpactCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("en-US", { maximumFractionDigits: 1 })
      : value;

  return (
    <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-md">
      <Icon className="h-10 w-10 text-blue-500 mb-4" />
      <p className="text-3xl font-bold mb-2 text-gray-800">{formattedValue}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col items-center text-center">
      <div className="bg-blue-100 p-4 rounded-full mb-6">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
