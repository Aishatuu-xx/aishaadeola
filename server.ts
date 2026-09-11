import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for orders in current session
  const activeOrders: any[] = [];

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "Shatu's Cozy Cup Online API" });
  });

  // Order submission
  app.post("/api/order", (req, res) => {
    const orderData = req.body;
    activeOrders.push({
      ...orderData,
      receivedAt: new Date().toISOString(),
      status: "preparing",
    });
    res.json({ success: true, orderId: orderData.orderId || `SC-${Date.now()}` });
  });

  // Customer Care Chat powered by Gemini 3.8 Flash
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getGeminiClient();

      if (!ai) {
        // Fallback response if GEMINI_API_KEY is not configured
        return res.json({
          reply: `Welcome to Shatu's Cozy Cup ☕✨! Regarding "${message}": We are an artisan online coffee & boba studio with express doorstep delivery! Our baristas recommend trying our Velvet Golden Cappuccino with Belgian cocoa dusting or our Tiger Brown Sugar Boba with chewy tapioca. You can explore both in 3D right on this page and place an online order for doorstep delivery in insulated thermal packaging.`,
          suggestions: [
            "Order a drink",
            "Explore 3D drink studio",
            "Spill-proof delivery info",
          ],
        });
      }

      const systemInstruction = `You are the welcoming, thoughtful head barista and customer care concierge at "Shatu's Cozy Cup ☕✨".
CRITICAL NOTE: We are an ONLINE-ONLY artisan coffee and boba studio with fast doorstep delivery. We do NOT have a physical walk-in store, and we do NOT offer table reservations or dine-in. Customers can order online directly through this web app.
Our brand aesthetic palette: Dark Espresso (#2B1B16), Coffee Brown (#6F4E37), Cream (#F7F0E3), Caramel (#C28E5C), and White (#FFFFFF).
Prices are in Nigerian Naira (₦).
Your tone: Warm, comforting, polite, knowledgeable about coffee extraction, ceremonial matcha, and artisanal boba bubble tea.
Key Online Studio Facts:
- Currency: Nigerian Naira (₦). Examples: Velvet Cappuccino is ₦4,200, Vanilla Bean Latte is ₦4,500, Tiger Brown Sugar Boba is ₦4,800, Kyoto Ceremonial Matcha is ₦4,600, Espresso Doppio is ₦3,800.
- Specialties:
  1. Velvet Golden Cappuccino (₦4,200): Equal parts espresso, steamed milk, thick velvety microfoam, dusted with Belgian cocoa.
  2. Artisan Vanilla Bean Latte (₦4,500): Double espresso, Madagascar vanilla, silky milk with hand-poured rosetta/heart latte art.
  3. Single Origin Espresso Doppio (₦3,800): Ethiopian Yirgacheffe, rich golden crema.
  4. Kyoto Ceremonial Matcha Latte (₦4,600): 100% stone-ground first-harvest Uji matcha, whisked to order with bamboo chasen, organic oat milk.
  5. Tiger Brown Sugar Boba Tea (₦4,800): Slow-cooked warm brown sugar tapioca pearls, fresh creamy milk, Ceylon black tea, glazed brown sugar tiger streaks.
  6. Strawberry Cloud Matcha Boba (₦5,200): Real strawberry compote, milk, green tea float, popping boba.
  7. Cold Brew Sweet Cream (₦4,400): 20-hour slow drip over crystal ice with vanilla sweet cream float.
  8. Pastries: Almond frangipane croissants (₦3,200), Nordic cardamom buns (₦2,800).
- Interactive 3D Studio: Customers can view, rotate 360°, and deconstruct layers of Cappuccino, Latte, Espresso, Matcha, and Boba tea in 3D right on this screen!
- Customizations: Choice of milks (whole, oat, almond, coconut, soy, breve), sweetness (0% to 100%), ice level, toppings (extra boba, popping boba, salted cheese foam cap, espresso shot).
- Online Delivery & Packaging: Packed in double-walled insulated thermal pouches with airtight tamper-evident spill-proof seals. Delivered across the city within 25–35 minutes.
- Dispatch Hours: Mon-Fri 7 AM - 9:30 PM, Sat 8 AM - 10:30 PM, Sun 8 AM - 9 PM.
- Keep answers warm, friendly, concise, and helpful (2-4 sentences or pleasant bullet points when comparing drinks). Suggest 2-3 brief next steps.`;

      // Format conversation history for Gemini SDK
      const contents = [
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText =
        response.text ||
        "I'm delighted to assist you at Shatu's Cozy Cup! Would you like a drink recommendation or information on our doorstep delivery?";

      res.json({
        reply: replyText,
        suggestions: [
          "Explore in 3D",
          "Order a drink",
          "Delivery info",
        ],
      });
    } catch (err: any) {
      console.error("Gemini Chat Error:", err);
      res.json({
        reply:
          "Thank you for contacting Shatu's Cozy Cup customer care! ☕✨ Our baristas are ready to prepare your favorite coffee, matcha, or boba tea for express doorstep delivery. Explore our 3D Drink Studio or order online anytime!",
        suggestions: ["View 3D drinks", "Check menu", "Delivery info"],
      });
    }
  });

  // Vite middleware in dev mode / static in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`☕ Shatu's Cozy Cup Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
