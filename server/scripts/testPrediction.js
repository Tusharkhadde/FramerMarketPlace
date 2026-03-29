import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testPrediction() {
  console.log('🚀 Starting Prediction API Test...');
  try {
    const response = await axios.post(`${API_URL}/ai/predict-price`, {
      commodity: 'Tomato',
      district: 'Nashik',
      daysAhead: 30
    });

    if (response.data.success) {
      const { data } = response.data;
      console.log('✅ API call successful!');
      console.log(`📊 Commodity: ${data.commodity}`);
      console.log(`📍 District: ${data.district}`);
      console.log(`💰 Current Price: ₹${data.currentPrice}`);
      console.log(`📈 Predictions Count: ${data.predictions.length}`);
      console.log(`📉 Price Series Count: ${data.priceSeries.length}`);
      console.log(`💡 Recommendation: ${data.recommendation}`);
      
      if (data.priceSeries.length === 30) {
        console.log('✨ SUCCESS: Full 30-day series received.');
      } else {
        console.warn(`⚠️ WARNING: Expected 30 days, got ${data.priceSeries.length}`);
      }
    } else {
      console.error('❌ API returned success: false', response.data);
    }
  } catch (error) {
    console.error('❌ API call failed:', error.response?.data || error.message);
  }
}

testPrediction();
