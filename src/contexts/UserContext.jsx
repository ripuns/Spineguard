import React, { createContext, useContext, useState, useEffect } from 'react'
import ApiService from '../services/api'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('spineguard_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('spineguard_user')
      }
    }
  }, [])

  const login = async (credentials) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await ApiService.login(credentials)
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      const userData = {
        id: response.user_id,
        username: response.username,
        name: response.username,
        token: response.token
      }
      
      setUser(userData)
      localStorage.setItem('spineguard_user', JSON.stringify(userData))
      return true
    } catch (err) {
      setError('Login failed. Please check your connection.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await ApiService.register(userData)
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      // Auto-login after registration
      const loginUserData = {
        id: response.user_id,
        username: response.username,
        name: response.username,
        token: response.token
      }
      
      setUser(loginUserData)
      localStorage.setItem('spineguard_user', JSON.stringify(loginUserData))
      return true
    } catch (err) {
      setError('Registration failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('spineguard_user')
    setError(null)
  }

  const updateProfile = async (profileData) => {
    if (!user) return false
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await ApiService.getUserProfile(user.id)
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      const updatedUser = { ...user, ...response }
      setUser(updatedUser)
      localStorage.setItem('spineguard_user', JSON.stringify(updatedUser))
      return true
    } catch (err) {
      setError('Failed to update profile')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    setError
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
