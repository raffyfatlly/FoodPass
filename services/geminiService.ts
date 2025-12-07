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

export const analyzeImage = async (base64Image: string, destinationCountry: string): Promise<ScanResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    // We pass the destination country just for context if it helps identification
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

export const analyzeText = async (query: string, destinationCountry: string): Promise<ScanResult> => {
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

export const getCustomsAdvice = async (items: DeclaredItem[], country: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const itemList = items.map(i => `${i.quantity}x ${i.name} (${i.ingredients})`).join(", ");
    
    const prompt = `You are a friendly customs assistant for travelers going to ${country}. 
    Review this list of food items: "${itemList}".
    
    Provide ONE single, short, helpful sentence advising the user about specific rules for these items in ${country}. 
    Do not be alarmist. If everything looks generally fine, just remind them to "Declare all food items to officers".
    Max 25 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || `Remember to declare all food items upon arrival in ${country}.`;
  } catch (error) {
    console.error("Error getting advice:", error);
    return `Ensure you declare all food items to customs in ${country}.`;
  }
};

export const chatWithCustomsAgent = async (history: {role: string, parts: {text: string}[]}[], message: string, country: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const systemPrompt = `TASK: You are a strict Customs Officer Assistant for ${country}.
    
    CRITICAL BEHAVIOR RULES:
    1. NO GREETINGS. Do not use words like "Hello", "Hi", "Welcome", "Greetings".
    2. Go STRAIGHT to the answer.
    3. If the user asks "Can I bring X?", answer "Yes/No" or "It depends" immediately, then explain.
    
    CONTENT RULES:
    1. Focus specifically on ${country}'s bio-security and customs rules.
    2. ABSOLUTELY NO MARKDOWN. Write in plain text only.
    3. Keep answers concise (max 3 sentences) unless detailed explanation is needed.`;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting to the customs database right now. Please try again.";
  }
};