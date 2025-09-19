#!/usr/bin/env python3
"""
Live Prediction for SpineGuard Posture Monitoring
Continuously reads sensor data and predicts posture in real-time
"""

import serial
import joblib
import numpy as np
import time
import argparse
import json
import os
from datetime import datetime

class LivePosturePredictor:
    def __init__(self, user_id, port='COM3', baudrate=9600):
        self.user_id = user_id
        self.port = port
        self.baudrate = baudrate
        self.serial_connection = None
        self.model = None
        self.scaler = None
        self.feature_columns = ['ax', 'ay', 'az', 'gx', 'gy', 'gz']
        
        # Prediction smoothing
        self.prediction_buffer = []
        self.buffer_size = 5
        self.bad_posture_threshold = 0.6  # 60% of recent predictions must be bad
        
    def load_model(self):
        """Load the trained model and scaler"""
        models_dir = 'models'
        model_filename = f'{models_dir}/posture_model_{self.user_id}.joblib'
        scaler_filename = f'{models_dir}/scaler_{self.user_id}.joblib'
        
        if not os.path.exists(model_filename):
            raise FileNotFoundError(f"Model not found: {model_filename}")
        
        if not os.path.exists(scaler_filename):
            raise FileNotFoundError(f"Scaler not found: {scaler_filename}")
        
        self.model = joblib.load(model_filename)
        self.scaler = joblib.load(scaler_filename)
        
        print(f"Model loaded from {model_filename}")
        print(f"Scaler loaded from {scaler_filename}")
    
    def connect_serial(self):
        """Connect to the serial port"""
        try:
            self.serial_connection = serial.Serial(self.port, self.baudrate, timeout=1)
            time.sleep(2)  # Wait for Arduino to initialize
            print(f"Connected to {self.port} at {self.baudrate} baud")
            return True
        except serial.SerialException as e:
            print(f"Failed to connect to {self.port}: {e}")
            return False
    
    def disconnect_serial(self):
        """Disconnect from the serial port"""
        if self.serial_connection and self.serial_connection.is_open:
            self.serial_connection.close()
            print("Serial connection closed")
    
    def read_sensor_data(self):
        """Read a single line of sensor data"""
        if not self.serial_connection or not self.serial_connection.is_open:
            return None
        
        try:
            line = self.serial_connection.readline().decode('utf-8').strip()
            if line:
                # Expected format: "ax,ay,az,gx,gy,gz"
                data = line.split(',')
                if len(data) == 6:
                    return [float(x) for x in data]
            return None
        except (UnicodeDecodeError, ValueError) as e:
            print(f"Error reading data: {e}")
            return None
    
    def predict_posture(self, sensor_data):
        """Predict posture from sensor data"""
        if self.model is None or self.scaler is None:
            return None
        
        # Reshape data for prediction
        data_array = np.array(sensor_data).reshape(1, -1)
        
        # Scale the data
        scaled_data = self.scaler.transform(data_array)
        
        # Make prediction
        prediction = self.model.predict(scaled_data)[0]
        probability = self.model.predict_proba(scaled_data)[0]
        
        # Convert prediction to label
        posture_label = 'bad' if prediction == 1 else 'good'
        confidence = max(probability)
        
        return {
            'posture': posture_label,
            'confidence': confidence,
            'raw_prediction': int(prediction),
            'probabilities': {
                'good': probability[0],
                'bad': probability[1]
            }
        }
    
    def smooth_predictions(self, prediction):
        """Apply smoothing to predictions to reduce noise"""
        # Add prediction to buffer
        self.prediction_buffer.append(prediction['raw_prediction'])
        
        # Keep buffer size limited
        if len(self.prediction_buffer) > self.buffer_size:
            self.prediction_buffer.pop(0)
        
        # Calculate smoothed prediction
        if len(self.prediction_buffer) >= 3:  # Need at least 3 samples
            bad_ratio = sum(self.prediction_buffer) / len(self.prediction_buffer)
            smoothed_posture = 'bad' if bad_ratio >= self.bad_posture_threshold else 'good'
        else:
            smoothed_posture = prediction['posture']
        
        return {
            'posture': smoothed_posture,
            'confidence': prediction['confidence'],
            'raw_posture': prediction['posture'],
            'smoothing_ratio': sum(self.prediction_buffer) / len(self.prediction_buffer) if self.prediction_buffer else 0
        }
    
    def start_monitoring(self):
        """Start live posture monitoring"""
        print("Starting live posture monitoring...")
        print("Press Ctrl+C to stop")
        
        if not self.connect_serial():
            return False
        
        try:
            while True:
                # Read sensor data
                sensor_data = self.read_sensor_data()
                
                if sensor_data:
                    # Make prediction
                    prediction = self.predict_posture(sensor_data)
                    
                    if prediction:
                        # Apply smoothing
                        smoothed_prediction = self.smooth_predictions(prediction)
                        
                        # Create output data
                        output_data = {
                            'timestamp': datetime.now().isoformat(),
                            'sensor_data': sensor_data,
                            'posture': smoothed_prediction['posture'],
                            'confidence': smoothed_prediction['confidence'],
                            'raw_posture': smoothed_prediction['raw_posture'],
                            'smoothing_ratio': smoothed_prediction['smoothing_ratio']
                        }
                        
                        # Output as JSON for the Flask app to read
                        print(json.dumps(output_data), flush=True)
                
                time.sleep(0.1)  # Small delay between readings
                
        except KeyboardInterrupt:
            print("\nMonitoring stopped by user")
        except Exception as e:
            print(f"Error during monitoring: {e}")
        finally:
            self.disconnect_serial()
        
        return True

def main():
    parser = argparse.ArgumentParser(description='Live SpineGuard Posture Prediction')
    parser.add_argument('--user_id', required=True, help='User ID for model loading')
    parser.add_argument('--port', default='COM3', help='Serial port (default: COM3)')
    parser.add_argument('--baudrate', type=int, default=9600, help='Baud rate (default: 9600)')
    
    args = parser.parse_args()
    
    try:
        predictor = LivePosturePredictor(args.user_id, args.port, args.baudrate)
        
        # Load the trained model
        predictor.load_model()
        
        # Start monitoring
        predictor.start_monitoring()
        
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

if __name__ == '__main__':
    main()