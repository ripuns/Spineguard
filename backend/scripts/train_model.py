#!/usr/bin/env python3
"""
Model Training for SpineGuard Posture Monitoring
Trains machine learning model using calibration data
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import argparse
from datetime import datetime
import json

class PostureModelTrainer:
    def __init__(self, user_id):
        self.user_id = user_id
        self.model = None
        self.scaler = None
        self.feature_columns = ['ax', 'ay', 'az', 'gx', 'gy', 'gz']
        
    def load_calibration_data(self):
        """Load calibration data for the user"""
        data_dir = 'data'
        good_file = f'{data_dir}/good_posture_{self.user_id}.csv'
        bad_file = f'{data_dir}/bad_posture_{self.user_id}.csv'
        
        datasets = []
        
        # Load good posture data
        if os.path.exists(good_file):
            good_data = pd.read_csv(good_file)
            print(f"Loaded {len(good_data)} good posture samples")
            datasets.append(good_data)
        else:
            print(f"Warning: Good posture data not found at {good_file}")
        
        # Load bad posture data
        if os.path.exists(bad_file):
            bad_data = pd.read_csv(bad_file)
            print(f"Loaded {len(bad_data)} bad posture samples")
            datasets.append(bad_data)
        else:
            print(f"Warning: Bad posture data not found at {bad_file}")
        
        if not datasets:
            raise FileNotFoundError("No calibration data found. Please run calibration first.")
        
        # Combine datasets
        combined_data = pd.concat(datasets, ignore_index=True)
        print(f"Total samples: {len(combined_data)}")
        
        return combined_data
    
    def preprocess_data(self, data):
        """Preprocess the data for training"""
        # Extract features and labels
        X = data[self.feature_columns].values
        y = data['label'].values
        
        # Convert labels to binary (good=0, bad=1)
        y_binary = np.where(y == 'good', 0, 1)
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, y_binary
    
    def train_model(self, X, y):
        """Train the posture classification model"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train Random Forest model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        print("Training model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Model accuracy: {accuracy:.3f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Good', 'Bad']))
        
        return accuracy
    
    def save_model(self, accuracy):
        """Save the trained model and scaler"""
        models_dir = 'models'
        os.makedirs(models_dir, exist_ok=True)
        
        model_filename = f'{models_dir}/posture_model_{self.user_id}.joblib'
        scaler_filename = f'{models_dir}/scaler_{self.user_id}.joblib'
        
        # Save model and scaler
        joblib.dump(self.model, model_filename)
        joblib.dump(self.scaler, scaler_filename)
        
        # Save model metadata
        metadata = {
            'user_id': self.user_id,
            'accuracy': accuracy,
            'created_at': datetime.now().isoformat(),
            'feature_columns': self.feature_columns,
            'model_type': 'RandomForestClassifier'
        }
        
        metadata_filename = f'{models_dir}/model_metadata_{self.user_id}.json'
        with open(metadata_filename, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Model saved to {model_filename}")
        print(f"Scaler saved to {scaler_filename}")
        print(f"Metadata saved to {metadata_filename}")
        
        return model_filename, scaler_filename, metadata_filename

def main():
    parser = argparse.ArgumentParser(description='Train SpineGuard Posture Model')
    parser.add_argument('--user_id', required=True, help='User ID for model training')
    
    args = parser.parse_args()
    
    try:
        trainer = PostureModelTrainer(args.user_id)
        
        # Load and preprocess data
        print("Loading calibration data...")
        data = trainer.load_calibration_data()
        
        print("Preprocessing data...")
        X, y = trainer.preprocess_data(data)
        
        # Train model
        accuracy = trainer.train_model(X, y)
        
        # Save model
        trainer.save_model(accuracy)
        
        print(f"\nModel training completed successfully!")
        print(f"Final accuracy: {accuracy:.3f}")
        
    except Exception as e:
        print(f"Error during training: {e}")
        exit(1)

if __name__ == '__main__':
    main()