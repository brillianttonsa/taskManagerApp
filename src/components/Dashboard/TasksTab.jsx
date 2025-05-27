import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"

const TasksTab = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: 1,
  })
  const { token, user } = useAuth()

  useEffect(() => {
    fetchTasks()
  }, [])

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
        // Only show personal tasks (not assigned to others)
        const personalTasks = data.filter((task) => !task.assigned_to || task.assigned_to === user.id)
        // Sort tasks: first by status (pending first), then by priority (high to low)
        personalTasks.sort((a, b) => {
          // First sort by status - pending tasks first
          if (a.status !== b.status) {
            return a.status === "pending" ? -1 : 1
          }
          // Then sort by priority - high priority first (3 > 2 > 1)
          return b.priority - a.priority
        })
        setTasks(personalTasks)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const url = editingTask ? `${API_URL}/tasks/${editingTask.id}` : `${API_URL}/tasks`

      const method = editingTask ? "PUT" : "POST"

      // For personal tasks, always assign to self
      const taskData = {
        ...formData,
        assigned_to: user.id,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        fetchTasks()
        setShowForm(false)
        setEditingTask(null)
        setFormData({ title: "", description: "", priority: 1 })
      }
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
    })
    setShowForm(true)
  }

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const API_URL = process.env.REACT_APP_API_URL;
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          fetchTasks()
        }
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    }
  }

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed"

    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: newStatus,
          assigned_to: task.assigned_to,
        }),
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3:
        return "bg-red-100 text-red-800"
      case 2:
        return "bg-yellow-100 text-yellow-800"
      case 1:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 3:
        return "High"
      case 2:
        return "Medium"
      case 1:
        return "Low"
      default:
        return "Low"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Personal Tasks</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingTask(null)
            setFormData({ title: "", description: "", priority: 1 })
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add New Task
        </button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingTask ? "Edit Task" : "Add New Task"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  {editingTask ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTask(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No tasks for this week. Create your first task!
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}
                      >
                        {getPriorityText(task.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          task.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status === "completed" ? "Completed" : "Pending"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button onClick={() => handleEdit(task)} className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Progress</h3>
        <div className="space-y-6">
          {/* Completion Rate */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Completion Rate</span>
              <span>
                {tasks.length > 0
                  ? Math.round((tasks.filter((task) => task.status === "completed").length / tasks.length) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    tasks.length > 0
                      ? Math.round((tasks.filter((task) => task.status === "completed").length / tasks.length) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Priority Distribution</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>High</span>
                  <span>{tasks.filter((task) => task.priority === 3).length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        tasks.length > 0
                          ? Math.round((tasks.filter((task) => task.priority === 3).length / tasks.length) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Medium</span>
                  <span>{tasks.filter((task) => task.priority === 2).length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        tasks.length > 0
                          ? Math.round((tasks.filter((task) => task.priority === 2).length / tasks.length) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Low</span>
                  <span>{tasks.filter((task) => task.priority === 1).length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        tasks.length > 0
                          ? Math.round((tasks.filter((task) => task.priority === 1).length / tasks.length) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status Distribution</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Completed</span>
                  <span>{tasks.filter((task) => task.status === "completed").length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        tasks.length > 0
                          ? Math.round(
                              (tasks.filter((task) => task.status === "completed").length / tasks.length) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Pending</span>
                  <span>{tasks.filter((task) => task.status === "pending").length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        tasks.length > 0
                          ? Math.round((tasks.filter((task) => task.status === "pending").length / tasks.length) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksTab
