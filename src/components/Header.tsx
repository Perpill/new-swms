// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {toast,Toaster} from 'sonner'
import {
  Menu,
  Coins,
  // Leaf,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
  LogOut,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AuthModal from '@/components/AuthModal'
import {
  createUser,
  getUnreadNotifications,
  markNotificationAsRead,
  getUserByEmail,
  getUserBalance,
  getRewardTransactions,
} from "@/utils/db/actions";

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, name: string) => void;
}

interface UserInfo {
  email:string;
  name:string;
  role?:string;
  id?:number;
}
export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ email: "", name: "" });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();
  const router=useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [balance, setBalance] = useState(0);
  const [logoutLoading, setLogoutLoading] = useState(false)

  let inactivityTimer: NodeJS.Timeout;

  const handleBalanceUpdate = async () => {
    if (userInfo.id) {
      await fetchAndUpdateBalance(userInfo.id);
    }
  };



  const fetchAndUpdateBalance = async (userId: number) => {
    try {
      const currentBalance = await getUserBalance(userId);
      setBalance(Math.max(currentBalance, 0)); // Ensure balance is never negative
      return currentBalance;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return 0;
    }
  };

useEffect(() => {
  resetInactivityTimer()

  const activityEvents=['mousedown','mousemove','keypress','scroll','touchstart']

  activityEvents.forEach(event => {
    window.addEventListener(event, resetInactivityTimer)
  })

  //cleanup function
  return()=>{
    if (inactivityTImer) clearTimeout(inactivityTImer)

      activityEvents.forEach(event=>{
        window.removeEventListener(event,resetInactivityTimer)
      });
  }

    const fetchUserData = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        const user = await getUserByEmail(email);
        if (user) {
          setUserInfo({
            email: user.email,
            name: user.name || "User",
            id: user.id
          });
          setLoggedIn(true);
          // await getUserBalance(user.id);
          await fetchAndUpdateBalance(user.id);
          
          // Fetch notifications
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    fetchUserData();

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, []);





  const handleLoginSuccess = (email: string, name: string,role:string) => {
    setUserInfo({ email, name, role });
    setLoggedIn(true);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);
  };

  const logout = () => {


     setBalance(0);
     setNotifications([]);
        sessionStorage.clear();
        
      toast.success("Logged out successfully", {
        position: "top-center",
        duration: 2000,
      });

    setLoggedIn(false);
    setUserInfo({ email: "", name: "" });
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    //clear any existing timer
    if(inactivityTimer) clearTimeout(inactivityTimer)

    router.push("/")
  };

  //reset the inactivity timer on user activity
  const resetInactivityTimer=()=>{
    if(inactivityTimer) clearTimeout(inactivityTimer)

      //settimer (30 minutes = 30 * 60 *1000 milliseconds)
inactivityTimer=setTimeout(logout,10 * 60 *1000)
  }

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );
  };

  return (
    <>
          <Toaster richColors position="top-center" />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:mr-4"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center">
              <div className="flex flex-col">
                <span className="font-bold text-base md:text-lg text-gray-800">
                  Smart Waste
                </span>
                <span className="text-[8px] md:text-[10px] text-gray-500 -mt-1">
                  Management System
                </span>
              </div>
            </Link>
          </div>

          {!isMobile && (
            <div className="flex-1 max-w-xl mx-4">
            </div>
          )}

          <div className="flex items-center">
            {/* {isMobile && (
              <Button variant="ghost" size="icon" className="mr-2">
                <Search className="h-5 w-5" />
              </Button>
            )} */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{notification.type}</span>
                        <span className="text-sm text-gray-500">
                          {notification.message}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {loggedIn && (
            <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
              <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-blue-500" />
              <span className="font-semibold text-sm md:text-base text-gray-800">
                {balance.toFixed(2)}
              </span>
            </div>
            )}

            {!loggedIn ? (
              <button
                onClick={() => {
                  console.log("Login button clicked");
                  setShowAuthModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-2 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Login
              </button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex items-center"
                  >
                    <User className="h-5 w-5 mr-1" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    {userInfo.name || userInfo.email}
                   
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
