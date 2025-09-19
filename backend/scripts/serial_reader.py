#!/usr/bin/env python3
"""
Serial Reader for SpineGuard Posture Monitoring
Reads data from Arduino MPU6050 sensor and saves calibration data
"""

import serial
import csv
import time
import argparse
import os
from datetime import datetime

class SerialReader:
    def __init__(self, port='COM3', baudrate=9600):
        self.port = port
        self.baudrate = baudrate
        self.serial_connection = None
        
    def connect(self):
        """Connect to the serial port"""
        try:
            self.serial_connection = serial.Serial(self.port, self.baudrate, timeout=1)
            time.sleep(2)  # Wait for Arduino to initialize
            print(f"Connected to {self.port} at {self.baudrate} baud")
            return True
        except serial.SerialException as e:
            print(f"Failed to connect to {self.port}: {e}")
            return False
    
    def disconnect(self):
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
    
    def calibrate_posture(self, mode, samples, user_id):
        """Collect calibration data for good or bad posture"""
        if not self.connect():
            return False
        
        # Create data directory if it doesn't exist
        data_dir = 'data'
        os.makedirs(data_dir, exist_ok=True)
        
        # Determine filename based on mode
        if mode == 'calibrate_good':
            filename = f'{data_dir}/good_posture_{user_id}.csv'
            posture_type = 'good'
        elif mode == 'calibrate_bad':
            filename = f'{data_dir}/bad_posture_{user_id}.csv'
            posture_type = 'bad'
        else:
            print(f"Invalid mode: {mode}")
            return False
        
        print(f"Starting {posture_type} posture calibration...")
        print(f"Please maintain {posture_type} posture for {samples} samples")
        print("Calibration will start in 3 seconds...")
        
        # Countdown
        for i in range(3, 0, -1):
            print(f"{i}...")
            time.sleep(1)
        
        print("Calibration started!")
        
        collected_samples = 0
        
        try:
            with open(filename, 'w', newline='') as csvfile:
                writer = csv.writer(csvfile)
                # Write header
                writer.writerow(['ax', 'ay', 'az', 'gx', 'gy', 'gz', 'label', 'timestamp'])
                
                while collected_samples < samples:
                    data = self.read_sensor_data()
                    if data:
                        # Add label and timestamp
                        row = data + [posture_type, datetime.now().isoformat()]
                        writer.writerow(row)
                        collected_samples += 1
                        
                        # Progress indicator
                        if collected_samples % 10 == 0:
                            progress = (collected_samples / samples) * 100
                            print(f"Progress: {progress:.1f}% ({collected_samples}/{samples})")
                    
                    time.sleep(0.1)  # Small delay between readings
        
        except KeyboardInterrupt:
            print("\nCalibration interrupted by user")
            return False
        except Exception as e:
            print(f"Error during calibration: {e}")
            return False
        finally:
            self.disconnect()
        
        print(f"\nCalibration completed! {collected_samples} samples saved to {filename}")
        return True

def main():
    parser = argparse.ArgumentParser(description='SpineGuard Serial Reader')
    parser.add_argument('--mode', choices=['calibrate_good', 'calibrate_bad'], 
                       required=True, help='Calibration mode')
    parser.add_argument('--samples', type=int, default=200, 
                       help='Number of samples to collect')
    parser.add_argument('--user_id', required=True, 
                       help='User ID for data association')
    parser.add_argument('--port', default='COM3', 
                       help='Serial port (default: COM3)')
    parser.add_argument('--baudrate', type=int, default=9600, 
                       help='Baud rate (default: 9600)')
    
    args = parser.parse_args()
    
    reader = SerialReader(port=args.port, baudrate=args.baudrate)
    
    success = reader.calibrate_posture(args.mode, args.samples, args.user_id)
    
    if success:
        print("Calibration completed successfully!")
        exit(0)
    else:
        print("Calibration failed!")
        exit(1)

if __name__ == '__main__':
    main()