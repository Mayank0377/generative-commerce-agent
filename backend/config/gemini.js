import { GoogleGenerativeAI } from '@google/generative-ai';
import { tools } from '../tools/definitions.js';
import { SYSTEM_PROMPT } from './prompts.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
  tools,
  systemInstruction: SYSTEM_PROMPT,
});

export default model;
