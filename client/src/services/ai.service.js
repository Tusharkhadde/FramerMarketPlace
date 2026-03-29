import api from '@/config/api';

const aiService = {
  predictPrice: async (commodity, district, daysAhead = 30) => {
    try {
      const response = await api.post('/ai/predict-price', {
        commodity,
        district,
        daysAhead
      });
      return response.data;
    } catch (error) {
      console.error('Error predicting price:', error);
      throw error.response?.data || error.message;
    }
  },

  getCropRecommendations: async (district, month) => {
    try {
      const response = await api.post('/ai/crop-recommendations', {
        district,
        month
      });
      return response.data;
    } catch (error) {
      console.error('Error getting crop recommendations:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default aiService;
