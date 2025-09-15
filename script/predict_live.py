import serial
import pickle
import time
import numpy as np

# === CONFIG ===
PORT = 'COM7'
BAUD = 115200
MODEL_PATH = 'posture_model.pkl'

# === LOAD MODEL ===
try:
    with open(MODEL_PATH, 'rb') as f:
        clf = pickle.load(f)
    print("✅ Model loaded successfully.")
except Exception as e:
    print("❌ Model loading failed:", e)
    exit()

# === OPEN SERIAL CONNECTION ===
try:
    ser = serial.Serial(PORT, BAUD, timeout=1)
    print(f"✅ Connected to {PORT}")
except Exception as e:
    print("❌ Serial connection failed:", e)
    exit()

print("🟢 Starting live posture prediction...\n")

# === LIVE PREDICTION LOOP ===
while True:
    try:
        line = ser.readline().decode('utf-8').strip()

        # Ignore header or empty lines
        if not line or 'ax' in line.lower():
            continue

        parts = line.split(',')
        if len(parts) != 7:
            continue

        # Parse features
        ts, ax, ay, az, gx, gy, gz = parts
        features = [float(ax), float(ay), float(az), float(gx), float(gy), float(gz)]

        # Print feature values for debugging
        print(f"🧪 Features: {features}")

        # Predict posture
        prediction = clf.predict([features])[0]
        emoji = "📌"
        print(f"{emoji} Posture: {prediction.upper()}")

        time.sleep(0.5)

    except KeyboardInterrupt:
        print("\n🛑 Stopped by user.")
        break
    except Exception as e:
        print("⚠️ Parse/Prediction error:", e)
