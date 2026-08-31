# 🤖 QuickShop – AI Commerce by Razorpay

An intelligent, conversational AI shopping assistant powered by **Google Gemini** and **Razorpay**. 
QuickShop transforms the traditional e-commerce catalog browsing experience into a seamless, interactive chat interface where users can search, compare, visually identify, and instantly purchase products.

---

## ✨ Features

- **Conversational Search:** Ask for products naturally (e.g., *"Find me a good microphone under ₹5000"*).
- **📸 Visual Search (Multimodal):** Upload a picture of a product, and the AI will identify it and find matching items in the catalog using Gemini's Vision capabilities.
- **🔄 Smart Product Comparison:** Ask the AI to compare two products, and it will generate a clean, glassmorphic comparison table.
- **🛒 Intelligent Cart Management:** Add or remove items from your cart using natural language.
- **💳 Instant Razorpay Checkout:** AI securely generates a Razorpay payment link dynamically when you are ready to check out, directly in the chat.
- **📦 Conversational Order Tracking:** Just ask the AI *"Where is my order?"* to instantly get your live order status.
- **🔐 Seamless Auth:** Google Sign-in integration for secure, personalized sessions.

---

## 🏗️ Architecture & Scalability (How it works at scale)

Currently, for demonstration purposes, the application uses an in-memory `catalog.js` and `orders.js` state. However, the system is designed to scale seamlessly for large-scale enterprise deployments:

### 1. Real-Time Inventory & Catalog Management
At scale, the static catalog is replaced by a production database (e.g., **PostgreSQL** or **MongoDB**) or an e-commerce platform API (e.g., **Shopify**, **MedusaJS**). 
- When the user asks for a product, the Node.js backend executes a tool that dynamically queries the database for live inventory status.
- When an order is successfully paid via Razorpay, a webhook updates the database in real-time, instantly decrementing stock and updating the order status.

### 2. Future Scope & Roadmap
- **Persistent Chat Sessions:** Implement database-backed chat histories so users can resume past shopping conversations seamlessly across different devices.
- **Merchant Dashboard:** A dedicated Admin Portal connected to the central database, allowing merchants to visually add products, update prices, and track Razorpay settlements. The AI queries this database dynamically, so changes are instantly reflected in chat without retraining.

### 3. Tech Stack
- **Frontend:** React, Tailwind CSS (Glassmorphic UI)
- **Backend:** Node.js, Express
- **AI Core:** Google Gemini API (Function Calling & Vision)
- **Payments:** Razorpay API (Payment Links & Webhooks)
- **Auth:** Google OAuth2

---

## 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mayank0377/generative-commerce-agent.git
   cd generative-commerce-agent
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file with GEMINI_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Experience the magic:**
   Open `http://localhost:5174` in your browser.

---
*Built for the Razorpay AI Buildathon 2026*
