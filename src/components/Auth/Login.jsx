
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios";

export default function Login({ onSuccess, onSwitchToRegister, onForgotPassword }){
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    const handleChange = (e) => {
        setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (error) setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const API_URL = import.meta.env.VITE_API_URL;

           const response = await axios.post(`${API_URL}/auth/login`, formData);


            const data = response.data;
            login(data.user, data.token)
            if (onSuccess) onSuccess()
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || "Login failed")
            } else {
                setError("Network error. Please check if the server is running.")
            }
        } finally {
            setLoading(false)
        }
    }

    return(
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
                </label>
                <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
                </label>
                <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                </label>
                </div>

                <div className="text-sm">
                <button type="button" onClick={onForgotPassword} className="text-blue-600 hover:text-blue-500 font-medium">
                    Forgot password?
                </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
                {loading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                </div>
                ) : (
                "Sign In"
                )}
            </button>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button type="button" onClick={onSwitchToRegister} className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign up here
                </button>
                </p>
            </div>
        </form>
   )
}