import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Load the CSV files
good_df = pd.read_csv('good_samples_20250916_204948.csv')
bad_df = pd.read_csv('bad_samples_20250916_205046.csv')

# Add labels
good_df['label'] = 'good'
bad_df['label'] = 'bad'

# Combine into one DataFrame
df = pd.concat([good_df, bad_df], ignore_index=True)

# Plot pairwise relationships
sns.pairplot(df, hue='label', corner=True)
plt.suptitle("Posture Feature Distributions", y=1.02)
plt.show()
