import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a market advisor report using Gemini AI
 * @param {Object} data Market data including current price, trend, and commodity info
 * @returns {Promise<string>} Narrative advice
 */
export const generateMarketAdvice = async (data) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert AI Agricultural Market Advisor for the "Farmer Marketplace" platform.
      
      Current Market Data for ${data.commodity} in ${data.district}:
      - Current Market Price: ₹${data.currentPrice}/kg
      - Predicted Price (7 days): ₹${data.predictions[0].price}/kg
      - Trend: ${data.trend}
      - Confidence: ${data.predictions[0].confidence}%
      - Historical Data Points: ${data.dataPoints}

      Task: Provide a concise, professional, and strategic narrative advice to a farmer.
      Include:
      1. A "Sell" or "Hold" recommendation.
      2. Reasoning based on the predicted trend and potential seasonal factors.
      3. One specific tip for maximizing their profit (e.g., quality improvements, timing, or storage).

      Keep the tone helpful, encouraging, and expert. Limit response to 3-4 short sentences.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Advisor Error:", error);
    return "Market conditions are currently stable. Monitor local updates for the best selling window.";
  }
};

/**
 * Enhanced product description generator
 */
export const generateProductDescription = async (productInfo) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Generate a professional, high-converting product description for a farmer selling ${productInfo.cropName} on a digital marketplace.
      
      Details:
      - Category: ${productInfo.category}
      - Organic: ${productInfo.isOrganic ? "Yes" : "No"}
      - Quality Grade: ${productInfo.qualityGrade}
      - District: ${productInfo.district}
      
      Include emotional appeal about freshness and farm-to-table quality. Keep it under 60 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Description Error:", error);
    return null;
  }
};

/**
 * AI Vision: Analyzes a crop image for quality and disease detection
 * @param {string}imageBase64 Base64 encoded image data
 * @param {string} mimeType Image mime type (e.g. image/jpeg)
 */
export const analyzeCropImage = async (imageBase64, mimeType = "image/jpeg") => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert Agricultural Pathologist and Quality Inspector.
      Analyze this crop image and provide:
      1. Crop Identification: What is being shown?
      2. Health Assessment: Are there signs of pests, diseases, or nutrient deficiency?
      3. Quality Grade: Assign an internal grade (A, B, or C) based on visual appearance.
      4. Market Suitability: Is this suitable for premium marketplace listing?
      
      Format your response as a JSON object with keys: identifyingName, healthSummary, detectedIssues (array), suggestedGrade, marketReady (boolean), and detailedAdvice.
    `;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response from markdown blocks if present
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze crop image. Ensure image quality is high.");
  }
};
