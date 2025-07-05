
import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"

const DashboardTab = () => {
  const [stats, setStats] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      // Fetch all tasks first to calculate real distributions
      
      const tasksResponse = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (tasksResponse.status === 200) {
        setTasks(tasksResponse.data)
      }

      // Then fetch dashboard stats
      const statsResponse = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (statsResponse.status === 200) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate priority distribution
  const calculatePriorityDistribution = () => {
    if (!tasks || tasks.length === 0) {
      return { high: 0, medium: 0, low: 0, highCount: 0, mediumCount: 0, lowCount: 0 }
    }

    const highCount = tasks.filter((task) => task.priority === 3).length
    const mediumCount = tasks.filter((task) => task.priority === 2).length
    const lowCount = tasks.filter((task) => task.priority === 1).length

    const total = tasks.length

    return {
      high: Math.round((highCount / total) * 100),
      medium: Math.round((mediumCount / total) * 100),
      low: Math.round((lowCount / total) * 100),
      highCount,
      mediumCount,
      lowCount,
    }
  }

  // Generate daily completion data for the last 7 days
  const generateDailyCompletionData = () => {
    if (!tasks || tasks.length === 0) {
      return Array(7).fill(0)
    }

    const today = new Date()
    const dailyData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      // Count completed tasks for this day
      const completedToday = tasks.filter((task) => {
        if (!task.completed_at || task.status !== "completed") return false
        const completedDate = new Date(task.completed_at)
        return completedDate >= date && completedDate < nextDate
      }).length

      dailyData.push(completedToday)
    }

    return dailyData
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const currentWeek = stats?.currentWeek || {}
  const weeklyData = stats?.weeklyData || []
  const priorityDistribution = calculatePriorityDistribution()
  const dailyCompletionData = generateDailyCompletionData()
  const maxDailyValue = Math.max(...dailyCompletionData, 1)

  const completionRate =
    currentWeek.total_tasks > 0 ? Math.round((currentWeek.completed_tasks / currentWeek.total_tasks) * 100) : 0

  // Get day names for the last 7 days
  const getDayLabels = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const today = new Date()
    const dayLabels = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dayLabels.push(days[date.getDay()])
    }

    return dayLabels
  }

  const dayLabels = getDayLabels()

  // Pie Chart Component for Priority Distribution
  const PriorityPieChart = () => {
    if (tasks.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-gray-500">
          <p>No tasks to display</p>
        </div>
      )
    }

    const { high, medium, low } = priorityDistribution
    const radius = 60
    const circumference = 2 * Math.PI * radius

    // Calculate stroke offsets for pie chart
    const highOffset = 0
    const mediumOffset = (high / 100) * circumference
    const lowOffset = mediumOffset + (medium / 100) * circumference

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="140" height="140" className="transform -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="20" />
            {high > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#ef4444"
                strokeWidth="20"
                strokeDasharray={`${(high / 100) * circumference} ${circumference}`}
                strokeDashoffset={0}
                className="transition-all duration-500"
              />
            )}
            {medium > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray={`${(medium / 100) * circumference} ${circumference}`}
                strokeDashoffset={-mediumOffset}
                className="transition-all duration-500"
              />
            )}
            {low > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${(low / 100) * circumference} ${circumference}`}
                strokeDashoffset={-lowOffset}
                className="transition-all duration-500"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{tasks.length}</div>
              <div className="text-xs text-gray-500">Tasks</div>
            </div>
          </div>
        </div>
        <div className="ml-6 space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">High ({priorityDistribution.highCount})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Medium ({priorityDistribution.mediumCount})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Low ({priorityDistribution.lowCount})</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>

      {/* Current Week Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{currentWeek.total_tasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{currentWeek.completed_tasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{currentWeek.pending_tasks || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Progress</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Completion Rate</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-500">{completionRate}%</div>
        </div>
      </div>

      {/* Weekly Comparison Chart - Only show if there are multiple weeks */}
      {weeklyData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Comparison</h3>
          <div className="space-y-4">
            {weeklyData.map((week, index) => {
              const weekCompletionRate =
                week.total_tasks > 0 ? Math.round((week.completed_tasks / week.total_tasks) * 100) : 0

              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-24 text-sm text-gray-600">
                    {index === 0
                      ? "This Week"
                      : `Week ${new Date(week.week_start).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}`}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>
                        {week.completed_tasks}/{week.total_tasks} tasks
                      </span>
                      <span>{weekCompletionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${index === 0 ? "bg-blue-500" : "bg-green-500"}`}
                        style={{ width: `${weekCompletionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Task Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Priority Distribution</h3>
          <PriorityPieChart />
        </div>

        {/* Daily Completion Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Completion Trend (Last 7 Days)</h3>
          <div className="h-40 flex items-end justify-center space-x-2">
            {dailyCompletionData.map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1 max-w-12">
                <div className="relative w-full h-32 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${value > 0 ? Math.max((value / maxDailyValue) * 100, 8) : 0}%` }}
                  ></div>
                  {value > 0 && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                      {value}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">{dayLabels[index]}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">Tasks completed per day</div>
        </div>
      </div>

      {/* Status Overview Chart */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Overview</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="relative inline-block">
                <svg width="120" height="120" className="transform -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${completionRate * 3.14} 314`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{completionRate}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-900">Completed Tasks</div>
                <div className="text-lg font-bold text-green-600">{currentWeek.completed_tasks || 0}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="relative inline-block">
                <svg width="120" height="120" className="transform -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    strokeDasharray={`${(100 - completionRate) * 3.14} 314`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-600">{100 - completionRate}%</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-900">Pending Tasks</div>
                <div className="text-lg font-bold text-yellow-600">{currentWeek.pending_tasks || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

     
    </div>
  )
}

export default DashboardTab
