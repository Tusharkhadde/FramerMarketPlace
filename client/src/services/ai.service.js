const aiService = {
  predictPrice: async (commodity, district) => {
    return new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      data: {
        currentPrice: 2000,
        priceSeries: Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i + 1);
          return { date: d.toISOString(), price: 2000 + (Math.random() - 0.5) * 500 };
        }),
        predictions: [
          { days: 7, price: 2100, confidence: 85 },
          { days: 14, price: 2200, confidence: 80 },
          { days: 30, price: 2300, confidence: 75 }
        ],
        recommendation: "HOLD for better prices",
        factors: ["Weather", "Historical Demand"]
      }
    }), 1000));
  }
};

export default aiService;
