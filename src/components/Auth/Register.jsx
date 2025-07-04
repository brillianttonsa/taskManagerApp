import { useState } from "react";
import axios from "axios";
import {useAuth} from "../../contexts/AuthContext";

export default function Register({onSuccess, onSwitchToLogin}){
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const {login} = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when user starts typing
        if (error) setError("")
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return false
        }

        if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        return false
        }

        if (formData.username.length < 3) {
        setError("Username must be at least 3 characters long")
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


        try {
            const API_URL = import.meta.env.VITE_API_URL;

            // console.log("API URL:", API_URL); // Should log your full backend URL

            
            const response = await axios.post(`${API_URL}/auth/register`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            const data = response.data;
            // console.log(data);
            
            login(data.user, data.token)
            onSuccess()
           
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || "Registration failed");
            } else {
                setError("Network error. Please check if the server is running.");
            }
        } finally {
            setLoading(false);
        }

    }


    return(
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
            )}

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
                </label>
                <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter username"
                />
            </div>

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
                placeholder="Create a password (min 6 characters)"
                />
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
                </label>
                <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Confirm your password"
                />
            </div>

            <div className="flex items-center">
                <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                </a>
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
                {loading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                </div>
                ) : (
                "Create Account"
                )}
            </button>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button type="button" onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in here
                </button>
                </p>
            </div>
        </form>
    )
}