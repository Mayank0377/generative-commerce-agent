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
      },
      {
        name: "addToCart",
        description: "Add a product to the user's shopping cart. Use when the user says 'add to cart', 'I'll take it', etc.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            productId: {
              type: SchemaType.STRING,
              description: "The ID of the product to add (e.g., 'p1', 'p2')."
            },
            quantity: {
              type: SchemaType.NUMBER,
              description: "Quantity to add. Defaults to 1."
            }
          },
          required: ["productId"]
        }
      },
      {
        name: "removeFromCart",
        description: "Remove a product from the user's shopping cart.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            productId: {
              type: SchemaType.STRING,
              description: "The ID of the product to remove."
            }
          },
          required: ["productId"]
        }
      },
      {
        name: "getCart",
        description: "View the user's current shopping cart with all items and total price.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {}
        }
      },
      {
        name: "generateCartCheckout",
        description: "Generate a single Razorpay payment link for ALL items in the user's cart. Use when the user says 'checkout', 'buy everything in my cart', etc.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {}
        }
      },
      {
        name: "compareProducts",
        description: "Compare two or more products side by side. Use when user asks to compare products.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            productIds: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Array of product IDs to compare (e.g., ['p1', 'p3'])."
            }
          },
          required: ["productIds"]
        }
      }
    ]
  }
];
