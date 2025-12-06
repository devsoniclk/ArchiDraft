import { GoogleGenAI } from "@google/genai";
import { DrawingStyle } from "../types";

const getSystemInstruction = (style: DrawingStyle): string => {
  return `You are an expert architectural drafter and artist. 
  Your task is to analyze the input image and regenerate it strictly as a ${style}.
  
  Specific Guidelines for ${style}:
  ${getStyleSpecifics(style)}
  
  General Rules:
  - Maintain the perspective and structural integrity of the original image.
  - Remove unnecessary noise, people, or temporary objects if they distract from the architecture.
  - Emphasize lines, angles, and structural elements.
  - The output MUST be a high-quality image file.
  `;
};

const getStyleSpecifics = (style: DrawingStyle): string => {
  switch (style) {
    case DrawingStyle.BLUEPRINT:
      return "Use a deep blue background (#003366) with crisp white lines. Add faint grid lines overlay. Include stylistic measurement markers.";
    case DrawingStyle.PENCIL_SKETCH:
      return "Black and white graphite style on textured white paper. Soft shading, varied line weights, artistic sketchy strokes.";
    case DrawingStyle.TECHNICAL_LINE:
      return "Stark black lines on pure white background. Uniform line weights, very clean, no shading, high contrast vector-like appearance.";
    case DrawingStyle.INK_WASH:
      return "Black ink on parchment or white paper. Use wash techniques for shadows. Expressive, fluid lines.";
    case DrawingStyle.WIREFRAME:
      return "Black background with glowing cyan or green lines. Computer-aided design (CAD) aesthetic, showing polygon structures.";
    default:
      return "High contrast architectural drawing.";
  }
};

const extractBase64FromResponse = (response: any): string => {
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("The AI model returned no candidates. The service might be overloaded.");
  }

  const candidate = response.candidates[0];

  // Check for safety blocking or other finish reasons
  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    if (candidate.finishReason === "SAFETY") {
      throw new Error("Generation blocked by safety filters. The image may contain content flagged as unsafe.");
    }
    if (candidate.finishReason === "RECITATION") {
      throw new Error("Generation blocked due to potential copyright or recitation content.");
    }
    // If we have no content but a non-stop reason, throw error
    if (!candidate.content?.parts?.length) {
       throw new Error(`Generation stopped unexpectedly. Reason: ${candidate.finishReason}`);
    }
  }

  const parts = candidate.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("The model generated a response, but it contained no image data.");
};

export const removeBackground = async (
  base64Data: string,
  mimeType: string,
  upscale: boolean = false,
  aspectRatio: string = "1:1"
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Use the same model logic as generation to ensure quality matching
  const modelId = upscale ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  const config: any = {};
  if (upscale) {
    config.imageConfig = { 
      imageSize: '2K',
      aspectRatio: aspectRatio
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Identify the main architectural subject or object in this image. Create a copy of the image with the background completely removed and replaced with solid white. Keep the subject exactly as it appears in the original.",
          },
        ],
      },
      config: config
    });

    return extractBase64FromResponse(response);
  } catch (error: any) {
    console.error("Background Removal Error:", error);
    // Re-throw with more context if it's a generic error, otherwise keep specific message
    if (error.message && (error.message.includes('SAFETY') || error.message.includes('blocked'))) {
      throw error;
    }
    throw new Error(`Background removal failed: ${error.message || 'Unknown error'}`);
  }
};

export const generateArchitecturalDrawing = async (
  base64Data: string,
  mimeType: string,
  style: DrawingStyle,
  upscale: boolean,
  aspectRatio: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Create a new instance to ensure latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use 'gemini-3-pro-image-preview' for high-quality upscaling/generation
  // Use 'gemini-2.5-flash-image' for standard fast generation
  const modelId = upscale ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image'; 

  const config: any = {
    systemInstruction: getSystemInstruction(style),
  };

  if (upscale) {
    config.imageConfig = {
      imageSize: '2K',
      aspectRatio: aspectRatio
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Create a ${style} architectural drawing based on this image. Return ONLY the generated image.`,
          },
        ],
      },
      config: config
    });

    return extractBase64FromResponse(response);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message && (error.message.includes('SAFETY') || error.message.includes('blocked'))) {
        throw error;
    }
    throw new Error(`Generation failed: ${error.message || 'Unknown error'}`);
  }
};

export const analyzeImage = async (
  base64Data: string,
  mimeType: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using gemini-3-pro-preview for advanced image understanding and reasoning
  const modelId = 'gemini-3-pro-preview';

  const prompt = `
    Analyze this architectural image in detail. Act as a senior architectural historian and critic.
    Provide a structured analysis covering:
    1. **Architectural Style**: Identify the primary style (e.g., Brutalist, Gothic, Modernist) and any influences.
    2. **Key Design Features**: List 3-5 distinctive elements (e.g., flying buttresses, floor-to-ceiling glass, ornamentation).
    3. **Materials**: Identify or infer the visible materials (e.g., reinforced concrete, sandstone, steel).
    4. **Vibe & Atmosphere**: Describe the emotional impact or intended atmosphere of the structure.
    
    Keep the tone professional, insightful, and concise. Format the output with clear headers or bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates?.[0]?.finishReason === "SAFETY") {
        throw new Error("Analysis blocked by safety filters. The image contains sensitive content.");
    }

    return response.text || "Analysis completed, but no text was returned.";
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};