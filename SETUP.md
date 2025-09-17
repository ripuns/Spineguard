# SpineGuard Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- Arduino with MPU6050 sensor (for hardware integration)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install Python dependencies
   pip install -r backend/requirements.txt
   ```

2. **Start the Application**
   ```bash
   # Start both frontend and backend
   npm start
   
   # Or start them separately:
   # Terminal 1: Backend
   npm run start:backend
   
   # Terminal 2: Frontend  
   npm run start:frontend
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Serial Port Setup
1. Connect your Arduino with MPU6050 to your computer
2. Note the COM port (Windows) or device path (Linux/Mac)
3. Update the port in `backend/app.py`:
   ```python
   self.serial_port = 'COM7'  # Change to your port
   ```

### Hardware Requirements
- Arduino Uno/Nano
- MPU6050 6-axis accelerometer/gyroscope
- Jumper wires
- Breadboard (optional)

### Arduino Code
Upload the provided `Spineguard/script/arduino.ino` to your Arduino.

## 👥 User Management

### Creating Users
1. Open the application at http://localhost:3000
2. Click "Sign Up" on the login page
3. Enter username, password, and optional email
4. Click "Create Account"

### User Features
- **Individual Settings**: Each user has their own voice alert preferences
- **Model Management**: Users can train and manage their own posture models
- **Data Isolation**: Each user's calibration data and models are separate
- **Profile Management**: Users can update their profile information

## 🎯 Using the Application

### 1. Login
- Use the credentials you created during registration
- The app will remember your login session

### 2. Calibration
- **Calibrate Good Posture**: Sit in your best posture and click "Calibrate Good"
- **Calibrate Bad Posture**: Sit in poor posture and click "Calibrate Bad"
- The system will collect 200 samples for each posture type

### 3. Training Models
- After calibration, click "Train New Model" in the Model Management section
- The system will train a Random Forest classifier using your data
- Training typically takes 1-2 minutes

### 4. Monitoring
- Click "Start Monitoring" to begin real-time posture detection
- The spine visualization will change color based on your posture
- Green = Good posture, Red = Bad posture

### 5. Settings
- Configure voice alerts, sound type, and alert thresholds
- Adjust volume and notification preferences
- Settings are saved per user

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Create new user
- `POST /api/login` - User login
- `GET /api/user/{id}/profile` - Get user profile

### Monitoring
- `POST /api/monitor/start` - Start posture monitoring
- `POST /api/monitor/stop` - Stop monitoring
- `GET /api/monitor/status` - Get monitoring status

### Calibration
- `POST /api/calibrate/good` - Collect good posture samples
- `POST /api/calibrate/bad` - Collect bad posture samples

### Models
- `POST /api/models/train` - Train new model
- `GET /api/models/{user_id}` - Get user's models
- `POST /api/models/{id}/activate` - Activate model
- `DELETE /api/models/{id}` - Delete model

### Settings
- `GET /api/settings/{user_id}` - Get user settings
- `PUT /api/settings/{user_id}` - Update user settings

## 🐛 Troubleshooting

### Common Issues

1. **Serial Port Connection Failed**
   - Check if Arduino is connected
   - Verify the correct COM port in `backend/app.py`
   - Ensure Arduino code is uploaded

2. **Model Training Fails**
   - Make sure you have calibration data (good and bad samples)
   - Check that CSV files are generated in the script directory
   - Verify Python dependencies are installed

3. **Frontend Can't Connect to Backend**
   - Ensure backend is running on port 5000
   - Check for CORS issues
   - Verify API_BASE_URL in `src/services/api.js`

4. **Database Issues**
   - The SQLite database is created automatically
   - Check file permissions in the backend directory
   - Delete `spineguard.db` to reset the database

### Debug Mode
- Backend runs in debug mode by default
- Check console output for error messages
- Frontend errors appear in browser console

## 📁 Project Structure

```
spineguard/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── models/            # User model storage
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API service
│   └── ...
├── Spineguard/script/     # Python scripts
│   ├── arduino.ino        # Arduino code
│   ├── serial_reader.py   # Data collection
│   ├── train_model.py     # Model training
│   └── predict_live.py    # Live prediction
└── ...
```

## 🔒 Security Notes

- Passwords are hashed using Werkzeug
- User data is isolated by user ID
- No sensitive data is stored in plain text
- CORS is enabled for development

## 📈 Performance

- Real-time monitoring updates every 2 seconds
- Model training uses Random Forest with 300 estimators
- Database queries are optimized for small datasets
- Frontend uses React with optimized re-renders

## 🆘 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure hardware is properly connected
4. Check the troubleshooting section above

For additional help, please check the project documentation or create an issue.
