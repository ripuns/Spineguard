const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('spineguard_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('spineguard_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('spineguard_token');
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async register(userData) {
    const response = await this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // User Settings
  async getUserSettings(userId) {
    return await this.makeRequest(`/user/${userId}/settings`);
  }

  async updateUserSettings(userId, settings) {
    return await this.makeRequest(`/user/${userId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Calibration
  async calibrateGoodPosture(userId, samples = 200) {
    return await this.makeRequest('/calibrate/good', {
      method: 'POST',
      body: JSON.stringify({ samples }),
    });
  }

  async calibrateBadPosture(userId, samples = 200) {
    return await this.makeRequest('/calibrate/bad', {
      method: 'POST',
      body: JSON.stringify({ samples }),
    });
  }

  // Monitoring
  async startMonitoring(userId) {
    return await this.makeRequest('/monitoring/start', {
      method: 'POST',
    });
  }

  async stopMonitoring() {
    return await this.makeRequest('/monitoring/stop', {
      method: 'POST',
    });
  }

  async getMonitoringStatus() {
    return await this.makeRequest('/monitoring/status');
  }

  // Models
  async getUserModels(userId) {
    return await this.makeRequest(`/user/${userId}/models`);
  }

  // Placeholder methods for future implementation
  async trainModel(userId) {
    throw new Error('Model training is handled automatically during monitoring start');
  }

  async activateModel(modelId, userId) {
    throw new Error('Model activation not implemented yet');
  }

  async deleteModel(modelId, userId) {
    throw new Error('Model deletion not implemented yet');
  }

  async getUserProfile(userId) {
    throw new Error('User profile endpoint not implemented yet');
  }
}

export default new ApiService();