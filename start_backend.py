#!/usr/bin/env python3
"""
Startup script for SpineGuard backend
"""
import subprocess
import sys
import os
import time

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"], check=True)
        print("✅ Python requirements installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Python requirements: {e}")
        return False
    return True

def start_backend():
    """Start the Flask backend"""
    print("Starting SpineGuard backend...")
    try:
        # Change to backend directory
        os.chdir("backend")
        subprocess.run([sys.executable, "app.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start backend: {e}")
        return False
    except KeyboardInterrupt:
        print("\n👋 Backend stopped")
        return True
    return True

def main():
    print("🚀 Starting SpineGuard Backend...")
    print("=" * 50)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Start backend
    start_backend()

if __name__ == "__main__":
    main()
