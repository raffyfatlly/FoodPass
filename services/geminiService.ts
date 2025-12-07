import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScanResult, DeclaredItem } from "../types";

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemPrompt = `You are an expert Customs Officer Assistant specializing in food regulations for travelers entering ${country}.
    Your goal is to help the user understand what food they can bring, what needs declaring, and what is banned.
    
    STRICT RULES:
    1. Be concise, friendly, and professional.
    2. Focus specifically on ${country}'s bio-security and customs rules.
    3. ABSOLUTELY NO MARKDOWN. Do not use asterisks (**bold**), underscores (_italic_), or hash signs (#). Write in plain text only.
    4. Use standard capitalization and punctuation.
    5. Keep answers short (under 3 sentences) unless asked for specific details.
    6. Do NOT start every sentence with "Hello" or greetings. Answer the question directly and naturally.`;

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