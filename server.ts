/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI Client to avoid startup crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiClient;
}

// --- API Endpoints ---

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    firebaseConfigured: !!(process.env.VITE_FIREBASE_API_KEY)
  });
});

// 2. AI Recommendation Platform Engine (using gemini-3.5-flash)
app.post("/api/gemini/recommend", async (req, res) => {
  const { videos, watchHistory, favorites, userPreferences } = req.body;

  const gemini = getGeminiClient();
  if (!gemini) {
    // Elegant fallback prompt simulation when no API key is specified
    console.warn("GEMINI_API_KEY not configured. Sending simulated content.");
    
    // Simulate smart curation lists based on inputs
    const responseData = {
      curatedHeadline: "SIMULATED AI Nexus Curations: Dynamic Selections for You",
      explanation: "Gemini recommends sci-fi and animation categories based on your history of viewing Big Buck Bunny and Sintel.",
      recoIds: videos && videos.length > 0 
        ? [videos[1]?.id || "sintel", videos[0]?.id || "big_buck_bunny"].filter(Boolean)
        : ["sintel", "big_buck_bunny"],
      personalizedTip: "Tip: Premium accounts stream ad-free at high speed! Upgrade to StreamNexus Premium today."
    };
    return res.json(responseData);
  }

  try {
    const prompt = `
      You are the ultimate personalized recomendation AI for StreamNexus (a premium YouTube + Netflix video platform).
      You are given a list of videos currently on our platform:
      ${JSON.stringify(videos?.map((v: any) => ({ id: v.id, title: v.title, category: v.category, description: v.description })))}

      The user's watch history consists of:
      ${JSON.stringify(watchHistory)}

      The user's favorites list consists of:
      ${JSON.stringify(favorites)}

      User's role / state: ${JSON.stringify(userPreferences || {})}

      Analyze the user's behavior. Determine:
      1. A custom curated headline tailored to their taste (e.g. 'Epic CGI Quests' if they love fantasy or animations).
      2. A 2-sentence explanation of why they will love these.
      3. A ranked list of recommened video IDs (from the input catalog) that they are most likely to watch next.
      4. A 'personalizedTip' - a helpful streaming tip (e.g., 'Check out the Sintel credits for 4K streaming!').

      Respond STRICTLY in JSON format with exactly these fields:
      {
        "curatedHeadline": "string",
        "explanation": "string",
        "recoIds": ["id1", "id2"],
        "personalizedTip": "string"
      }
    `;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini model execution error:", error);
    res.status(500).json({ 
      error: "Failed to generate AI recommendations", 
      details: error?.message || error,
      fallbackRecoIds: ["sintel", "tears_of_steel"]
    });
  }
});

// 3. Simulated Monetization & Stripe Payment Processors
app.post("/api/monetization/checkout", (req, res) => {
  const { planId, amount, paymentMethod } = req.body;
  
  // Simulate Stripe / PayPal secure checkout gateway
  const simulatedTransactionId = `txn_${Math.random().toString(36).substring(2, 11)}`;
  res.json({
    success: true,
    transactionId: simulatedTransactionId,
    gateway: paymentMethod,
    amount,
    currency: "USD",
    planId,
    timestamp: new Date().toISOString()
  });
});

// --- Vite Middleware Server Setup ---
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with HMR disabled...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StreamNexus Fullstack running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Express startup failure:", err);
});
