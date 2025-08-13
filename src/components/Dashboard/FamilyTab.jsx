
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"

const FamilyTab = () => {
  const [familyMembers, setFamilyMembers] = useState([])
  const [familyTasks, setFamilyTasks] = useState([])
  const [familyInfo, setFamilyInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [familyName, setFamilyName] = useState("")
  const [invitationCode, setInvitationCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [familyId, setFamilyId] = useState(null)
  const [isLeader, setIsLeader] = useState(false)
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: 1,
    assigned_to: "",
  })
  const { token, user } = useAuth()

  useEffect(() => {
    fetchFamilyData()
  }, [])

  const API_URL = import.meta.env.VITE_API_URL;
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const fetchFamilyData = async () => {
    try {
      const familyRes = await api.get("/family/info")
      const familyData = familyRes.data
      setFamilyInfo(familyData)
      setFamilyId(familyData.id)
      setIsLeader(familyData.created_by === user.id)

      const membersRes = await api.get("/family/members")
      setFamilyMembers(membersRes.data)

      const tasksRes = await api.get("/family/tasks")
      const sortedTasks = tasksRes.data.sort((a, b) => {
        if (a.status !== b.status) return a.status === "pending" ? -1 : 1
        return b.priority - a.priority
      })
      setFamilyTasks(sortedTasks)
    } catch (err) {
      console.error("Error fetching family data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFamily = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    try {
      const res = await api.post("/family/create", { name: familyName })
      const data = res.data
      setSuccess(`Family created successfully! Share this invitation code: ${data.invitation_code}`)
      setShowCreateForm(false)
      setFamilyName("")
      setFamilyId(data.family_id)
      setIsLeader(true)
      setFamilyInfo({
        id: data.family_id,
        name: data.name,
        invitation_code: data.invitation_code,
        created_by: user.id,
      })
      fetchFamilyData()
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create family")
    }
  }

  const handleJoinFamily = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    try {
      const res = await api.post("/family/join", { invitationCode })
      const data = res.data
      setSuccess(`Successfully joined family: ${data.name}`)
      setShowJoinForm(false)
      setInvitationCode("")
      setFamilyId(data.family_id)
      setIsLeader(false)
      fetchFamilyData()
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to join family")
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setError("")
    const method = editingTask ? api.put : api.post
    const url = editingTask ? `/family/tasks/${editingTask.id}` : "/family/tasks"
    try {
      await method(url, {
        ...taskFormData,
        family_id: familyId,
      })
      setShowTaskForm(false)
      setTaskFormData({
        title: "",
        description: "",
        priority: 1,
        assigned_to: "",
      })
      setEditingTask(null)
      fetchFamilyData()
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create task")
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTaskFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      assigned_to: task.assigned_to,
    })
    setShowTaskForm(true)
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return
    try {
      await api.delete(`/family/tasks/${taskId}`)
      fetchFamilyData()
    } catch (err) {
      console.error("Error deleting task:", err)
    }
  }

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    try {
      await api.put(`/family/tasks/${task.id}`, {
        ...task,
        status: newStatus,
      })
      fetchFamilyData()
    } catch (err) {
      console.error("Error updating task status:", err)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3: return "bg-red-100 text-red-800"
      case 2: return "bg-yellow-100 text-yellow-800"
      case 1: return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 3: return "High"
      case 2: return "Medium"
      case 1: return "Low"
      default: return "Low"
    }
  }

  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If user is not in a family yet
  if (!familyId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Family Management</h2>
          <div className="space-x-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Family
            </button>
            <button
              onClick={() => setShowJoinForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Join Family
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        {/* Create Family Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Create New Family</h3>
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter family name"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    Create Family
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Family Form */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Join Existing Family</h3>
              <form onSubmit={handleJoinFamily} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invitation Code</label>
                  <input
                    type="text"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter invitation code"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  >
                    Join Family
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* No Family Yet Message */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Family Yet</h3>
          <p className="text-gray-500 mb-6">
            Create a new family or join an existing one to start collaborating on tasks with your family members.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Family
            </button>
            <button
              onClick={() => setShowJoinForm(true)}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Join Family
            </button>
          </div>
        </div>

        {/* Family Features Info */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Family Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Share tasks with family members</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Assign tasks to specific members</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Track family progress together</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Collaborate on weekly goals</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If user is in a family
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Family Dashboard</h2>
        {isLeader && (
          <div className="space-x-2">
            <button
              onClick={() => {
                setShowTaskForm(true)
                setEditingTask(null)
                setTaskFormData({
                  title: "",
                  description: "",
                  priority: 1,
                  assigned_to: "",
                })
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Assign Family Task
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      {/* Family Info Card - Show invitation code for leaders */}
      {familyInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{familyInfo.name}</h3>
              <p className="text-sm text-gray-500">{isLeader ? "You are the family leader" : "Family member"}</p>
            </div>
            {isLeader && familyInfo.invitation_code && (
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Invitation Code:</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-3 py-1 rounded text-lg font-mono font-bold text-blue-600">
                    {familyInfo.invitation_code}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(familyInfo.invitation_code)
                      setSuccess("Invitation code copied to clipboard!")
                      setTimeout(() => setSuccess(""), 3000)
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Share this code with family members</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Family Members */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {familyMembers.map((member) => (
            <div key={member.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {member.username}
                    {member.id === user.id && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">You</span>
                    )}
                    {isLeader && member.id === user.id && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Leader</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family Tasks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Family Tasks</h3>
          {isLeader && (
            <button
              onClick={() => {
                setShowTaskForm(true)
                setEditingTask(null)
                setTaskFormData({
                  title: "",
                  description: "",
                  priority: 1,
                  assigned_to: "",
                })
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Assign New Task
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
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
              {familyTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No family tasks yet.{" "}
                    {isLeader ? "Assign your first task!" : "Wait for the family leader to assign tasks."}
                  </td>
                </tr>
              ) : (
                familyTasks.map((task) => (
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.assigned_username}
                      {task.assigned_to === user.id && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">You</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        disabled={task.assigned_to !== user.id && !isLeader}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          task.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        } ${task.assigned_to !== user.id && !isLeader ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {task.status === "completed" ? "Completed" : "Pending"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {(isLeader || task.assigned_to === user.id) && (
                        <>
                          <button onClick={() => handleEditTask(task)} className="text-blue-600 hover:text-blue-900">
                            Edit
                          </button>
                          {isLeader && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Family Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Member Completion Rates */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Member Completion Rates</h4>
            <div className="space-y-4">
              {familyMembers.map((member) => {
                const memberTasks = familyTasks.filter((task) => task.assigned_to === member.id)
                const completionRate =
                  memberTasks.length > 0
                    ? Math.round(
                        (memberTasks.filter((task) => task.status === "completed").length / memberTasks.length) * 100,
                      )
                    : 0

                return (
                  <div key={member.id}>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{member.username}</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Task Distribution</h4>
            <div className="h-40 flex items-end space-x-2">
              {familyMembers.map((member, index) => {
                const memberTaskCount = familyTasks.filter((task) => task.assigned_to === member.id).length
                const percentage = familyTasks.length > 0 ? (memberTaskCount / familyTasks.length) * 100 : 0

                return (
                  <div key={member.id} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: `${percentage}%` }}></div>
                    <div className="text-xs text-gray-500 mt-1 truncate w-full text-center" title={member.username}>
                      {member.username.substring(0, 3)}...
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingTask ? "Edit Family Task" : "Assign Family Task"}</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskFormData.priority}
                  onChange={(e) => setTaskFormData({ ...taskFormData, priority: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={taskFormData.assigned_to}
                  onChange={(e) => setTaskFormData({ ...taskFormData, assigned_to: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select family member</option>
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.username} {member.id === user.id ? "(You)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  {editingTask ? "Update Task" : "Assign Task"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false)
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
    </div>
  )
}

export default FamilyTab
