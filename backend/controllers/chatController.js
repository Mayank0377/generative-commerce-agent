import model from '../config/gemini.js';
import toolHandlers from '../tools/handlers.js';

/**
 * Generates content with automatic retry on rate limit (429).
 */
async function generateWithRetry(request, maxRetries = 3) {
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

/**
 * Handles a chat message: sends to Gemini, executes any tool calls,
 * and returns the final AI response with updated history.
 */
export async function handleChatMessage(req, res) {
  try {
    const { message } = req.body;
    let history = req.body.history || [];

    // Add new user message to history
    history.push({ role: "user", parts: [{ text: message }] });

    let result = await generateWithRetry({ contents: history });
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
        if (toolHandlers[functionName]) {
          functionResult = await toolHandlers[functionName](args);
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
      result = await generateWithRetry({ contents: history });

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
    console.error("[Chat Controller] Error:", error);
    if (error.status === 429) {
      res.status(429).json({ error: "The AI is temporarily busy. Please wait 30 seconds and try again." });
    } else {
      res.status(500).json({ error: "An error occurred while processing your request." });
    }
  }
}
