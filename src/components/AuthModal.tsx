"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  createUser,
  getUserByEmail,
} from "@/utils/db/actions";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, name: string, role: string) => void;
}

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login logic
        console.log("Attempting login for email:", email);
        const user = await getUserByEmail(email);

        if (!user) {
          console.error("Login failed: User not found for email:", email);
          throw new Error(
            "User not found. Please check your email or sign up."
          );
        }

        console.log("User found:", user);
        // Ensure role exists, default to "0" if not
        const userRole = user.role || "0"; // Default role for all users
        onLoginSuccess(email, user.name, userRole);
      } else {
        // Signup logic - new users get role "0" (reporter) by default
        console.log("Attempting to create user:", { email, name, phone });

        const result = await createUser(email, name, phone);

        if (!result) {
          console.error("Signup failed: No result returned from createUser");
          throw new Error("Failed to create user account");
        }

        if (result.error) {
          console.error("Signup failed:", result.error);
          throw new Error(result.error);
        }

        console.log("User created successfully:", { email, name, phone });
        onLoginSuccess(email, name, user.role || "0"); // Explicitly set role to "0" for new users
      }

      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Authentication error:", errorMessage);
      setError(errorMessage);
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
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin}
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : isLogin ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
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

export default AuthModal;







// // @ts-nocheck
// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import {
//   Menu,
//   Coins,
//   // Leaf,
//   Search,
//   Bell,
//   User,
//   ChevronDown,
//   LogIn,
//   LogOut,
//   X,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { useMediaQuery } from "@/hooks/useMediaQuery";
// import {
//   createUser,
//   getUnreadNotifications,
//   markNotificationAsRead,
//   getUserByEmail,
//   getUserBalance,
//   getRewardTransactions,
// } from "@/utils/db/actions";


// // In AuthModal.tsx
// interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onLoginSuccess: (email: string, name: string, role?: string) => void; // Add role parameter
// }

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