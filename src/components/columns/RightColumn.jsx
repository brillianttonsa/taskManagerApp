import { useState } from 'react'
import Login from '../Auth/Login'
import Register from "../Auth/Register"
import ForgotPassword from "../Auth/ForgotPassword"
import ResetPassword from "../Auth/ResetPassword"


export default function RightColumn({onAuthSuccess}) {

    const [currentView, setCurrentView] = useState("login")
    const [resetMessage, setResetMessage] = useState("")



    const handleBackToLogin = () => {
      setCurrentView("login")
      setResetMessage("")
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const handleResetSuccess = (message) => {
      setResetMessage(message)
      setCurrentView("login")
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }



    const renderAuthForm = () => {
      switch (currentView) {
        case "login":
          return (
            <Login
              onSuccess={onAuthSuccess}
              onSwitchToRegister={() => setCurrentView("register")}
              onForgotPassword={() => setCurrentView("forgot-password")}
            />
          )
          case "register":
            return <Register onSuccess={onAuthSuccess} onSwitchToLogin={() => setCurrentView("login")} />
          case "forgot-password":
            return <ForgotPassword onBackToLogin={handleBackToLogin} />
          case "reset-password":
            return <ResetPassword onSuccess={handleResetSuccess} onBackToLogin={handleBackToLogin} />
          default:
            return (
              <Login
                onSuccess={onAuthSuccess}
                onSwitchToRegister={() => setCurrentView("register")}
                onForgotPassword={() => setCurrentView("forgot-password")}
              />
            )
        }
      }

    return(
        <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentView === "login" && "Welcome Back"}
                    {currentView === "register" && "Create Account"}
                    {currentView === "forgot-password" && "Reset Password"}
                    {currentView === "reset-password" && "New Password"}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {currentView === "login" && "Sign in to your account"}
                    {currentView === "register" && "Join thousands of users organizing their lives"}
                    {currentView === "forgot-password" && "We'll help you get back in"}
                    {currentView === "reset-password" && "Almost there! Set your new password"}
                  </p>
                </div>

                
                {/* Success Message for Password Reset */}
                {resetMessage && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                    {resetMessage}
                  </div>
                )}

                {/* Tab Navigation - only show for login/register */}
                {(currentView === "login" || currentView === "register") && (
                  <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setCurrentView("login")}
                      className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-colors ${
                        currentView === "login"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setCurrentView("register")}
                      className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-colors ${
                        currentView === "register"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                {/* Auth Forms */}
                <div className="transition-all duration-300">{renderAuthForm()}</div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                    By using TaskFlow, you agree to our{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                        Privacy Policy
                    </a>
                    </p>
                </div>



            </div>
        </div>
    )
}