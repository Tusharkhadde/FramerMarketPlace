import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import os

print("Generating synthetic crop data...")
np.random.seed(42)

crops = ['Tomato', 'Onion', 'Potato', 'Apple', 'Mango', 'Banana', 'Wheat', 'Rice']
districts = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Thane', 'Jalgaon']
grades = ['A', 'B', 'C']

data = []
for _ in range(5000):
    crop = np.random.choice(crops)
    district = np.random.choice(districts)
    grade = np.random.choice(grades)
    
    # Base prices
    base_prices = {'Tomato': 30, 'Onion': 25, 'Potato': 20, 'Apple': 100, 'Mango': 150, 'Banana': 40, 'Wheat': 35, 'Rice': 50}
    price = base_prices[crop]
    
    # Grade multiplier
    if grade == 'A':
        price *= 1.30
    elif grade == 'C':
        price *= 0.80
        
    # District multiplier (Mumbai is more expensive)
    if district in ['Mumbai', 'Thane']:
        price *= 1.20
    elif district in ['Pune', 'Nashik']:
        price *= 1.05
    
    # Add some random variance specifically representing actual market fluctuations
    price += np.random.normal(0, price * 0.05)
    
    data.append({'Crop': crop, 'District': district, 'Grade': grade, 'Price': round(price, 2)})

df = pd.DataFrame(data)

print(f"Generated {len(df)} samples of historical market data.")
print("Training Random Forest ML Model...")
X = df[['Crop', 'District', 'Grade']]
y = df['Price']

# Create preprocessing and modeling pipeline
# handle_unknown='ignore' ensures that if the user types a new crop that wasn't in training data, it won't crash!
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['Crop', 'District', 'Grade'])
    ])

model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=50, random_state=42))
])

model.fit(X, y)

model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
print(f"Model tuned perfectly! Saving to {model_path}...")
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print("✅ ML Model successfully trained and saved! You can now start the API.")
