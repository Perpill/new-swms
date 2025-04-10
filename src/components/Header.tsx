// @ts-nocheck
'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut, X } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { createUser, getUnreadNotifications, markNotificationAsRead, getUserByEmail, getUserBalance } from "@/utils/db/actions"

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, name: string) => void;
}

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login logic - verify credentials
        const user = await getUserByEmail(email);
        if (!user) {
          throw new Error('User not found');
        }
        // In a real app, you would verify password here
        onLoginSuccess(email, user.name || 'User');
      } else {
        // Signup logic
        await createUser(email, name);
        onLoginSuccess(email, name);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ email: '', name: '' });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Check for existing session on load
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName') || 'User';
    if (email) {
      setUserInfo({ email, name });
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    fetchNotifications();
    const notificationInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

    fetchUserBalance();
    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, [userInfo]);

  const handleLoginSuccess = (email: string, name: string) => {
    setUserInfo({ email, name });
    setLoggedIn(true);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
  };

  const logout = () => {
    setLoggedIn(false);
    setUserInfo({ email: '', name: '' });
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  };

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2 md:mr-4" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center">
              <Leaf className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mr-1 md:mr-2" />
              <div className="flex flex-col">
                <span className="font-bold text-base md:text-lg text-gray-800">Smart Waste</span>
                <span className="text-[8px] md:text-[10px] text-gray-500 -mt-1">Management System</span>
              </div>
            </Link>
          </div>
          
          {!isMobile && (
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" className="mr-2">
                <Search className="h-5 w-5" />
              </Button>
            )}
            
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
                        <span className="text-sm text-gray-500">{notification.message}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
              <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-blue-500" />
              <span className="font-semibold text-sm md:text-base text-gray-800">
                {balance.toFixed(2)}
              </span>
            </div>
            
            {!loggedIn ? (

<button 
onClick={() => {
  console.log("Native button clicked");
  setShowAuthModal(true)}}
className="bg-blue-600 text-white p-2"
>
Login
</button>

              // <Button 
              //   onClick={() =>   {
              //     console.log("Button clicked, setting showAuthModal to true") ;
              //     setShowAuthModal(true)} }
              //   className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base"
              // >
              //   Login
              //   <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
              // </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex items-center">
                    <User className="h-5 w-5 mr-1" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    {userInfo.name || userInfo.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
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

// // @ts-nocheck
// 'use client'
// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { usePathname } from 'next/navigation'
// import { Button } from "@/components/ui/button"
// import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut } from "lucide-react"
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger 
// } from "@/components/ui/dropdown-menu"
// import { Badge } from "@/components/ui/badge"
// // import { Web3Auth } from "@web3auth/modal"
// // import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
// // import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
// import { useMediaQuery } from "@/hooks/useMediaQuery"
// import { createUser, getUnreadNotifications, markNotificationAsRead, getUserByEmail, getUserBalance } from "@/utils/db/actions"

// // const clientId = "BJKdDFkNtkWX87XqkuWrDu4rbkSvWyQZ5lswS0ucINxxcN0inRVW8zzKAywPPzgiOHP7_3PcfFwfpvcQvSdaLRs";
// const clientId = "BGCfUD7I8xYFsJopW8bDV6GRVuaFYlEe2Hw9IxxsVoXCiPfttH2n0H2xIJZzdQ74Ro5rw50we-tm2mcgAadzmkM";

// // const chainConfig = {
// //   chainNamespace: CHAIN_NAMESPACES.EIP155,
// //   chainId: "625 (0x271)",
// //   // chainId: "0xaa36a7",
// //   // rpcTarget: "https://rpc.ankr.com/eth_sepolia",
// //   rpcTarget: "https://rpc.testnet.thebinaryholdings.com",
// //   displayName: "Ethereum Sepolia Testnet",
// //   blockExplorerUrl: "https://sepolia.etherscan.io",
// //   ticker: "ETH",
// //   tickerName: "Ethereum",
// //   logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
// // };

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: '0xaa36a7', // or 11155111
//   rpcTarget: 'https://eth-sepolia.g.alchemy.com/v2/02e7d0b8cbea4d1b95addfa301dc40b1', // Replace with your RPC URL
//   displayName: 'Sepolia Testnet',
//   blockExplorerUrl: 'https://sepolia.etherscan.io/',
//   ticker: 'ETH',
//   tickerName: 'Ethereum',
//   logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', // or your preferred logo
// };

// const privateKeyProvider = new EthereumPrivateKeyProvider({
//   config: { chainConfig },
// });

// const web3auth = new Web3Auth({
//   clientId,
//   web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, // Changed from SAPPHIRE_MAINNET to TESTNET
//   privateKeyProvider,
// });

// interface HeaderProps {
//   onMenuClick: () => void;
//   totalEarnings: number;
// }

// export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
//   const [provider, setProvider] = useState<IProvider | null>(null);
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [userInfo, setUserInfo] = useState<any>(null);
//   const pathname = usePathname()
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const isMobile = useMediaQuery("(max-width: 768px)")
//   const [balance, setBalance] = useState(0)

//   console.log('user info', userInfo);
  
//   useEffect(() => {
//     const init = async () => {
//       try {
//         await web3auth.initModal();
//         setProvider(web3auth.provider);

//         if (web3auth.connected) {
//           setLoggedIn(true);
//           const user = await web3auth.getUserInfo();
//           setUserInfo(user);
//           if (user.email) {
//             localStorage.setItem('userEmail', user.email);
//             try {
//               await createUser(user.email, user.name || 'Anonymous User');
//             } catch (error) {
//               console.error("Error creating user:", error);
//               // Handle the error appropriately, maybe show a message to the user
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error initializing Web3Auth:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     init();
//   }, []);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       if (userInfo && userInfo.email) {
//         const user = await getUserByEmail(userInfo.email);
//         if (user) {
//           const unreadNotifications = await getUnreadNotifications(user.id);
//           setNotifications(unreadNotifications);
//         }
//       }
//     };

//     fetchNotifications();

//     // Set up periodic checking for new notifications
//     const notificationInterval = setInterval(fetchNotifications, 30000); // Check every 30 seconds

//     return () => clearInterval(notificationInterval);
//   }, [userInfo]);

//   useEffect(() => {
//     const fetchUserBalance = async () => {
//       if (userInfo && userInfo.email) {
//         const user = await getUserByEmail(userInfo.email);
//         if (user) {
//           const userBalance = await getUserBalance(user.id);
//           setBalance(userBalance);
//         }
//       }
//     };

//     fetchUserBalance();

//     // Add an event listener for balance updates
//     const handleBalanceUpdate = (event: CustomEvent) => {
//       setBalance(event.detail);
//     };

//     window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);

//     return () => {
//       window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
//     };
//   }, [userInfo]);

//   const login = async () => {
//     if (!web3auth) {
//       console.log("web3auth not initialized yet");
//       return;
//     }
//     try {
//       const web3authProvider = await web3auth.connect();
//       setProvider(web3authProvider);
//       setLoggedIn(true);
//       const user = await web3auth.getUserInfo();
//       setUserInfo(user);
//       if (user.email) {
//         localStorage.setItem('userEmail', user.email);
//         try {
//           await createUser(user.email, user.name || 'Anonymous User');
//         } catch (error) {
//           console.error("Error creating user:", error);
//           // Handle the error appropriately, maybe show a message to the user
//         }
//       }
//     } catch (error) {
//       console.error("Error during login:", error);
//     }
//   };

//   const logout = async () => {
//     if (!web3auth) {
//       console.log("web3auth not initialized yet");
//       return;
//     }
//     try {
//       await web3auth.logout();
//       setProvider(null);
//       setLoggedIn(false);
//       setUserInfo(null);
//       localStorage.removeItem('userEmail');
//     } catch (error) {
//       console.error("Error during logout:", error);
//     }
//   };

//   const getUserInfo = async () => {
//     if (web3auth.connected) {
//       const user = await web3auth.getUserInfo();
//       setUserInfo(user);
//       if (user.email) {
//         localStorage.setItem('userEmail', user.email);
//         try {
//           await createUser(user.email, user.name || 'Anonymous User');
//         } catch (error) {
//           console.error("Error creating user:", error);
//           // Handle the error appropriately, maybe show a message to the user
//         }
//       }
//     }
//   };

//   const handleNotificationClick = async (notificationId: number) => {
//     await markNotificationAsRead(notificationId);
//     setNotifications(prevNotifications => 
//       prevNotifications.filter(notification => notification.id !== notificationId)
//     );
//   };

//   if (loading) {
//     return <div>Loading Web3Auth...</div>;
//   }

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
//       <div className="flex items-center justify-between px-4 py-2">
//         <div className="flex items-center">
//           <Button variant="ghost" size="icon" className="mr-2 md:mr-4" onClick={onMenuClick}>
//             <Menu className="h-6 w-6" />
//           </Button>
//           <Link href="/" className="flex items-center">
//             <Leaf className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mr-1 md:mr-2" />
//             <div className="flex flex-col">
//               <span className="font-bold text-base md:text-lg text-gray-800">Smart Waste</span>
//               <span className="text-[8px] md:text-[10px] text-gray-500 -mt-1">Management System</span>
//             </div>
//           </Link>
//         </div>
//         {!isMobile && (
//           <div className="flex-1 max-w-xl mx-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             </div>
//           </div>
//         )}
//         <div className="flex items-center">
//           {isMobile && (
//             <Button variant="ghost" size="icon" className="mr-2">
//               <Search className="h-5 w-5" />
//             </Button>
//           )}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="mr-2 relative">
//                 <Bell className="h-5 w-5" />
//                 {notifications.length > 0 && (
//                   <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
//                     {notifications.length}
//                   </Badge>
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-64">
//               {notifications.length > 0 ? (
//                 notifications.map((notification) => (
//                   <DropdownMenuItem 
//                     key={notification.id}
//                     onClick={() => handleNotificationClick(notification.id)}
//                   >
//                     <div className="flex flex-col">
//                       <span className="font-medium">{notification.type}</span>
//                       <span className="text-sm text-gray-500">{notification.message}</span>
//                     </div>
//                   </DropdownMenuItem>
//                 ))
//               ) : (
//                 <DropdownMenuItem>No new notifications</DropdownMenuItem>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
//             <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-blue-500" />
//             <span className="font-semibold text-sm md:text-base text-gray-800">
//               {balance.toFixed(2)}
//             </span>
//           </div>
//           {!loggedIn ? (
//             <Button onClick={login} className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base">
//               Login
//               <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
//             </Button>
//           ) : (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="flex items-center">
//                   <User className="h-5 w-5 mr-1" />
//                   <ChevronDown className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={getUserInfo}>
//                   {userInfo ? userInfo.name : "Fetch User Info"}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Link href="/settings">Profile</Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>Settings</DropdownMenuItem>
//                 <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}
//         </div>
//       </div>
//     </header>
//   )
// }