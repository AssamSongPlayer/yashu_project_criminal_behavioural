import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });
}

export async function generateAnalysis(prompt: string): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}
