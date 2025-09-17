import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Bell, BellOff, Sliders, Save } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import ApiService from '../services/api'

const VoiceAlertSettings = () => {
  const { user } = useUser()
  const [settings, setSettings] = useState({
    voice_alerts: true,
    sound_type: 'voice', // 'voice' or 'beep'
    alert_threshold: 10,
    volume: 80,
    notifications: true
  })
  const [isSaving, setIsSaving] = useState(false)

  // Load user settings on mount
  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    if (!user) return
    
    try {
      const userSettings = await ApiService.getUserSettings(user.id)
      setSettings(userSettings)
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      await ApiService.updateUserSettings(user.id, settings)
      console.log('Settings saved successfully')
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-spine-blue/20 rounded-lg flex items-center justify-center">
          <Volume2 className="w-4 h-4 text-spine-blue" />
        </div>
        <h3 className="text-lg font-semibold">Voice & Alert Settings</h3>
      </div>

      {/* Voice Alerts Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enable Voice Alerts</label>
          <button
            onClick={() => handleSettingChange('voice_alerts', !settings.voice_alerts)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.voice_alerts ? 'bg-spine-green' : 'bg-spine-gray'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              animate={{ x: settings.voice_alerts ? 28 : 4 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>

        {/* Sound Type Selection */}
        {settings.voice_alerts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <label className="text-sm font-medium">Alert Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSettingChange('sound_type', 'voice')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  settings.sound_type === 'voice'
                    ? 'bg-spine-blue/20 text-spine-blue border border-spine-blue/30'
                    : 'bg-white/5 text-spine-gray border border-white/10'
                }`}
              >
                <Volume2 className="w-4 h-4 mx-auto mb-1" />
                Voice
              </button>
              <button
                onClick={() => handleSettingChange('sound_type', 'beep')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  settings.sound_type === 'beep'
                    ? 'bg-spine-blue/20 text-spine-blue border border-spine-blue/30'
                    : 'bg-white/5 text-spine-gray border border-white/10'
                }`}
              >
                <Bell className="w-4 h-4 mx-auto mb-1" />
                Beep
              </button>
            </div>
          </motion.div>
        )}

        {/* Alert Threshold */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Alert Threshold: {settings.alert_threshold} bad samples
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={settings.alert_threshold}
            onChange={(e) => handleSettingChange('alert_threshold', parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-spine-gray">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        {/* Volume Control */}
        {settings.voice_alerts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <label className="text-sm font-medium">
              Volume: {settings.volume}%
            </label>
            <div className="flex items-center space-x-3">
              <VolumeX className="w-4 h-4 text-spine-gray" />
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => handleSettingChange('volume', parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
              <Volume2 className="w-4 h-4 text-spine-gray" />
            </div>
          </motion.div>
        )}

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Desktop Notifications</label>
          <button
            onClick={() => handleSettingChange('notifications', !settings.notifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.notifications ? 'bg-spine-green' : 'bg-spine-gray'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              animate={{ x: settings.notifications ? 28 : 4 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>

        {/* Save Settings Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveSettings}
          disabled={isSaving}
          className="w-full button-primary flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </motion.button>

        {/* Test Alert Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Simulate alert test
            if (settings.voice_alerts) {
              if (settings.sound_type === 'voice') {
                // Simulate voice alert
                console.log('Playing voice alert...')
              } else {
                // Simulate beep
                console.log('Playing beep alert...')
              }
            }
          }}
          className="w-full button-secondary flex items-center justify-center space-x-2"
        >
          <Bell className="w-4 h-4" />
          <span>Test Alert</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default VoiceAlertSettings
