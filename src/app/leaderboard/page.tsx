'use client'
import { useState, useEffect } from 'react'
import { getAllRewards, getUserByEmail } from '@/utils/db/actions'
import { toast } from 'react-hot-toast'

type Reward = {
  id: number
  userId: number
  points: number
  level: number
  createdAt: Date
  userName: string | null
}

export default function LeaderboardPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null)

  useEffect(() => {
    const fetchRewardsAndUser = async () => {
      setLoading(true)
      try {
        const fetchedRewards = await getAllRewards()
        setRewards(fetchedRewards)

        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail)
          if (fetchedUser) {
            setUser(fetchedUser)
          } else {
            toast.error('User not found. Please log in again.')
          }
        } else {
          toast.error('User not logged in. Please log in.')
        }
      } catch (error) {
        console.error('Error fetching rewards and user:', error)
        toast.error('Failed to load leaderboard. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRewardsAndUser()
  }, [])

  return (
    <div className="">
      <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Leaderboard </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex justify-between items-center text-white">
                <span className="text-2xl font-bold">Top Performers</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward, index) => (
                    <tr key={reward.id} className={`${user && user.id === reward.userId ? 'bg-indigo-50' : ''} hover:bg-gray-50 transition-colors duration-150 ease-in-out`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reward.userName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-semibold text-gray-900">{reward.points.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Level {reward.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}