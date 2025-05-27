import { AuthProvider } from "./contexts/AuthContext"
import Header from "./layout/Header"
import Main from "./layout/Main"
import Footer from "./layout/Footer"
import { useState,useEffect } from "react"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if this is a password reset URL
    const urlParams = new URLSearchParams(window.location.search)
    const resetToken = urlParams.get("token")

    if (resetToken) {
      setCurrentView("reset-password")
      setLoading(false)
      return
    }

    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      try {
        // Verify token is not expired
        const tokenData = JSON.parse(atob(token.split(".")[1]))
        const currentTime = Date.now() / 1000

        if (tokenData.exp > currentTime) {
          setIsAuthenticated(true)
        } else {
          // Token expired, clear storage
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      } catch (error) {
        // Invalid token, clear storage
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setLoading(false)
  }, [])



  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setCurrentView("login")
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }


  if (isAuthenticated) {
    return (
      <AuthProvider>
        <Dashboard onLogout={handleLogout} />
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header/>
        <Main/>
        <Footer/>
      </div>
    </AuthProvider>
  )
}

export default App
