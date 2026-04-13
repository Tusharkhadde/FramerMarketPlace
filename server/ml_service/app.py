from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os

app = Flask(__name__)
# Enable CORS so the React app running on port 5173 can communicate with it
CORS(app)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ ML Model loaded successfully")
except FileNotFoundError:
    print("❌ Error: model.pkl not found! Please run train.py first.")
    model = None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'Online',
        'service': 'Farmer Marketplace ML Predictive API',
        'version': '1.0.0'
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not trained yet server-side'}), 500
        
    try:
        data = request.json
        crop = data.get('cropName', '')
        district = data.get('district', '')
        grade = data.get('qualityGrade', 'B')
        user_price = float(data.get('pricePerKg', 0))
        
        # If crop name is empty, provide a fallback
        if not crop:
            return jsonify({'error': 'Crop name is required'}), 400
            
        # Clean inputs so they match training data format
        crop_clean = crop.title().strip()
        
        # The model needs a DataFrame with the exact column names used during training
        input_data = pd.DataFrame([{
            'Crop': crop_clean,
            'District': district,
            'Grade': grade
        }])
        
        # We predict using the pipeline
        predicted_price = model.predict(input_data)[0]
        
        # Calculate healthy bounds (assuming +/- 20% is acceptable variance)
        avg_low = round(predicted_price * 0.8)
        avg_high = round(predicted_price * 1.2)
        
        status = 'Good'
        if user_price < avg_low:
            status = 'Low'
            message = f"Based on our trained ML model, the fair market price for {crop_clean} in {district} is ₹{round(predicted_price)}. Your price of ₹{user_price} is highly competitive and well below market average!"
        elif user_price > avg_high:
            status = 'High'
            message = f"Our ML model predicts the real market value for {crop_clean} in {district} is around ₹{round(predicted_price)}. You are pricing yours as a Premium product! Make sure your description justifies the premium."
        else:
            status = 'Excellent'
            message = f"Our ML model pinpointed the exact market value of {crop_clean} in {district} to be ₹{round(predicted_price)}. Your price of ₹{user_price} is perfectly Excellent and accurate!"

        return jsonify({
            'predicted_price': round(predicted_price, 2),
            'avg_low': avg_low,
            'avg_high': avg_high,
            'status': status,
            'message': message
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Starting ML Predictive Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'False').lower() == 'true')
