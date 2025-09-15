import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from joblib import dump
import os

# === Load and merge data ===
good_df = pd.read_csv("good_samples.csv")
bad_df = pd.read_csv("bad_samples.csv")

good_df["posture"] = "good"
bad_df["posture"] = "bad"

df = pd.concat([good_df, bad_df], ignore_index=True)

# === Preview ===
print("\nSample of merged dataset:")
print(df.head())

print("\nLabel counts:")
print(df["posture"].value_counts())

# === Feature selection ===
X = df[["AccelX", "AccelY", "AccelZ", "GyroX", "GyroY", "GyroZ"]]
y = df["posture"]

# === Split ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === Model Training ===
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# === Evaluation ===
y_pred = clf.predict(X_test)
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# === Save model ===
dump(clf, "posture_model.pkl")
print("\n✅ Model saved as posture_model.pkl")
