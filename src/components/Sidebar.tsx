import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
// import { MapPin, Trash, Coins, Medal, Settings, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserByEmail } from "@/utils/db/actions";

interface User {
  id: number;
  email: string;
  name: string;
  role: string; // 'reporter' or 'collector
}

const commonItems = [
  { href: "/", label: "Home" },
  { href: "/rewards", label: "Rewards" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const reporterOnlyItems = [
  { href: "/report", label: "Report Waste" },
];

const collectorOnlyItems = [
  { href: "/collect",  label: "Collect Waste" },
];

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem("userEmail");

        console.log(localStorage.getItem("userEmail"));
        console.log("Current user:", user);
        // console.log("Sidebar items:", getSidebarItems());

        if (!email) {
          console.log("No user, please log in");
          setLoading(false);
          return;
        }

        const userData = await getUserByEmail(email);
        console.log("Fetched user data:", userData); // Debug log

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role//.toLowerCase(), // Ensure lowercase for consistency
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <aside
        className={`bg-white border-r pt-20 border-gray-200 text-gray-800 w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex justify-center items-center h-full">
          <p>Loading...</p>
        </div>
      </aside>
    );
  }

  // Combine items based on user role
  const getSidebarItems = () => {
    const items = [...commonItems];

    if (user?.role === "0") {//reporter
      items.push(...reporterOnlyItems);
    } else if (user?.role === "1") { //collector
      items.push(...collectorOnlyItems);
    }

    return items;
  };

  return (
    <aside
      className={`bg-white border-r pt-20 border-gray-200 text-gray-800 w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <nav className="h-full flex flex-col justify-between">
        <div className="px-4 py-6 space-y-8">
          {getSidebarItems().map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start py-3 ${
                  pathname === item.href
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {/* <item.icon className="mr-3 h-5 w-5" /> */}
                <span className="text-base">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}