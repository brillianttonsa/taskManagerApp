
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"

const WeeklyReports = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState("")
  const { token } = useAuth()

  useEffect(() => {
    fetchTasks()
    setSelectedWeek(getCurrentWeek())
  }, [])

  const getCurrentWeek = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day
    const weekStart = new Date(today.setDate(diff))
    return weekStart.toISOString().split("T")[0]
  }

  const fetchTasks = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setTasks(data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDFReport = () => {
    const completedTasks = tasks.filter((task) => task.status === "completed")
    const pendingTasks = tasks.filter((task) => task.status === "pending")

    // Create a simple HTML content for PDF generation
    const reportContent = `
      <html>
        <head>
          <title>Weekly Task Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat-box { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .task-list { margin-bottom: 30px; }
            .task-item { padding: 10px; border-bottom: 1px solid #eee; }
            .completed { color: green; }
            .pending { color: orange; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Weekly Task Report</h1>
            <p>Week of ${new Date(selectedWeek).toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <h3>Total Tasks</h3>
              <p>${tasks.length}</p>
            </div>
            <div class="stat-box">
              <h3>Completed</h3>
              <p class="completed">${completedTasks.length}</p>
            </div>
            <div class="stat-box">
              <h3>Pending</h3>
              <p class="pending">${pendingTasks.length}</p>
            </div>
            <div class="stat-box">
              <h3>Completion Rate</h3>
              <p>${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</p>
            </div>
          </div>
          
          <div class="task-list">
            <h2>Completed Tasks</h2>
            ${completedTasks
              .map(
                (task) => `
              <div class="task-item">
                <strong>${task.title}</strong>
                ${task.description ? `<br><small>${task.description}</small>` : ""}
                <br><small>Priority: ${task.priority === 3 ? "High" : task.priority === 2 ? "Medium" : "Low"}</small>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="task-list">
            <h2>Pending Tasks</h2>
            ${pendingTasks
              .map(
                (task) => `
              <div class="task-item">
                <strong>${task.title}</strong>
                ${task.description ? `<br><small>${task.description}</small>` : ""}
                <br><small>Priority: ${task.priority === 3 ? "High" : task.priority === 2 ? "Medium" : "Low"}</small>
              </div>
            `,
              )
              .join("")}
          </div>
        </body>
      </html>
    `

    // Open in new window for printing/saving as PDF
    const printWindow = window.open("", "_blank")
    printWindow.document.write(reportContent)
    printWindow.document.close()
    printWindow.print()
  }

  const completedTasks = tasks.filter((task) => task.status === "completed")
  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Reports</h2>
        <button
          onClick={generatePDFReport}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <span>📄</span>
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Week</label>
        <input
          type="date"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{pendingTasks.length}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{completionRate}%</div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {completedTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No completed tasks this week</p>
            ) : (
              completedTasks.map((task) => (
                <div key={task.id} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="font-medium text-gray-900">{task.title}</div>
                  {task.description && <div className="text-sm text-gray-600 mt-1">{task.description}</div>}
                  <div className="text-xs text-gray-500 mt-2">
                    Priority: {task.priority === 3 ? "High" : task.priority === 2 ? "Medium" : "Low"}
                    {task.completed_at && (
                      <span className="ml-2">• Completed: {new Date(task.completed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-yellow-500 mr-2">⏳</span>
            Pending Tasks ({pendingTasks.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending tasks this week</p>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="font-medium text-gray-900">{task.title}</div>
                  {task.description && <div className="text-sm text-gray-600 mt-1">{task.description}</div>}
                  <div className="text-xs text-gray-500 mt-2">
                    Priority: {task.priority === 3 ? "High" : task.priority === 2 ? "Medium" : "Low"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Overall Progress</span>
            <span>{completionRate}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: `${completionRate}%` }}
            >
              {completionRate > 10 && `${completionRate}%`}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-gray-500">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
              <div className="text-sm text-gray-500">Tasks Remaining</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyReports
