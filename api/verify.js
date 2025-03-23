// Health check endpoint for Vercel to verify API deployment
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    message: 'AlphaJournal API is up and running',
    timestamp: new Date()
  });
}