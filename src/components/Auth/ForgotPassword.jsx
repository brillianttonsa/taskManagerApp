import { useState } from 'react'
import axios from 'axios'

export default function ForgotPassword({onBackToLogin}){
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        setError("")

        try {
            const API_URL = process.env.REACT_APP_API_URL 
            const response = await axios.post(`${API_URL}/auth/forgot-password`,
                { email }
            )
            setMessage(response.data.message)
            setEmailSent(true)

        }catch(err){
            if (err.response){
                setError(err.response.data.error || "Failed to send reset email")
            } else {
                setError("Network error. Please check if the server is running.")
            }

        }finally{
            setLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Check Your Email</h3>
                <p className="text-gray-600">{message}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> In development mode, the reset link is logged to the server console. Check your
                    server logs for the reset URL.
                </p>
                </div>
                <button
                onClick={onBackToLogin}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                Back to Login
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Forgot Password</h3>
                <p className="text-gray-600 mt-2">Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
                )}

                {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                    {message}
                </div>
                )}

                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email address"
                />
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                {loading ? (
                    <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Reset Link...
                    </div>
                ) : (
                    "Send Reset Link"
                )}
                </button>

                <button
                type="button"
                onClick={onBackToLogin}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                Back to Login
                </button>
            </form>
        </div>
    )
}