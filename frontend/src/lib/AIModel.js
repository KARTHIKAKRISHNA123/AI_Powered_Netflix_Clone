import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the standard SDK
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GENAI_API_KEY);

// Use the stable, widely available model
// "gemini-1.5-flash" is the correct name for this SDK
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function getAIRecommendation(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text(); // Simple text return
    } catch (error) {
        console.error("Error fetching AI recommendation:", error);
        return null;
    }
}