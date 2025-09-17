import React, { useState, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import './App.css'

// Dark mode context
const DarkModeContext = createContext()

export const useDarkMode = () => {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <UserProvider>
      <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : 'light'}`}>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </div>
      </DarkModeContext.Provider>
    </UserProvider>
  )
}

export default App
