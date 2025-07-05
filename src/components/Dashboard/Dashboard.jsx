import { useState } from "react"
import Sidebar from "./Sidebar"
import TasksTab from "./TasksTab"
import DashboardTab from "./DashboardTab"
import WeeklyReports from "./WeeklyReports"
import FamilyTab from "./FamilyTab"
import { useAuth } from "../../contexts/AuthContext"

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("tasks")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  const renderActiveTab = () => {
    switch (activeTab) {
      case "tasks":
        return <TasksTab />
      case "dashboard":
        return <DashboardTab />
      case "reports":
        return <WeeklyReports />
      case "family":
        return <FamilyTab />
      default:
        return <TasksTab />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-2 text-2xl font-semibold text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">{renderActiveTab()}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 backdrop-blur bg-opacity-50" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default Dashboard
