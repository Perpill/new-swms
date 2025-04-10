import './globals.css'
import 'leaflet/dist/leaflet.css'
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  )
}




// import { useState, useEffect } from "react"
// import { Inter } from 'next/font/google'
// import "./globals.css"
// import Header from "@/components/Header"
// import Sidebar from "@/components/Sidebar"
// import 'leaflet/dist/leaflet.css'
// import { Toaster } from 'react-hot-toast'
// import { getAvailableRewards, getUserByEmail } from '@/utils/db/actions'

// const inter = Inter({ subsets: ['latin'] })

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [totalEarnings, setTotalEarnings] = useState(0)
//   const [mounted, setMounted] = useState(false) // Track if component is mounted

//   useEffect(() => {
//     setMounted(true) // Set mounted to true after hydration
//     const fetchTotalEarnings = async () => {
//       try {
//         const userEmail = localStorage.getItem('userEmail')
//         if (userEmail) {
//           const user = await getUserByEmail(userEmail)
//           if (user) {
//             const availableRewards = await getAvailableRewards(user.id) as any
//             setTotalEarnings(availableRewards)
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching total earnings:', error)
//       }
//     }

//     fetchTotalEarnings()
//   }, [])

//   // Clean up extension-added attributes
//   useEffect(() => {
//     if (mounted) {
//       document.body.removeAttribute('data-rm-theme')
//       document.body.removeAttribute('data-new-gr-c-s-check-loaded')
//       document.body.removeAttribute('data-gr-ext-installed')
//     }
//   }, [mounted])

//   if (!mounted) {
//     // Return null on first render to avoid hydration mismatch
//     return null
//   }

//   return (
//     <html lang="en">
//       <body className={inter.className} suppressHydrationWarning>
//         <div className="min-h-screen bg-gray-50 flex flex-col">
//           <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} totalEarnings={totalEarnings} />
//           <div className="flex flex-1">
//             <Sidebar open={sidebarOpen} />
//             <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
//               {children}
//             </main>
//           </div>
//         </div>
//         <Toaster />
//       </body>
//     </html>
//   )
// }


