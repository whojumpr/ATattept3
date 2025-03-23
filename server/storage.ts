import { users, type User, type InsertUser, trades, type Trade, type InsertTrade, journalEntries, type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trade methods
  getTrades(userId: number): Promise<Trade[]>;
  getTradesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Trade[]>;
  getTrade(id: number): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, trade: Partial<InsertTrade>): Promise<Trade | undefined>;
  deleteTrade(id: number): Promise<boolean>;
  
  // Journal methods
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;
  
  // Trade analytics
  getTradingMetrics(userId: number, startDate?: Date, endDate?: Date): Promise<TradingMetrics>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

export type TradingMetrics = {
  totalTrades: number;
  winRate: number;
  totalProfitLoss: number;
  avgTradeProfit: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  profitByInstrument: Record<string, number>;
  profitBySession: Record<string, number>;
};

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trades: Map<number, Trade>;
  private journalEntries: Map<number, JournalEntry>;
  private userIdCounter: number;
  private tradeIdCounter: number;
  private journalIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.trades = new Map();
    this.journalEntries = new Map();
    this.userIdCounter = 1;
    this.tradeIdCounter = 1;
    this.journalIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create a demo user for testing
    this.createUser({
      username: "demo",
      password: "6cdd1f504f9976cd550eb2e03de5d1d4c19340a9256dba002dc1f2a2d376b7da5c23c95ab9c3e6c8b3eef49ab2247bea1d0047de0c4baadc8174ae32a48e8367.0abd7b029c753fea324cf8897c6a29a0", // password: "demo"
      name: "Demo User",
      email: "demo@example.com"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  // Trade methods
  async getTrades(userId: number): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .filter(trade => trade.userId === userId)
      .sort((a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime());
  }

  async getTradesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .filter(trade => 
        trade.userId === userId && 
        new Date(trade.exitDate) >= startDate &&
        new Date(trade.exitDate) <= endDate
      )
      .sort((a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime());
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.tradeIdCounter++;
    const now = new Date();
    const trade: Trade = {
      ...insertTrade,
      id,
      createdAt: now
    };
    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(id: number, tradeUpdate: Partial<InsertTrade>): Promise<Trade | undefined> {
    const existingTrade = this.trades.get(id);
    if (!existingTrade) return undefined;

    const updatedTrade: Trade = {
      ...existingTrade,
      ...tradeUpdate,
    };
    this.trades.set(id, updatedTrade);
    return updatedTrade;
  }

  async deleteTrade(id: number): Promise<boolean> {
    return this.trades.delete(id);
  }

  // Journal methods
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalIdCounter++;
    const now = new Date();
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      createdAt: now
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async updateJournalEntry(id: number, entryUpdate: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existingEntry = this.journalEntries.get(id);
    if (!existingEntry) return undefined;

    const updatedEntry: JournalEntry = {
      ...existingEntry,
      ...entryUpdate,
    };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  // Trade analytics
  async getTradingMetrics(userId: number, startDate?: Date, endDate?: Date): Promise<TradingMetrics> {
    let userTrades = Array.from(this.trades.values()).filter(trade => trade.userId === userId);
    
    if (startDate && endDate) {
      userTrades = userTrades.filter(trade => 
        new Date(trade.exitDate) >= startDate && 
        new Date(trade.exitDate) <= endDate
      );
    }

    const totalTrades = userTrades.length;
    if (totalTrades === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalProfitLoss: 0,
        avgTradeProfit: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        profitByInstrument: {},
        profitBySession: {}
      };
    }

    const winningTrades = userTrades.filter(trade => trade.profitLoss > 0);
    const winRate = (winningTrades.length / totalTrades) * 100;
    
    const totalProfitLoss = userTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const avgTradeProfit = totalProfitLoss / totalTrades;
    
    const totalGain = userTrades
      .filter(trade => trade.profitLoss > 0)
      .reduce((sum, trade) => sum + trade.profitLoss, 0);
    
    const totalLoss = Math.abs(userTrades
      .filter(trade => trade.profitLoss < 0)
      .reduce((sum, trade) => sum + trade.profitLoss, 0));
    
    const profitFactor = totalLoss === 0 ? totalGain : totalGain / totalLoss;
    
    const sortedProfits = [...userTrades].sort((a, b) => b.profitLoss - a.profitLoss);
    const largestWin = sortedProfits.length > 0 && sortedProfits[0].profitLoss > 0 ? sortedProfits[0].profitLoss : 0;
    const largestLoss = sortedProfits.length > 0 && sortedProfits[sortedProfits.length - 1].profitLoss < 0 
      ? Math.abs(sortedProfits[sortedProfits.length - 1].profitLoss) 
      : 0;
    
    // Profit by instrument type
    const profitByInstrument: Record<string, number> = {};
    userTrades.forEach(trade => {
      const instrument = trade.instrumentType;
      profitByInstrument[instrument] = (profitByInstrument[instrument] || 0) + trade.profitLoss;
    });
    
    // Profit by session (morning, midday, afternoon, evening)
    const profitBySession: Record<string, number> = {
      morning: 0,
      midday: 0,
      afternoon: 0,
      evening: 0
    };
    
    userTrades.forEach(trade => {
      const hour = new Date(trade.entryDate).getHours();
      let session;
      if (hour >= 4 && hour < 10) session = 'morning';
      else if (hour >= 10 && hour < 14) session = 'midday';
      else if (hour >= 14 && hour < 18) session = 'afternoon';
      else session = 'evening';
      
      profitBySession[session] = (profitBySession[session] || 0) + trade.profitLoss;
    });
    
    return {
      totalTrades,
      winRate,
      totalProfitLoss,
      avgTradeProfit,
      profitFactor,
      largestWin,
      largestLoss,
      profitByInstrument,
      profitBySession
    };
  }
}

export const storage = new MemStorage();
