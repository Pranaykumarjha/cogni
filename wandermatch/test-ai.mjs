import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Hello, reply with JSON [{\"msg\":\"ok\"}]",
    });
    console.log("SUCCESS:", response.text);
  } catch (error) {
    console.error("ERROR:", error);
  }
}
run();
