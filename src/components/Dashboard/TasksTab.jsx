import { useState, useEffect } from "react"
import axios from "axios"
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
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = response.data

      const personalTasks = data.filter(
        (task) => !task.assigned_to || task.assigned_to === user.id
      )

      personalTasks.sort((a, b) => {
        if (a.status !== b.status) return a.status === "pending" ? -1 : 1
        return b.priority - a.priority
      })

      setTasks(personalTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const API_URL = import.meta.env.VITE_API_URL;
    const url = editingTask
      ? `${API_URL}/tasks/${editingTask.id}`
      : `${API_URL}/tasks`
    const method = editingTask ? "put" : "post"
    const taskData = { ...formData, assigned_to: user.id }

    try {
      await axios[method](url, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      fetchTasks()
      setShowForm(false)
      setEditingTask(null)
      setFormData({ title: "", description: "", priority: 1 })
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
        const API_URL = import.meta.env.VITE_API_URL;
        await axios.delete(`${API_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchTasks()
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    }
  }

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.put(
        `${API_URL}/tasks/${task.id}`,
        {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: newStatus,
          assigned_to: task.assigned_to,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      fetchTasks()
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

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const pendingTasks = totalTasks - completedTasks
  const high = tasks.filter((t) => t.priority === 3).length
  const med = tasks.filter((t) => t.priority === 2).length
  const low = tasks.filter((t) => t.priority === 1).length

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
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
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

      {/* Task Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No tasks for this week. Create your first task!</td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
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
                      <button onClick={() => handleEdit(task)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress & Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Progress</h3>

        {/* Completion */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Completion Rate</span>
            <span>{totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{
                width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "High", count: high, color: "bg-red-500" },
            { label: "Medium", count: med, color: "bg-yellow-500" },
            { label: "Low", count: low, color: "bg-green-500" },
          ].map(({ label, count, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{label}</span>
                <span>{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${color} h-2 rounded-full`}
                  style={{ width: `${totalTasks ? (count / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          {[
            { label: "Completed", count: completedTasks, color: "bg-green-500" },
            { label: "Pending", count: pendingTasks, color: "bg-yellow-500" },
          ].map(({ label, count, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{label}</span>
                <span>{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${color} h-2 rounded-full`}
                  style={{ width: `${totalTasks ? (count / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TasksTab
