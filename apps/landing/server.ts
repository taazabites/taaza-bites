import express from "express";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import { rateLimit } from "express-rate-limit";
import {
  generateMealPlan,
  generateCorporateWellnessProjection,
  findMealFromImage,
  generateMacroInsights,
  translateBlogPost,
  generateAiSearchResultsStream,
} from "./src/services/geminiService";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Security & Performance Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests, please try again later." },
  });
  app.use("/api/", limiter);

  // --- API ROUTES ---

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Health assessment submission
  app.post("/api/health-assessment", (req, res) => {
    console.log("Health assessment received:", req.body);
    res.json({ success: true, message: "Assessment received successfully" });
  });

  // FAQ AI query endpoint
  app.post("/api/faq-ai", async (req, res) => {
    try {
      const { query } = req.body;
      const referer = req.headers.referer || req.headers.origin;
      const stream = await generateAiSearchResultsStream(
        query || "Taazabites healthy meals",
        referer
      );

      let answer = "";
      for await (const chunk of stream) {
        answer += chunk.text || "";
      }

      res.json({
        answer:
          answer ||
          "Thank you for reaching out to Taaza Bites! How else can we assist you with your diet and macros?",
      });
    } catch (err) {
      console.error("Error in /api/faq-ai:", err);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Dish discovery multimodal endpoint
  app.post("/api/dish-discovery", async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      const referer = req.headers.referer || req.headers.origin;
      if (!base64Data || !mimeType) {
        return res.status(400).json({ error: "Missing image data or mimeType" });
      }
      const result = await findMealFromImage(base64Data, mimeType, referer);
      res.json(result);
    } catch (err) {
      console.error("Error in /api/dish-discovery:", err);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  // Corporate wellness projection endpoint
  app.post("/api/corporate-wellness", async (req, res) => {
    try {
      const { employees, mealsPerWeek, healthScore } = req.body;
      const referer = req.headers.referer || req.headers.origin;
      const result = await generateCorporateWellnessProjection(
        Number(employees) || 20,
        Number(mealsPerWeek) || 5,
        Number(healthScore) || 7,
        referer
      );
      res.json(result);
    } catch (err) {
      console.error("Error in /api/corporate-wellness:", err);
      res.status(500).json({ error: "Failed to generate projection" });
    }
  });

  // Macro insights endpoint
  app.post("/api/macro-calculator-insights", async (req, res) => {
    try {
      const {
        age,
        gender,
        height,
        weight,
        activityLevel,
        goal,
        dietPreference,
        calories,
        protein,
        carbs,
        fats,
      } = req.body;
      const referer = req.headers.referer || req.headers.origin;
      const result = await generateMacroInsights(
        Number(age) || 25,
        gender || "Male",
        Number(height) || 175,
        Number(weight) || 70,
        activityLevel || "Moderately Active",
        goal || "Weight Maintenance",
        dietPreference || "Non-Veg",
        Number(calories) || 2000,
        Number(protein) || 120,
        Number(carbs) || 200,
        Number(fats) || 60,
        referer
      );
      res.json(result);
    } catch (err) {
      console.error("Error in /api/macro-calculator-insights:", err);
      res.status(500).json({ error: "Failed to generate macro insights" });
    }
  });

  // Meal plan generator endpoint
  app.post("/api/meal-plan", async (req, res) => {
    try {
      const { diet, goal, dislikes, info } = req.body;
      const referer = req.headers.referer || req.headers.origin;
      const result = await generateMealPlan(
        Array.isArray(diet) ? diet : [diet || "Pure Veg"],
        goal || "Weight Loss",
        dislikes || "None",
        info || "Healthy lifestyle",
        referer
      );
      res.json(result);
    } catch (err) {
      console.error("Error in /api/meal-plan:", err);
      res.status(500).json({ error: "Failed to generate meal plan" });
    }
  });

  // Blog translation endpoint
  app.post("/api/blog/translate", async (req, res) => {
    try {
      const { postId, title, excerpt, content, targetLanguage } = req.body;
      const referer = req.headers.referer || req.headers.origin;
      const result = await translateBlogPost(
        postId || "",
        title || "",
        excerpt || "",
        content || "",
        targetLanguage || "Hindi",
        referer
      );
      res.json(result);
    } catch (err) {
      console.error("Error in /api/blog/translate:", err);
      res.status(500).json({ error: "Failed to translate blog post" });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        maxAge: "1d",
        setHeaders: (res, filePath) => {
          if (filePath.includes("/assets/")) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else if (
            filePath.endsWith(".png") ||
            filePath.endsWith(".jpg") ||
            filePath.endsWith(".jpeg") ||
            filePath.endsWith(".svg") ||
            filePath.endsWith(".ico") ||
            filePath.endsWith(".webp")
          ) {
            res.setHeader("Cache-Control", "public, max-age=604800");
          } else if (filePath.endsWith(".json") || filePath.endsWith(".xml")) {
            res.setHeader("Cache-Control", "public, max-age=3600");
          }
        },
      })
    );
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
