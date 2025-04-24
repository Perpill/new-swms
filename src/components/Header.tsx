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

// const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       if (isLogin) {
//         // Login logic
//         console.log("Attempting login for email:", email);
//         const user = await getUserByEmail(email);

//         if (!user) {
//           console.error("Login failed: User not found for email:", email);
//           throw new Error(
//             "User not found. Please check your email or sign up."
//           );
//         }

//         console.log("User found:", user);
//         onLoginSuccess(email, user.name || "User");
//         // toast.success("Logged in successfully");
//         console.log("Logged in successfully");
//       } else {
//         // Signup logic
//         console.log("Attempting to create user:", { email, name, phone });

//         const result = await createUser(email, name, phone);

//         if (!result) {
//           console.error("Signup failed: No result returned from createUser");
//           throw new Error("Failed to create user account");
//         }

//         if (result.error) {
//           console.error("Signup failed:", result.error);
//           throw new Error(result.error);
//         }

//         console.log("User created successfully:", { email, name, phone });
//         onLoginSuccess(email, name, phone,"user");
//         console.log("Account created and logged in successfully");
//       }

//       onClose();
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "An unknown error occurred";
//       console.error("Authentication error:", {
//         error: errorMessage,
//         timestamp: new Date().toISOString(),
//         userInput: { email, name, phone },
//       });

//       setError(errorMessage);
//       // toast.error(errorMessage);
//       console.log(errorMessage)
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <h2 className="text-2xl font-bold mb-6 text-center">
//           {isLogin ? "Login" : "Sign Up"}
//         </h2>

//         {error && (
//           <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             {!isLogin && (
//               <>
//                 <div>
//                   <label
//                     htmlFor="phone"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Phone
//                   </label>
//                   <Input
//                     id="phone"
//                     type="text"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     required={!isLogin}
//                     // placeholder=""
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="name"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Name
//                   </label>
//                   <Input
//                     id="name"
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required={!isLogin}
//                     // placeholder="John Doe"
//                   />
//                 </div>
//               </>
//             )}

//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email
//               </label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 // placeholder="your@email.com"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Password
//               </label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 // placeholder="••••••••"
//               />
//             </div>

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
//             </Button>
//           </div>
//         </form>

//         <div className="mt-4 text-center text-sm">
//           {isLogin ? (
//             <p>
//               Don't have an account?{" "}
//               <button
//                 onClick={() => setIsLogin(false)}
//                 className="text-blue hover:underline"
//               >
//                 Sign up
//               </button>
//             </p>
//           ) : (
//             <p>
//               Already have an account?{" "}
//               <button
//                 onClick={() => setIsLogin(true)}
//                 className="text-blue hover:underline"
//               >
//                 Login
//               </button>
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

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

  // const handleBalanceUpdate = (event: Event) => {
  //   const customEvent = event as CustomEvent<number>;
  //   setBalance(customEvent.detail);
  // };
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

    // Set up event listener for balance updates
    // const handleBalanceUpdate = () => {
    //   if (userInfo.id) {
    //     getUserBalance(userInfo.id);
    //   }
    // };

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


    //  setUserInfo({ email: "", name: "" });
     setBalance(0);
     setNotifications([]);
        // Clear sessionStorage if used
        sessionStorage.clear();
      // Show success toast
      toast.success("Logged out successfully", {
        position: "top-center",
        duration: 2000,
      });

    setLoggedIn(false);
    setUserInfo({ email: "", name: "" });
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    router.push("/")
  };

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
              {/* <Leaf className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mr-1 md:mr-2" /> */}
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
              {/* <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div> */}
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



                 {/* Reward Balance - Added this section */}
                 {/* {loggedIn && (
  <div className="flex items-center bg-green-50 rounded-full px-3 py-1">
    <Coins className="h-4 w-4 text-green-600 mr-1" />
    <span className="font-medium text-sm text-green-700">
      {balance} pts
    </span>
  </div>
)} */}
            {/* {loggedIn && (
              <div className="flex items-center bg-blue-50 rounded-full px-3 py-1">
                <Coins className="h-4 w-4 text-blue-500 mr-1" />
                <span className="font-medium text-sm text-blue-700">
                  {balance} pts
                </span>
              </div>
            )} */}
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
                  // setIsLogin(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-2 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Login
              </button>
            ) : (
              // <Button
              //   onClick={() =>   {
              //     console.log("Button clicked, setting showAuthModal to true") ;
              //     setShowAuthModal(true)} }
              //   className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base"
              // >
              //   Login
              //   <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
              // </Button>
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
                  {/* <DropdownMenuItem>
                    <Link href="/settings">Profile</Link>
                  </DropdownMenuItem> */}
                  {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
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
        // isLogin={isLogin}
        // setIsLogin={setIsLogin}
      />
    </>
  );
}
