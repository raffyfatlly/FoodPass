import { GoogleGenAI } from "@google/genai";
import { ScanResult } from "../types";

// Helper to retrieve API Key safely from either Node env (Preview) or Vite env (Vercel)
const getApiKey = (): string => {
  // 1. Check process.env (Standard Node/System)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // 2. Check import.meta.env (Vite/Vercel)
  // Note: You must set VITE_API_KEY in your Vercel Project Settings
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  
  console.warn("Gemini API Key is missing. Please set VITE_API_KEY in your environment variables.");
  return "";
};

const API_KEY = getApiKey();

export const analyzeImage = async (base64Image: string): Promise<ScanResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Updated prompt to check for food/drink relevance first
    const prompt = `Analyze this image.
    1. First, determine if the main subject is a food or drink product (packaged or prepared).
    
    If it is NOT a food or drink item (e.g. electronic, clothing, furniture, person, vehicle, etc.), return exactly this JSON:
    { "error": "not_food" }
    
    If it IS a food or drink item:
    2. Visually identify the exact Brand and Product Name.
    3. USE GOOGLE SEARCH to find the official commercial details for this specific product:
       - The exact Net Weight or Volume (e.g. '50g', '330ml').
       - The full Ingredient List.
    
    Output the result as a valid JSON object with this structure:
    {
      "brand": "Brand Name",
      "name": "Product Name",
      "ingredients": "Full ingredient list...",
      "weight": "Net Weight",
      "quantity": 1
    }
    
    Do NOT return Markdown code blocks. Just return the raw JSON string.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        tools: [{googleSearch: {}}], // Enable Google Search Grounding for images too
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");

    // Clean up response to ensure valid JSON (remove markdown code blocks if present)
    let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    }

    const result = JSON.parse(jsonStr);

    // Check for explicit non-food error
    if (result.error === 'not_food') {
        throw new Error("NOT_FOOD");
    }

    return result as ScanResult;
  } catch (error: any) {
    if (error.message !== 'NOT_FOOD') {
        console.error("Error analyzing image:", error);
    }
    throw error;
  }
};

export const analyzeText = async (query: string): Promise<ScanResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `User is looking for details of this food product: "${query}".
    
    USE GOOGLE SEARCH to find the official commercial details for this specific product.
    1. Identify the Brand and accurate Product Name.
    2. Find the exact commercial NET WEIGHT for this product (e.g. '45g', '375ml', '12oz').
    3. Find the full Ingredients List.
    
    Output the result as a valid JSON object with the following structure:
    {
      "brand": "Brand Name",
      "name": "Product Name",
      "ingredients": "List of ingredients...",
      "weight": "Net Weight",
      "quantity": 1
    }
    
    Do NOT return Markdown code blocks. Just return the raw JSON string.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        tools: [{googleSearch: {}}], // Enable Google Search Grounding
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");

    // Clean up response to ensure valid JSON (remove markdown code blocks if present)
    let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    }

    return JSON.parse(jsonStr) as ScanResult;

  } catch (error) {
    console.error("Error analyzing text with search:", error);
    throw error;
  }
};

export const chatWithCustomsAgent = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  destinationCountry: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: `You are a helpful customs expert assisting a traveler entering ${destinationCountry}. 
        Provide accurate info on food import regulations, prohibited items, allowances, and declaring goods for ${destinationCountry}.
        Be concise, friendly, and practical.`,
      },
    });

    const result = await chat.sendMessage({ message: message });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I am unable to process your request at the moment.";
  }
};