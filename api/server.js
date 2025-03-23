// Serverless handler for Vercel deployment
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);
const app = express();
const scryptAsync = promisify(scrypt);

// In-memory storage for serverless environment
const users = new Map();
const trades = new Map();
const journalEntries = new Map();

// Password handling functions
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware setup
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = [...users.values()].find(u => u.username === username);
  if (!user || !(await comparePasswords(password, user.password))) {
    return done(null, false);
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.get(id);
  done(null, user);
});

// API Routes
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth routes
app.post('/api/register', async (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;
  
  // Check if username exists
  if ([...users.values()].some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const id = users.size + 1;
  const user = {
    id,
    username,
    password: await hashPassword(password),
    email,
    firstName,
    lastName,
    createdAt: new Date()
  };
  
  users.set(id, user);
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  req.login(userWithoutPassword, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(201).json(userWithoutPassword);
  });
});

app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    req.login(user, (err) => {
      if (err) return next(err);
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    });
  })(req, res, next);
});

app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Trades routes
app.get('/api/trades', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userTrades = [...trades.values()].filter(t => t.userId === req.user.id);
  res.json(userTrades);
});

app.post('/api/trades', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const id = trades.size + 1;
  const trade = {
    id,
    userId: req.user.id,
    ...req.body,
    createdAt: new Date()
  };
  
  trades.set(id, trade);
  res.status(201).json(trade);
});

app.get('/api/trades/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const id = parseInt(req.params.id);
  const trade = trades.get(id);
  
  if (!trade || trade.userId !== req.user.id) {
    return res.status(404).json({ error: 'Trade not found' });
  }
  
  res.json(trade);
});

app.patch('/api/trades/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const id = parseInt(req.params.id);
  const trade = trades.get(id);
  
  if (!trade || trade.userId !== req.user.id) {
    return res.status(404).json({ error: 'Trade not found' });
  }
  
  const updatedTrade = {
    ...trade,
    ...req.body,
    id,
    userId: req.user.id
  };
  
  trades.set(id, updatedTrade);
  res.json(updatedTrade);
});

app.delete('/api/trades/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const id = parseInt(req.params.id);
  const trade = trades.get(id);
  
  if (!trade || trade.userId !== req.user.id) {
    return res.status(404).json({ error: 'Trade not found' });
  }
  
  trades.delete(id);
  res.status(204).end();
});

// Journal entries routes
app.get('/api/journal', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userEntries = [...journalEntries.values()].filter(e => e.userId === req.user.id);
  res.json(userEntries);
});

app.post('/api/journal', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const id = journalEntries.size + 1;
  const entry = {
    id,
    userId: req.user.id,
    ...req.body,
    createdAt: new Date()
  };
  
  journalEntries.set(id, entry);
  res.status(201).json(entry);
});

app.get('/api/journal/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const id = parseInt(req.params.id);
  const entry = journalEntries.get(id);
  
  if (!entry || entry.userId !== req.user.id) {
    return res.status(404).json({ error: 'Journal entry not found' });
  }
  
  res.json(entry);
});

app.patch('/api/journal/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const id = parseInt(req.params.id);
  const entry = journalEntries.get(id);
  
  if (!entry || entry.userId !== req.user.id) {
    return res.status(404).json({ error: 'Journal entry not found' });
  }
  
  const updatedEntry = {
    ...entry,
    ...req.body,
    id,
    userId: req.user.id
  };
  
  journalEntries.set(id, updatedEntry);
  res.json(updatedEntry);
});

app.delete('/api/journal/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const id = parseInt(req.params.id);
  const entry = journalEntries.get(id);
  
  if (!entry || entry.userId !== req.user.id) {
    return res.status(404).json({ error: 'Journal entry not found' });
  }
  
  journalEntries.delete(id);
  res.status(204).end();
});

// Metrics routes
app.get('/api/metrics', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userTrades = [...trades.values()].filter(t => t.userId === req.user.id);
  
  // Calculate basic metrics
  const totalTrades = userTrades.length;
  const winningTrades = userTrades.filter(t => t.profitLoss > 0);
  const losingTrades = userTrades.filter(t => t.profitLoss < 0);
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  
  const totalProfitLoss = userTrades.reduce((sum, t) => sum + t.profitLoss, 0);
  const avgTradeProfit = totalTrades > 0 ? totalProfitLoss / totalTrades : 0;
  
  const totalProfit = winningTrades.reduce((sum, t) => sum + t.profitLoss, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss, 0));
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
  
  const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profitLoss)) : 0;
  const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profitLoss)) : 0;
  
  // Calculate profit by instrument
  const profitByInstrument = userTrades.reduce((acc, t) => {
    const instrument = t.instrument || 'Unknown';
    acc[instrument] = (acc[instrument] || 0) + t.profitLoss;
    return acc;
  }, {});
  
  // Calculate profit by session
  const profitBySession = userTrades.reduce((acc, t) => {
    const session = t.session || 'Unknown';
    acc[session] = (acc[session] || 0) + t.profitLoss;
    return acc;
  }, {});
  
  res.json({
    totalTrades,
    winRate,
    totalProfitLoss,
    avgTradeProfit,
    profitFactor,
    largestWin,
    largestLoss,
    profitByInstrument,
    profitBySession
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// This is only for local development, Vercel will use the default export
if (typeof require !== 'undefined' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Create a demo user for testing
(async () => {
  if (users.size === 0) {
    const id = 1;
    const user = {
      id,
      username: 'demo',
      password: await hashPassword('demo123'),
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      createdAt: new Date()
    };
    users.set(id, user);
    console.log('Demo user created: username=demo, password=demo123');
    
    // Add some sample trades
    const sampleTrades = [
      {
        id: 1,
        userId: 1,
        date: new Date('2025-03-20'),
        instrument: 'AAPL',
        direction: 'long',
        entryPrice: 190.25,
        exitPrice: 193.45,
        quantity: 100,
        profitLoss: 320,
        session: 'morning',
        strategy: 'breakout',
        notes: 'Strong momentum after earnings',
        createdAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        date: new Date('2025-03-21'),
        instrument: 'MSFT',
        direction: 'short',
        entryPrice: 420.75,
        exitPrice: 417.25,
        quantity: 50,
        profitLoss: 175,
        session: 'afternoon',
        strategy: 'reversal',
        notes: 'Overbought on 5min chart',
        createdAt: new Date()
      },
      {
        id: 3,
        userId: 1,
        date: new Date('2025-03-22'),
        instrument: 'TSLA',
        direction: 'long',
        entryPrice: 275.50,
        exitPrice: 272.30,
        quantity: 20,
        profitLoss: -64,
        session: 'morning',
        strategy: 'breakout',
        notes: 'Failed breakout, stopped out',
        createdAt: new Date()
      }
    ];
    
    sampleTrades.forEach(trade => {
      trades.set(trade.id, trade);
    });
    
    // Add sample journal entries
    const sampleEntries = [
      {
        id: 1,
        userId: 1,
        date: new Date('2025-03-20'),
        title: 'Strong trading day',
        content: 'Market showed clear direction today. My breakout strategy worked well with tech stocks. Need to focus more on position sizing.',
        mood: 'positive',
        createdAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        date: new Date('2025-03-22'),
        title: 'Lessons from today',
        content: 'Overtraded in the morning session. Need to be more patient and wait for proper setups. Tesla trade was entered too early without confirmation.',
        mood: 'neutral',
        createdAt: new Date()
      }
    ];
    
    sampleEntries.forEach(entry => {
      journalEntries.set(entry.id, entry);
    });
    
    console.log('Sample data created for demo user');
  }
})();

export default app;