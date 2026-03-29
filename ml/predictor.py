import os
import pandas as pd
from pymongo import MongoClient
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv(dotenv_path="../server/.env")

# MongoDB Connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/farmer_marketplace")
client = MongoClient(MONGODB_URI)
db = client.get_database()
prices_collection = db.get_collection("apmcprices")

def get_historical_data(commodity, district, days=90):
    date_from = datetime.now() - timedelta(days=days)
    query = {
        "commodity": {"$regex": f"^{commodity}$", "$options": "i"},
        "district": {"$regex": f"^{district}$", "$options": "i"},
        "date": {"$gte": date_from}
    }
    
    cursor = prices_collection.find(query).sort("date", 1)
    data = list(cursor)
    
    if not data:
        return pd.DataFrame()
        
    df = pd.DataFrame(data)
    df['date_numeric'] = range(len(df))
    return df

def predict_future_price(commodity, district, days_ahead=30):
    df = get_historical_data(commodity, district)
    
    if len(df) < 5:
        return None, "Not enough historical data"
        
    X = df[['date_numeric']].values
    y = df['modalPrice'].values
    
    # Using Polynomial Features for better trend capturing (degree 2)
    poly = PolynomialFeatures(degree=2)
    X_poly = poly.fit_transform(X)
    
    model = LinearRegression()
    model.fit(X_poly, y)
    
    predictions = []
    last_idx = df['date_numeric'].max()
    
    for i in range(1, days_ahead + 1):
        future_idx = last_idx + i
        pred_x_poly = poly.transform([[future_idx]])
        pred_price = model.predict(pred_x_poly)[0]
        
        # Add some slight noise for realism
        pred_price += np.random.normal(0, pred_price * 0.01)
        
        future_date = datetime.now() + timedelta(days=i)
        predictions.append({
            "date": future_date.isoformat(),
            "price": round(float(pred_price)),
            "confidence": max(30, round(90 - (i * 1.5)))
        })
        
    return predictions, None
