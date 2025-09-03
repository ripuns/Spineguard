import serial
import time
import csv
import os
from datetime import datetime

# === CONFIGURATION ===
PORT = "COM7"     # Adjust to your Arduino COM port
BAUD = 115200
MAX_SAMPLES = 100  # Auto-stop after this many samples (adjust if needed)

# === CREATE CSV FILE ===
filename = f"imu_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
file_path = os.path.join(os.getcwd(), filename)

csv_file = open(file_path, mode='w', newline='')
csv_writer = csv.writer(csv_file)
csv_writer.writerow(["Timestamp", "AccelX", "AccelY", "AccelZ", "GyroX", "GyroY", "GyroZ"])

# === CONNECT TO ARDUINO ===
ser = serial.Serial(PORT, BAUD, timeout=1)
print(f"Connected to {PORT}")
print(f"Saving data to: {file_path}")

sample_count = 0

# === READ AND SAVE DATA ===
while sample_count < MAX_SAMPLES:
    try:
        line = ser.readline().decode('utf-8').strip()
        if "ax" in line.lower():  # Skip CSV header
         continue
        if line:
            parts = line.split(',')
            if len(parts) == 7:
                ts, ax, ay, az, gx, gy, gz = parts
                ax, ay, az = float(ax), float(ay), float(az)
                gx, gy, gz = float(gx), float(gy), float(gz)

                print(f"[{sample_count+1}] AccelX: {ax:.2f}, AccelY: {ay:.2f}, AccelZ: {az:.2f}")

                # Write to CSV
                csv_writer.writerow([ts, ax, ay, az, gx, gy, gz])
                csv_file.flush()
                sample_count += 1
            
        time.sleep(1);

    except Exception as e:
        print("Error:", e)

# === CLEANUP ===
ser.close()
csv_file.close()
print(f"\n✅ Data collection complete. Saved {sample_count} samples to:")
print(file_path)
