// Placeholder API service - will be implemented with new backend
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Placeholder methods - to be implemented
  async register(userData) {
    console.log('Register API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async login(credentials) {
    console.log('Login API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async getUserProfile(userId) {
    console.log('Get user profile API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async startMonitoring(userId) {
    console.log('Start monitoring API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async stopMonitoring() {
    console.log('Stop monitoring API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async getMonitoringStatus() {
    console.log('Get monitoring status API call - not implemented yet');
    return { active: false, user_id: null };
  }

  async calibrateGoodPosture(userId, samples = 200) {
    console.log('Calibrate good posture API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async calibrateBadPosture(userId, samples = 200) {
    console.log('Calibrate bad posture API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async trainModel(userId) {
    console.log('Train model API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async getUserModels(userId) {
    console.log('Get user models API call - not implemented yet');
    return [];
  }

  async activateModel(modelId, userId) {
    console.log('Activate model API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async deleteModel(modelId, userId) {
    console.log('Delete model API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }

  async getUserSettings(userId) {
    console.log('Get user settings API call - not implemented yet');
    return {
      voice_alerts: true,
      sound_type: 'voice',
      alert_threshold: 10,
      volume: 80,
      notifications: true
    };
  }

  async updateUserSettings(userId, settings) {
    console.log('Update user settings API call - not implemented yet');
    return { error: 'Backend not implemented yet' };
  }
}

export default new ApiService();