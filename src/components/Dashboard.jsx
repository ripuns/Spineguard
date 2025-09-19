import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Settings, 
  LogOut, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Upload,
  Brain,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  User,
  Loader2
} from 'lucide-react'
import { useDarkMode } from '../App'
import { useUser } from '../contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import ApiService from '../services/api'
import SpineIllustration from './SpineIllustration'
import VoiceAlertSettings from './VoiceAlertSettings'
import ModelManagement from './ModelManagement'

const Dashboard = () => {
  const { user, logout } = useUser()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const navigate = useNavigate()
  
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [postureStatus, setPostureStatus] = useState('good') // 'good' or 'bad'
  const [postureAccuracy, setPostureAccuracy] = useState(87)
  const [showSettings, setShowSettings] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userSettings, setUserSettings] = useState(null)
  const [userModels, setUserModels] = useState([])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Load user settings and models
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  // Check monitoring status
  useEffect(() => {
    const checkMonitoringStatus = async () => {
      try {
        const status = await ApiService.getMonitoringStatus()
        setIsMonitoring(status.active)
        if (status.current_posture) {
          setPostureStatus(status.current_posture)
        }
      } catch (err) {
        console.error('Failed to check monitoring status:', err)
      }
    }
    
    checkMonitoringStatus()
    const interval = setInterval(checkMonitoringStatus, 1000) // Check every second for real-time updates
    return () => clearInterval(interval)
  }, [])


  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadUserData = async () => {
    if (!user) return
    
    try {
      const [settings, models] = await Promise.all([
        ApiService.getUserSettings(user.id),
        ApiService.getUserModels(user.id)
      ])
      
      setUserSettings(settings)
      setUserModels(models)
    } catch (err) {
      console.error('Failed to load user data:', err)
      setError('Failed to load user data')
    }
  }

  const toggleMonitoring = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (isMonitoring) {
        await ApiService.stopMonitoring()
        setIsMonitoring(false)
      } else {
        await ApiService.startMonitoring(user.id)
        setIsMonitoring(true)
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle monitoring')
    } finally {
      setIsLoading(false)
    }
  }

  const calibrateGoodPosture = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await ApiService.calibrateGoodPosture(user.id, 200)
      setError(null)
      // Show success message
      console.log('Good posture calibration completed')
    } catch (err) {
      setError(err.message || 'Calibration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const calibrateBadPosture = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await ApiService.calibrateBadPosture(user.id, 200)
      setError(null)
      // Show success message
      console.log('Bad posture calibration completed')
    } catch (err) {
      setError(err.message || 'Calibration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-spine-dark">
      {/* Header */}
      <header className="glass-card border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-spine-blue/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-spine-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-poppins">SpineGuard</h1>
                <p className="text-spine-gray text-sm">Posture Monitoring System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-medium">Hello, {user.name}</p>
              <p className="text-spine-gray text-sm">
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Posture Status Card */}
            <motion.div
              layout
              className={`glass-card p-8 ${postureStatus === 'good' ? 'status-good' : 'status-bad'}`}
            >
              <div className="text-center">
                <motion.div
                  key={postureStatus}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  {postureStatus === 'good' ? (
                    <CheckCircle className="w-16 h-16 mx-auto text-spine-green" />
                  ) : (
                    <AlertTriangle className="w-16 h-16 mx-auto text-spine-red" />
                  )}
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-2">
                  {postureStatus === 'good' ? 'Good Posture' : 'Bad Posture'}
                </h2>
                <p className="text-lg opacity-80">
                  {postureStatus === 'good' 
                    ? 'Keep up the great work!' 
                    : 'Please adjust your sitting position'
                  }
                </p>
              </div>
            </motion.div>

            {/* Spine Visualization */}
            <motion.div
              layout
              className="glass-card p-8 flex flex-col items-center justify-center"
            >
              <h3 className="text-xl font-semibold mb-6 text-center">Spine Status</h3>
              <SpineIllustration 
                size={200} 
                isGoodPosture={postureStatus === 'good'} 
                animated={isMonitoring}
              />
              <p className="mt-4 text-spine-gray text-sm">
                {isMonitoring ? 'Monitoring active' : 'Monitoring paused'}
              </p>
            </motion.div>

            {/* Today's Accuracy */}
            <motion.div
              layout
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Today's Accuracy</h3>
                <BarChart3 className="w-5 h-5 text-spine-blue" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-spine-green">
                    {postureAccuracy}%
                  </span>
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={postureAccuracy >= 80 ? '#10B981' : postureAccuracy >= 60 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(postureAccuracy / 100) * 175.9} 175.9`}
                        initial={{ strokeDasharray: '0 175.9' }}
                        animate={{ strokeDasharray: `${(postureAccuracy / 100) * 175.9} 175.9` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Good posture time</span>
                    <span>{Math.round(postureAccuracy * 0.8)} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bad posture time</span>
                    <span>{Math.round((100 - postureAccuracy) * 0.8)} min</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Control Buttons */}
            <motion.div
              layout
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Controls</h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleMonitoring}
                  disabled={isLoading}
                  className={`p-4 rounded-lg font-medium transition-all disabled:opacity-50 ${
                    isMonitoring 
                      ? 'bg-spine-red/20 text-spine-red border border-spine-red/30' 
                      : 'bg-spine-green/20 text-spine-green border border-spine-green/30'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
                      {isMonitoring ? 'Stopping...' : 'Starting...'}
                    </>
                  ) : isMonitoring ? (
                    <>
                      <Pause className="w-5 h-5 mx-auto mb-2" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mx-auto mb-2" />
                      Start Monitoring
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={calibrateGoodPosture}
                  disabled={isLoading}
                  className="button-secondary p-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mx-auto mb-2" />
                  )}
                  Calibrate Good
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={calibrateBadPosture}
                  disabled={isLoading}
                  className="button-secondary p-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                  )}
                  Calibrate Bad
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="button-secondary p-4"
                >
                  <Settings className="w-5 h-5 mx-auto mb-2" />
                  Settings
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Settings Sidebar */}
        <AnimatePresence>
          {showSettings && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 glass-card border-l border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <VoiceAlertSettings />
                <ModelManagement />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Dashboard
