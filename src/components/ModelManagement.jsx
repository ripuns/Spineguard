import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Settings,
  Loader2
} from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import ApiService from '../services/api'

const ModelManagement = () => {
  const { user } = useUser()
  const [models, setModels] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [error, setError] = useState(null)

  // Load user models on mount
  useEffect(() => {
    if (user) {
      loadModels()
    }
  }, [user])

  const loadModels = async () => {
    if (!user) return
    
    try {
      const userModels = await ApiService.getUserModels(user.id)
      setModels(userModels)
    } catch (err) {
      console.error('Failed to load models:', err)
      setError('Failed to load models')
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !user) return
    
    setIsUploading(true)
    setError(null)
    
    try {
      // For now, we'll simulate the upload since we need to implement file upload endpoint
      // In a real implementation, you'd upload the file to the backend
      console.log('File upload not implemented yet:', file.name)
      setIsUploading(false)
    } catch (err) {
      setError('File upload failed')
      setIsUploading(false)
    }
  }

  const handleTrainModel = async () => {
    if (!user) return
    
    setIsTraining(true)
    setError(null)
    
    try {
      await ApiService.trainModel(user.id)
      // Reload models after training
      await loadModels()
    } catch (err) {
      setError(err.message || 'Training failed')
    } finally {
      setIsTraining(false)
    }
  }

  const setActiveModel = async (modelId) => {
    if (!user) return
    
    try {
      await ApiService.activateModel(modelId, user.id)
      // Reload models to get updated status
      await loadModels()
    } catch (err) {
      setError(err.message || 'Failed to activate model')
    }
  }

  const deleteModel = async (modelId) => {
    if (!user) return
    
    try {
      await ApiService.deleteModel(modelId, user.id)
      // Reload models after deletion
      await loadModels()
    } catch (err) {
      setError(err.message || 'Failed to delete model')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-spine-mint/20 rounded-lg flex items-center justify-center">
          <Brain className="w-4 h-4 text-spine-mint" />
        </div>
        <h3 className="text-lg font-semibold">Model Management</h3>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-spine-gray">Upload Model</h4>
        <div className="space-y-3">
          <label className="block">
            <input
              type="file"
              accept=".pkl,.joblib,.h5,.onnx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                isUploading 
                  ? 'border-spine-blue/50 bg-spine-blue/10' 
                  : 'border-white/20 hover:border-spine-blue/50 hover:bg-spine-blue/5'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-spine-blue/30 border-t-spine-blue rounded-full animate-spin"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-6 h-6 text-spine-gray" />
                  <span className="text-sm text-spine-gray">Click to upload model file</span>
                  <span className="text-xs text-spine-gray">Supports: .pkl, .joblib, .h5, .onnx</span>
                </div>
              )}
            </motion.div>
          </label>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTrainModel}
            disabled={isTraining}
            className="w-full button-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isTraining ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Training Model...</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                <span>Train New Model</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Current Model */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-spine-gray">Current Model</h4>
        <div className="glass-card p-4">
          {models.find(m => m.is_active) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-spine-green" />
                <div>
                  <p className="font-medium">{models.find(m => m.is_active).name}</p>
                  <p className="text-sm text-spine-gray">
                    {models.find(m => m.is_active).accuracy}% accuracy
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-spine-gray">
                  {models.find(m => m.is_active).size || 'Unknown size'}
                </p>
                <p className="text-xs text-spine-gray">
                  Trained: {models.find(m => m.is_active).created_at}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-spine-gray">
              <AlertCircle className="w-5 h-5" />
              <span>No active model selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Model List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-spine-gray">Available Models</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {models.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    model.is_active ? 'bg-spine-green' : 'bg-spine-gray'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <div className="flex items-center space-x-4 text-xs text-spine-gray">
                      <span>{model.accuracy}% accuracy</span>
                      <span>{model.size || 'Unknown size'}</span>
                      <span>{model.created_at}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!model.is_active && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveModel(model.id)}
                      className="p-2 rounded-lg bg-spine-blue/20 text-spine-blue hover:bg-spine-blue/30 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteModel(model.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Model Statistics */}
      <div className="glass-card p-4">
        <h4 className="text-sm font-medium text-spine-gray mb-3">Model Statistics</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-spine-green">
              {models.length}
            </p>
            <p className="text-xs text-spine-gray">Total Models</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-spine-blue">
              {models.length > 0 ? Math.max(...models.map(m => m.accuracy)).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-spine-gray">Best Accuracy</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ModelManagement
