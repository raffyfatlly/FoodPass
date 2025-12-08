import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScanResult, DeclaredItem } from "../types";

// Helper to securely retrieve API key from various environment configurations
const getApiKey = (): string => {
  // Priority 1: Vite Environment Variables (Vercel/Netlify standard)
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // import.meta.env might not be defined or available
  }
  
  // Priority 2: Process Environment Variables (Node/Webpack/Legacy)
  try {
    // Accessing 'process' directly can crash Vite/Browser if not polyfilled, so we wrap in try/catch
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  
  // Fallback or empty (will cause API error if not set)
  return "";
};

const itemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    brand: {
      type: Type.STRING,
      description: "The brand name of the food product.",
    },
    name: {
      type: Type.STRING,
      description: "The specific product name.",
    },
    ingredients: {
      type: Type.STRING,
      description: "A comprehensive list of ingredients. If exact text isn't visible, infer standard ingredients for this product.",
    },
    weight: {
      type: Type.STRING,
      description: "The net weight or volume indicated on the package (e.g., '250g', '500ml', '1kg'). If not visible, estimate reasonable weight.",
    },
    quantity: {
      type: Type.INTEGER,
      description: "The number of items (default to 1).",
    },
  },
  required: ["brand", "name", "ingredients", "weight", "quantity"],
};

export const analyzeImage = async (base64Image: string): Promise<ScanResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `Analyze this food item.
    1. Identify the Brand and Product Name.
    2. Extract the NET WEIGHT or VOLUME from the package.
    3. List the INGREDIENTS found on the package or standard for this product.
    
    Return pure JSON.`;

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
        responseMimeType: "application/json",
        responseSchema: itemSchema,
        temperature: 0.1,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ScanResult;
    } else {
      throw new Error("No data returned from Gemini");
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const analyzeText = async (query: string): Promise<ScanResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `User is listing a food item: "${query}".
    1. Identify the Brand and likely Product Name.
    2. Estimate standard NET WEIGHT for this type of product.
    3. List standard INGREDIENTS for this specific food product.
    
    Return pure JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: itemSchema,
        temperature: 0.3,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ScanResult;
    } else {
      throw new Error("No data returned from Gemini");
    }
  } catch (error) {
    console.error("Error analyzing text:", error);
    throw error;
  }
};

export const chatWithCustomsAgent = async (history: any[], message: string, destinationCountry: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are a helpful customs expert assistant. The user is travelling to ${destinationCountry}.
        Answer their questions about bringing food items, restricted items, declarations, and customs regulations for ${destinationCountry}.
        Be concise, accurate, and helpful. If you are unsure about specific regulations, advise them to check official sources.`,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: message });
    
    return result.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};
