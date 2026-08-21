import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Load Catalog
const catalogPath = path.join(__dirname, 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Define the Tools (Function Calling) for Gemini
const tools = [
  {
    functionDeclarations: [
      {
        name: "searchCatalog",
        description: "Search the product catalog for items to recommend to the user. Returns a list of products.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description: "The search query (e.g., 'microphone', 'chair'). Leave empty to get all items."
            }
          }
        }
      },
      {
        name: "generatePaymentLink",
        description: "Generate a Razorpay checkout payment link for a specific product when the user is ready to buy.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            productId: {
              type: SchemaType.STRING,
              description: "The ID of the product to buy (e.g., 'p1', 'p2')."
            }
          },
          required: ["productId"]
        }
      }
    ]
  }
];

// Initialize the model with tools and a system instruction
const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
  tools: tools,
  systemInstruction: "You are a helpful, professional AI Shopping Assistant for a tech and furniture store. You can search the catalog for products and generate checkout links when the user is ready to buy. Always be polite, concise, and helpful. If a user asks to buy something, generate a payment link for them. Never offer discounts. If the payment link generation fails, handle it gracefully by apologizing."
});

// Implement the actual local functions that the AI will call
const functions = {
  searchCatalog: ({ query }) => {
    if (!query) return { products: catalog };
    const q = query.toLowerCase();
    const products = catalog.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
    return { products };
  },
  
  generatePaymentLink: async ({ productId }) => {
    const product = catalog.find(p => p.id === productId);
    if (!product) return { error: "Product not found in catalog." };
    if (!product.inStock) return { error: "Product is out of stock." };

    try {
      // Create a Razorpay Payment Link
      const paymentLinkReq = {
        amount: product.price * 100, // Amount in paise
        currency: "INR",
        accept_partial: false,
        description: `Purchase of ${product.name}`,
        customer: {
          name: "Valued Customer",
          email: "customer@example.com",
          contact: "+919876543210" // Valid mock contact for test mode
        },
        notify: { sms: false, email: false },
        reminder_enable: false,
        notes: { productId: product.id }
      };

      const link = await razorpay.paymentLink.create(paymentLinkReq);
      return { 
        success: true, 
        paymentLink: link.short_url, 
        message: `Successfully generated payment link for ${product.name}. Please provide this exact link to the user.` 
      };
    } catch (error) {
      console.error("Razorpay Error:", error);
      return { error: "Failed to generate payment link due to a payment gateway error. Apologize to the user." };
    }
  }
};

// Helper: generate content with automatic retry on rate limit (429)
async function generateWithRetry(model, request, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(request);
    } catch (err) {
      if (err.status === 429 && attempt < maxRetries) {
        const waitMs = 15000;
        console.log(`[Rate Limit] Waiting ${waitMs / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        throw err;
      }
    }
  }
}

// API Endpoint for the chat interface
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    let history = req.body.history || [];
    
    // Add new user message to history
    history.push({ role: "user", parts: [{ text: message }] });

    let result = await generateWithRetry(model, { contents: history });
    let response = result.response;
    
    // Check if the AI wants to call a function (tool)
    let functionCalls = response.functionCalls();
    
    // The AI might call multiple tools in a row, so we loop
    while (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const functionName = call.name;
      const args = call.args;
      
      console.log(`[Agent] Executing tool: ${functionName}`, args);
      
      let functionResult;
      try {
        if (functions[functionName]) {
          functionResult = await functions[functionName](args);
        } else {
          functionResult = { error: `Function ${functionName} not found.` };
        }
      } catch (err) {
        functionResult = { error: err.message };
      }
      
      // Add the model's function call to history exactly as returned (preserves thought_signature)
      history.push({ role: "model", parts: response.candidates[0].content.parts });
      
      // Add the function response
      history.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: functionName,
            response: functionResult
          }
        }]
      });
      
      // Send the function's result back to the AI so it can continue thinking
      result = await generateWithRetry(model, { contents: history });
      
      response = result.response;
      functionCalls = response.functionCalls();
    }

    // Append final model text response to history
    if (response.candidates && response.candidates[0].content) {
      history.push({ role: "model", parts: response.candidates[0].content.parts });
    }

    // Return the final text response and the updated chat history
    res.json({
      text: response.text(),
      history: history
    });
      


  } catch (error) {
    console.error("Chat Error:", error);
    if (error.status === 429) {
      res.status(429).json({ error: "The AI is temporarily busy. Please wait 30 seconds and try again." });
    } else {
      res.status(500).json({ error: "An error occurred while processing your request." });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
