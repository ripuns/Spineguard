const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // User management
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  }

  async getUserProfile(userId) {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/profile`);
    return response.json();
  }

  // Posture monitoring
  async startMonitoring(userId) {
    const response = await fetch(`${API_BASE_URL}/monitor/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  }

  async stopMonitoring() {
    const response = await fetch(`${API_BASE_URL}/monitor/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async getMonitoringStatus() {
    const response = await fetch(`${API_BASE_URL}/monitor/status`);
    return response.json();
  }

  // Calibration
  async calibrateGoodPosture(userId, samples = 200) {
    const response = await fetch(`${API_BASE_URL}/calibrate/good`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, samples }),
    });
    return response.json();
  }

  async calibrateBadPosture(userId, samples = 200) {
    const response = await fetch(`${API_BASE_URL}/calibrate/bad`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, samples }),
    });
    return response.json();
  }

  // Model management
  async trainModel(userId) {
    const response = await fetch(`${API_BASE_URL}/models/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  }

  async getUserModels(userId) {
    const response = await fetch(`${API_BASE_URL}/models/${userId}`);
    return response.json();
  }

  async activateModel(modelId, userId) {
    const response = await fetch(`${API_BASE_URL}/models/${modelId}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  }

  async deleteModel(modelId, userId) {
    const response = await fetch(`${API_BASE_URL}/models/${modelId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  }

  // Settings
  async getUserSettings(userId) {
    const response = await fetch(`${API_BASE_URL}/settings/${userId}`);
    return response.json();
  }

  async updateUserSettings(userId, settings) {
    const response = await fetch(`${API_BASE_URL}/settings/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    return response.json();
  }
}

export default new ApiService();
