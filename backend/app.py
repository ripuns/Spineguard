from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import os
import json
import threading
import time
import serial
import joblib
import numpy as np
from datetime import datetime
import sqlite3
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash
import glob

app = Flask(__name__)
CORS(app)

# Database setup
def init_db():
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            profile_data TEXT
        )
    ''')
    
    # User models table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            model_name TEXT NOT NULL,
            model_path TEXT NOT NULL,
            accuracy REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # User settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            voice_alerts BOOLEAN DEFAULT TRUE,
            sound_type TEXT DEFAULT 'voice',
            alert_threshold INTEGER DEFAULT 10,
            volume INTEGER DEFAULT 80,
            notifications BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Global variables for monitoring
monitoring_active = False
monitoring_thread = None
current_user_id = None
serial_connection = None

class PostureMonitor:
    def __init__(self, user_id):
        self.user_id = user_id
        self.serial_port = 'COM7'  # Default port
        self.baud_rate = 115200
        self.model_path = f"models/user_{user_id}_model.joblib"
        self.is_monitoring = False
        self.serial_conn = None
        self.model = None
        self.feat_buffer = []
        self.vote_buffer = []
        self.bad_count = 0
        self.alert_threshold = 10
        
    def load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                return True
            else:
                # Load default model if user model doesn't exist
                default_model = "models/default_model.joblib"
                if os.path.exists(default_model):
                    self.model = joblib.load(default_model)
                    return True
        except Exception as e:
            print(f"Error loading model: {e}")
        return False
    
    def connect_serial(self):
        try:
            self.serial_conn = serial.Serial(self.serial_port, self.baud_rate, timeout=1)
            return True
        except Exception as e:
            print(f"Serial connection error: {e}")
            return False
    
    def extract_features(self, ax, ay, az, gx, gy, gz):
        accel_mag = np.sqrt(ax**2 + ay**2 + az**2)
        gyro_mag = np.sqrt(gx**2 + gy**2 + gz**2)
        tilt_angle = np.degrees(np.arctan2(np.sqrt(ax**2 + ay**2), az))
        return [ax, ay, az, gx, gy, gz, accel_mag, gyro_mag, tilt_angle]
    
    def start_monitoring(self):
        if not self.load_model():
            return False, "No model available"
        
        if not self.connect_serial():
            return False, "Serial connection failed"
        
        self.is_monitoring = True
        self.feat_buffer = []
        self.vote_buffer = []
        self.bad_count = 0
        
        def monitor_loop():
            while self.is_monitoring:
                try:
                    line = self.serial_conn.readline().decode('utf-8').strip()
                    if not line or 'ax' in line.lower():
                        continue
                    
                    parts = line.split(',')
                    if len(parts) != 7:
                        continue
                    
                    ts, ax, ay, az, gx, gy, gz = parts
                    ax, ay, az = float(ax), float(ay), float(az)
                    gx, gy, gz = float(gx), float(gy), float(gz)
                    
                    feature = self.extract_features(ax, ay, az, gx, gy, gz)
                    self.feat_buffer.append(feature)
                    
                    if len(self.feat_buffer) >= 4:  # Buffer size
                        self.feat_buffer = self.feat_buffer[-4:]  # Keep last 4
                        smoothed = np.mean(self.feat_buffer, axis=0).reshape(1, -1)
                        pred = self.model.predict(smoothed)[0]
                        
                        self.vote_buffer.append(pred)
                        if len(self.vote_buffer) >= 3:  # Vote buffer size
                            self.vote_buffer = self.vote_buffer[-3:]
                            final_pred = max(set(self.vote_buffer), key=self.vote_buffer.count)
                            
                            if final_pred.upper() == "BAD":
                                self.bad_count += 1
                                if self.bad_count >= self.alert_threshold:
                                    # Trigger alert
                                    self.trigger_alert()
                            else:
                                self.bad_count = 0
                            
                            # Update posture status in database or emit to frontend
                            self.update_posture_status(final_pred)
                
                except Exception as e:
                    print(f"Monitoring error: {e}")
                    time.sleep(0.1)
        
        threading.Thread(target=monitor_loop, daemon=True).start()
        return True, "Monitoring started"
    
    def stop_monitoring(self):
        self.is_monitoring = False
        if self.serial_conn:
            self.serial_conn.close()
        return True, "Monitoring stopped"
    
    def trigger_alert(self):
        # This would trigger the voice alert or notification
        print(f"ALERT: Bad posture detected for user {self.user_id}")
        # Here you would implement the actual alert mechanism
    
    def update_posture_status(self, status):
        # Update posture status in database or emit to frontend
        print(f"Posture status for user {self.user_id}: {status}")

# Initialize database
init_db()

# User management endpoints
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Username already exists'}), 400
    
    # Create user
    password_hash = generate_password_hash(password)
    cursor.execute(
        'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
        (username, password_hash, email)
    )
    user_id = cursor.lastrowid
    
    # Create default settings
    cursor.execute(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        (user_id,)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'User created successfully', 'user_id': user_id})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT id, password_hash, username FROM users WHERE username = ?',
        (username,)
    )
    user = cursor.fetchone()
    
    if user and check_password_hash(user[1], password):
        conn.close()
        return jsonify({
            'message': 'Login successful',
            'user_id': user[0],
            'username': user[2]
        })
    else:
        conn.close()
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/user/<int:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT username, email, created_at FROM users WHERE id = ?',
        (user_id,)
    )
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    conn.close()
    return jsonify({
        'username': user[0],
        'email': user[1],
        'created_at': user[2]
    })

# Posture monitoring endpoints
@app.route('/api/monitor/start', methods=['POST'])
def start_monitoring():
    global monitoring_active, monitoring_thread, current_user_id
    
    data = request.get_json()
    user_id = data.get('user_id')
    
    if monitoring_active:
        return jsonify({'error': 'Monitoring already active'}), 400
    
    monitor = PostureMonitor(user_id)
    success, message = monitor.start_monitoring()
    
    if success:
        monitoring_active = True
        current_user_id = user_id
        return jsonify({'message': message})
    else:
        return jsonify({'error': message}), 500

@app.route('/api/monitor/stop', methods=['POST'])
def stop_monitoring():
    global monitoring_active, current_user_id
    
    if not monitoring_active:
        return jsonify({'error': 'No active monitoring session'}), 400
    
    monitor = PostureMonitor(current_user_id)
    monitor.stop_monitoring()
    monitoring_active = False
    current_user_id = None
    
    return jsonify({'message': 'Monitoring stopped'})

@app.route('/api/monitor/status', methods=['GET'])
def get_monitoring_status():
    return jsonify({
        'active': monitoring_active,
        'user_id': current_user_id
    })

# Calibration endpoints
@app.route('/api/calibrate/good', methods=['POST'])
def calibrate_good_posture():
    data = request.get_json()
    user_id = data.get('user_id')
    samples = data.get('samples', 200)
    
    try:
        # Run the serial_reader.py script for good posture
        result = subprocess.run([
            'python', 'Spineguard/script/serial_reader.py',
            '--label', 'GOOD',
            '--samples', str(samples)
        ], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            return jsonify({'message': f'Collected {samples} good posture samples'})
        else:
            return jsonify({'error': result.stderr}), 500
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Calibration timeout'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calibrate/bad', methods=['POST'])
def calibrate_bad_posture():
    data = request.get_json()
    user_id = data.get('user_id')
    samples = data.get('samples', 200)
    
    try:
        # Run the serial_reader.py script for bad posture
        result = subprocess.run([
            'python', 'Spineguard/script/serial_reader.py',
            '--label', 'BAD',
            '--samples', str(samples)
        ], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            return jsonify({'message': f'Collected {samples} bad posture samples'})
        else:
            return jsonify({'error': result.stderr}), 500
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Calibration timeout'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Model management endpoints
@app.route('/api/models/train', methods=['POST'])
def train_model():
    data = request.get_json()
    user_id = data.get('user_id')
    
    try:
        # Run the train_model.py script
        result = subprocess.run([
            'python', 'Spineguard/script/train_model.py'
        ], capture_output=True, text=True, timeout=600)
        
        if result.returncode == 0:
            # Save model info to database
            model_path = f"models/user_{user_id}_model.joblib"
            os.makedirs('models', exist_ok=True)
            
            # Copy the trained model to user-specific location
            if os.path.exists('model.joblib'):
                import shutil
                shutil.copy('model.joblib', model_path)
            
            conn = sqlite3.connect('spineguard.db')
            cursor = conn.cursor()
            
            # Deactivate other models for this user
            cursor.execute(
                'UPDATE user_models SET is_active = FALSE WHERE user_id = ?',
                (user_id,)
            )
            
            # Add new model
            cursor.execute(
                'INSERT INTO user_models (user_id, model_name, model_path, is_active) VALUES (?, ?, ?, ?)',
                (user_id, f'model_{datetime.now().strftime("%Y%m%d_%H%M%S")}.joblib', model_path, True)
            )
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Model trained successfully'})
        else:
            return jsonify({'error': result.stderr}), 500
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Training timeout'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<int:user_id>', methods=['GET'])
def get_user_models(user_id):
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT id, model_name, model_path, accuracy, created_at, is_active FROM user_models WHERE user_id = ? ORDER BY created_at DESC',
        (user_id,)
    )
    models = cursor.fetchall()
    
    conn.close()
    
    return jsonify([{
        'id': model[0],
        'name': model[1],
        'path': model[2],
        'accuracy': model[3],
        'created_at': model[4],
        'is_active': bool(model[5])
    } for model in models])

@app.route('/api/models/<int:model_id>/activate', methods=['POST'])
def activate_model(model_id):
    data = request.get_json()
    user_id = data.get('user_id')
    
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    # Deactivate all models for this user
    cursor.execute(
        'UPDATE user_models SET is_active = FALSE WHERE user_id = ?',
        (user_id,)
    )
    
    # Activate selected model
    cursor.execute(
        'UPDATE user_models SET is_active = TRUE WHERE id = ? AND user_id = ?',
        (model_id, user_id)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Model activated'})

@app.route('/api/models/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    data = request.get_json()
    user_id = data.get('user_id')
    
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    # Get model info
    cursor.execute(
        'SELECT model_path FROM user_models WHERE id = ? AND user_id = ?',
        (model_id, user_id)
    )
    model = cursor.fetchone()
    
    if not model:
        conn.close()
        return jsonify({'error': 'Model not found'}), 404
    
    # Delete from database
    cursor.execute(
        'DELETE FROM user_models WHERE id = ? AND user_id = ?',
        (model_id, user_id)
    )
    
    conn.commit()
    conn.close()
    
    # Delete file
    if os.path.exists(model[0]):
        os.remove(model[0])
    
    return jsonify({'message': 'Model deleted'})

# Settings endpoints
@app.route('/api/settings/<int:user_id>', methods=['GET'])
def get_user_settings(user_id):
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT voice_alerts, sound_type, alert_threshold, volume, notifications FROM user_settings WHERE user_id = ?',
        (user_id,)
    )
    settings = cursor.fetchone()
    
    conn.close()
    
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    
    return jsonify({
        'voice_alerts': bool(settings[0]),
        'sound_type': settings[1],
        'alert_threshold': settings[2],
        'volume': settings[3],
        'notifications': bool(settings[4])
    })

@app.route('/api/settings/<int:user_id>', methods=['PUT'])
def update_user_settings(user_id):
    data = request.get_json()
    
    conn = sqlite3.connect('spineguard.db')
    cursor = conn.cursor()
    
    cursor.execute(
        '''UPDATE user_settings SET 
           voice_alerts = ?, sound_type = ?, alert_threshold = ?, 
           volume = ?, notifications = ? 
           WHERE user_id = ?''',
        (data.get('voice_alerts'), data.get('sound_type'), 
         data.get('alert_threshold'), data.get('volume'), 
         data.get('notifications'), user_id)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Settings updated'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
