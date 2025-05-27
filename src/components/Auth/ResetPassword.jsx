import { useState,useEffect } from 'react'
import axios from 'axios'
import { useSearchParams } from "react-router-dom"

export default function ResetPassword({onSuccess, onBackToLogin}) {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)
    const searchParams = useSearchParams()
    const token = searchParams.get("token")


    useEffect(() => {
        verifyToken()
    }, [token])

    const verifyToken = async () => {
        if (!token) {
            setError("Invalid reset link")
            setVerifying(false)
            return
        }

        try {
            const API_URL = process.env.REACT_APP_API_URL
            const response = await axios.get(`${API_URL}/auth/verify-reset-token`, {
                params: { token }
            });

            setTokenValid(true);
        } catch (error){
            const message = error.response?.data?.error || "Invalid or expired reset link";
            setError(message);
        } finally {
            setVerifying(false)
        }
    }




    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        })
        if (error) setError("")
    }

    const validateForm = () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match")
            return false
        }

        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters long")
            return false
        }

        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (!validateForm()) {
            setLoading(false)
            return
        }

        try{
            const API_URL = process.env.REACT_APP_API_URL
            const response = await axios.post(`${API_URL}/auth/reset-password`,{
            token,
            newPassword: formData.newPassword,
        })
            } catch (error) {
            const message = error.response?.data?.error || "Failed to reset password";
            setError(message);
        } finally {
            setLoading(false);
        }   
    }
    


    if (verifying) {
        return (
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600">Verifying reset link...</p>
            </div>
        )
    }
    
    
    if (!tokenValid) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Invalid Reset Link</h3>
                <p className="text-gray-600">{error}</p>
                <button
                onClick={onBackToLogin}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                Back to Login
                </button>
            </div>
        )
    }
    
    return(
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Reset Your Password</h3>
                <p className="text-gray-600 mt-2">Enter your new password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
                )}

                <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                </label>
                <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter new password (min 6 characters)"
                />
                </div>

                <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Confirm new password"
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
                    Resetting Password...
                    </div>
                ) : (
                    "Reset Password"
                )}
                </button>
            </form>
        </div>
    )
}