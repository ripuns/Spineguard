import serial
import time
import csv
import os
from datetime import datetime

# === CONFIGURATION ===
PORT = "COM7"       # Update to your Arduino COM port
BAUD = 115200
MAX_SAMPLES = 100   # Number of samples per posture

# === ASK FOR LABEL ===
LABEL = input("Label this session as 'good' or 'bad' posture: ").strip().lower()
if LABEL not in ["good", "bad"]:
    print("❌ Invalid label. Must be 'good' or 'bad'. Exiting.")
    exit()

# === SET OUTPUT FILE ===
OUTPUT_FILE = f"{LABEL}_samples.csv"
write_header = not os.path.exists(OUTPUT_FILE)

# === CONNECT TO ARDUINO ===
try:
    ser = serial.Serial(PORT, BAUD, timeout=1)
    print(f"✅ Connected to {PORT}")
except Exception as e:
    print(f"❌ Could not open serial port {PORT}. Error: {e}")
    exit()

# === OPEN CSV FILE ===
csv_file = open(OUTPUT_FILE, mode='a', newline='')
csv_writer = csv.writer(csv_file)

if write_header:
    csv_writer.writerow(["Timestamp", "AccelX", "AccelY", "AccelZ", "GyroX", "GyroY", "GyroZ", "Label"])

sample_count = 0
print(f"🟢 Collecting {MAX_SAMPLES} samples for '{LABEL}' posture...")

# === READ & SAVE DATA ===
while sample_count < MAX_SAMPLES:
    try:
        line = ser.readline().decode('utf-8').strip()
        if "ax" in line.lower():  # Skip header from Arduino
            continue
        if line:
            parts = line.split(',')
            if len(parts) == 7:
                ts, ax, ay, az, gx, gy, gz = parts
                ax, ay, az = float(ax), float(ay), float(az)
                gx, gy, gz = float(gx), float(gy), float(gz)

                print(f"[{sample_count+1}] AccelX: {ax:.2f}, AccelY: {ay:.2f}, AccelZ: {az:.2f}")

                # Write to CSV
                csv_writer.writerow([ts, ax, ay, az, gx, gy, gz, LABEL])
                csv_file.flush()
                sample_count += 1

        time.sleep(0.2)  # Slight delay to not overload serial buffer

    except Exception as e:
        print("❌ Error:", e)

# === CLEANUP ===
ser.close()
csv_file.close()
print(f"\n✅ Labeled data collection complete. {sample_count} samples saved to {OUTPUT_FILE}")
