from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
import jwt
from datetime import datetime, timedelta
import subprocess
import threading
import os
import json
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/spineguard'

mongo = PyMongo(app)
CORS(app)

# Global variables for monitoring state
monitoring_state = {
    'active': False,
    'user_id': None,
    'process': None,
    'current_posture': 'good'
}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Check if user already exists
        if mongo.db.users.find_one({'username': username}):
            return jsonify({'error': 'Username already exists'}), 400
        
        # Create new user
        hashed_password = generate_password_hash(password)
        user_data = {
            'username': username,
            'password': hashed_password,
            'email': email,
            'created_at': datetime.utcnow(),
            'settings': {
                'voice_alerts': True,
                'sound_type': 'voice',
                'alert_threshold': 10,
                'volume': 80,
                'notifications': True
            }
        }
        
        result = mongo.db.users.insert_one(user_data)
        user_id = str(result.inserted_id)
        
        # Generate token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=30)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': user_id,
            'username': username,
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user
        user = mongo.db.users.find_one({'username': username})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Generate token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(days=30)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'message': 'Login successful',
            'user_id': str(user['_id']),
            'username': user['username'],
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/settings', methods=['GET'])
@token_required
def get_user_settings(current_user_id, user_id):
    try:
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.get('settings', {})), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/settings', methods=['PUT'])
@token_required
def update_user_settings(current_user_id, user_id):
    try:
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'settings': data}}
        )
        
        return jsonify({'message': 'Settings updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calibrate/good', methods=['POST'])
@token_required
def calibrate_good_posture(current_user_id):
    try:
        data = request.get_json()
        samples = data.get('samples', 200)
        
        # Run serial_reader.py for good posture calibration
        result = subprocess.run([
            'python', 'scripts/serial_reader.py', 
            '--mode', 'calibrate_good',
            '--samples', str(samples),
            '--user_id', current_user_id
        ], capture_output=True, text=True, cwd='backend')
        
        if result.returncode != 0:
            return jsonify({'error': f'Calibration failed: {result.stderr}'}), 500
        
        # Save calibration data to database
        calibration_data = {
            'user_id': current_user_id,
            'type': 'good_posture',
            'samples': samples,
            'timestamp': datetime.utcnow(),
            'data_file': f'data/good_posture_{current_user_id}.csv'
        }
        mongo.db.calibrations.insert_one(calibration_data)
        
        return jsonify({'message': 'Good posture calibration completed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calibrate/bad', methods=['POST'])
@token_required
def calibrate_bad_posture(current_user_id):
    try:
        data = request.get_json()
        samples = data.get('samples', 200)
        
        # Run serial_reader.py for bad posture calibration
        result = subprocess.run([
            'python', 'scripts/serial_reader.py', 
            '--mode', 'calibrate_bad',
            '--samples', str(samples),
            '--user_id', current_user_id
        ], capture_output=True, text=True, cwd='backend')
        
        if result.returncode != 0:
            return jsonify({'error': f'Calibration failed: {result.stderr}'}), 500
        
        # Save calibration data to database
        calibration_data = {
            'user_id': current_user_id,
            'type': 'bad_posture',
            'samples': samples,
            'timestamp': datetime.utcnow(),
            'data_file': f'data/bad_posture_{current_user_id}.csv'
        }
        mongo.db.calibrations.insert_one(calibration_data)
        
        return jsonify({'message': 'Bad posture calibration completed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/monitoring/start', methods=['POST'])
@token_required
def start_monitoring(current_user_id):
    try:
        if monitoring_state['active']:
            return jsonify({'error': 'Monitoring is already active'}), 400
        
        # First, train the model
        print("Training model...")
        train_result = subprocess.run([
            'python', 'scripts/train_model.py',
            '--user_id', current_user_id
        ], capture_output=True, text=True, cwd='backend')
        
        if train_result.returncode != 0:
            return jsonify({'error': f'Model training failed: {train_result.stderr}'}), 500
        
        print("Model training completed. Starting live prediction...")
        
        # Start live prediction in a separate thread
        def run_prediction():
            global monitoring_state
            try:
                process = subprocess.Popen([
                    'python', 'scripts/predict_live.py',
                    '--user_id', current_user_id
                ], cwd='backend', stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                
                monitoring_state['process'] = process
                
                # Read predictions and update posture status
                for line in iter(process.stdout.readline, ''):
                    if line.strip():
                        try:
                            prediction_data = json.loads(line.strip())
                            monitoring_state['current_posture'] = prediction_data.get('posture', 'good')
                        except json.JSONDecodeError:
                            continue
                
            except Exception as e:
                print(f"Prediction error: {e}")
                monitoring_state['active'] = False
                monitoring_state['process'] = None
        
        prediction_thread = threading.Thread(target=run_prediction)
        prediction_thread.daemon = True
        prediction_thread.start()
        
        monitoring_state['active'] = True
        monitoring_state['user_id'] = current_user_id
        
        return jsonify({'message': 'Monitoring started successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/monitoring/stop', methods=['POST'])
@token_required
def stop_monitoring(current_user_id):
    try:
        global monitoring_state
        
        if not monitoring_state['active']:
            return jsonify({'error': 'Monitoring is not active'}), 400
        
        # Stop the prediction process
        if monitoring_state['process']:
            monitoring_state['process'].terminate()
            monitoring_state['process'] = None
        
        monitoring_state['active'] = False
        monitoring_state['user_id'] = None
        monitoring_state['current_posture'] = 'good'
        
        return jsonify({'message': 'Monitoring stopped successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/monitoring/status', methods=['GET'])
def get_monitoring_status():
    try:
        return jsonify({
            'active': monitoring_state['active'],
            'user_id': monitoring_state['user_id'],
            'current_posture': monitoring_state['current_posture']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/models', methods=['GET'])
@token_required
def get_user_models(current_user_id, user_id):
    try:
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get models from database
        models = list(mongo.db.models.find({'user_id': user_id}))
        
        # Convert ObjectId to string
        for model in models:
            model['_id'] = str(model['_id'])
        
        return jsonify(models), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('backend/data', exist_ok=True)
    os.makedirs('backend/models', exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)