import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTradeSchema, insertJournalEntrySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Trade routes
  app.get("/api/trades", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user.id;
      const trades = await storage.getTrades(userId);
      res.json(trades);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.get("/api/trades/range", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const trades = await storage.getTradesByDateRange(
        userId, 
        new Date(startDate as string), 
        new Date(endDate as string)
      );
      
      res.json(trades);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.get("/api/trades/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tradeId = parseInt(req.params.id);
      const trade = await storage.getTrade(tradeId);
      
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      if (trade.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this trade" });
      }
      
      res.json(trade);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch trade" });
    }
  });

  app.post("/api/trades", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user.id;
      const tradeData = { ...req.body, userId };
      
      const validatedData = insertTradeSchema.parse(tradeData);
      const trade = await storage.createTrade(validatedData);
      
      res.status(201).json(trade);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create trade" });
    }
  });

  app.put("/api/trades/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tradeId = parseInt(req.params.id);
      const existingTrade = await storage.getTrade(tradeId);
      
      if (!existingTrade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      if (existingTrade.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this trade" });
      }
      
      const updatedTrade = await storage.updateTrade(tradeId, req.body);
      res.json(updatedTrade);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to update trade" });
    }
  });

  app.delete("/api/trades/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tradeId = parseInt(req.params.id);
      const existingTrade = await storage.getTrade(tradeId);
      
      if (!existingTrade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      if (existingTrade.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this trade" });
      }
      
      await storage.deleteTrade(tradeId);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete trade" });
    }
  });

  // Journal routes
  app.get("/api/journal", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user.id;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      if (entry.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this journal entry" });
      }
      
      res.json(entry);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user.id;
      const entryData = { ...req.body, userId };
      
      const validatedData = insertJournalEntrySchema.parse(entryData);
      const entry = await storage.createJournalEntry(validatedData);
      
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.put("/api/journal/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const entryId = parseInt(req.params.id);
      const existingEntry = await storage.getJournalEntry(entryId);
      
      if (!existingEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      if (existingEntry.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this journal entry" });
      }
      
      const updatedEntry = await storage.updateJournalEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const entryId = parseInt(req.params.id);
      const existingEntry = await storage.getJournalEntry(entryId);
      
      if (!existingEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      if (existingEntry.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this journal entry" });
      }
      
      await storage.deleteJournalEntry(entryId);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Metrics/Analytics routes
  app.get("/api/metrics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user.id;
      let startDate, endDate;
      
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate as string);
        endDate = new Date(req.query.endDate as string);
      }
      
      const metrics = await storage.getTradingMetrics(userId, startDate, endDate);
      res.json(metrics);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch trading metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
