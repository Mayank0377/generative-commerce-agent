import { SchemaType } from '@google/generative-ai';

export const tools = [
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
