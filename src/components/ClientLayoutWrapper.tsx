'use client'

import { useState, useEffect } from 'react'
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { Toaster } from 'react-hot-toast'
import { getAvailableRewards, getUserByEmail } from '@/utils/db/actions'

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)

  useEffect(() => {
    // Safe localStorage access
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null
    
    const fetchTotalEarnings = async () => {
      try {
        if (userEmail) {
          const user = await getUserByEmail(userEmail)
          if (user) {
            const availableRewards = await getAvailableRewards(user.id)
            setTotalEarnings(availableRewards)
          }
        }
      } catch (error) {
        console.error('Error fetching total earnings:', error)
      }
    }

    fetchTotalEarnings()

    // Clean up extension-added attributes
    document.body.removeAttribute('data-rm-theme')
    document.body.removeAttribute('data-new-gr-c-s-check-loaded')
    document.body.removeAttribute('data-gr-ext-installed')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} totalEarnings={totalEarnings} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} />
        <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}