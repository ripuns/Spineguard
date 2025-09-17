import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Eye, EyeOff, Activity, UserPlus } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import SpineIllustration from './SpineIllustration'

const LoginPage = () => {
  const { login, register, isLoading, error, setError } = useUser()
  const navigate = useNavigate()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLoginMode) {
      const success = await login({
        username: formData.username,
        password: formData.password
      })
      if (success) {
        navigate('/dashboard')
      }
    } else {
      const success = await register(formData)
      if (success) {
        navigate('/dashboard')
      }
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setFormData({ username: '', password: '', email: '' })
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-spine-dark via-slate-900 to-spine-dark">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Spine Illustration Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <SpineIllustration size={400} color="rgba(255,255,255,0.1)" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-spine-blue/20 rounded-2xl mb-4"
          >
            <Activity className="w-8 h-8 text-spine-blue" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 font-poppins">
            SpineGuard
          </h1>
          <p className="text-spine-gray text-lg">
            Monitor your posture, protect your spine
          </p>
        </div>

        {/* Login/Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass-card p-8"
        >
          {/* Mode Toggle */}
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLoginMode
                  ? 'bg-spine-blue text-white'
                  : 'text-spine-gray hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLoginMode
                  ? 'bg-spine-blue text-white'
                  : 'text-spine-gray hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-spine-gray">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spine-gray" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-spine-gray focus:outline-none focus:ring-2 focus:ring-spine-blue/50 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Email Field (only for registration) */}
            {!isLoginMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-spine-gray">
                  Email (Optional)
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spine-gray" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-spine-gray focus:outline-none focus:ring-2 focus:ring-spine-blue/50 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-spine-gray">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spine-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-spine-gray focus:outline-none focus:ring-2 focus:ring-spine-blue/50 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-spine-gray hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full button-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isLoginMode ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
              )}
            </motion.button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 text-center">
            <p className="text-sm text-spine-gray">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={toggleMode}
                className="text-spine-blue hover:text-blue-400 transition-colors font-medium"
              >
                {isLoginMode ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-8 text-spine-gray text-sm"
        >
          <p>© 2024 SpineGuard. Protecting your spinal health.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
