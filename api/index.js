// Main API entry point handler for Vercel serverless
// This is used for the base path (/api) in Vercel

export const config = {
  api: {
    bodyParser: true
  }
};

export default function handler(req, res) {
  // Log request information for debugging
  console.log(`API Request: ${req.method} ${req.url}`);
  
  // Redirect to healthcheck for the base API path
  if (req.url === '/api' || req.url === '/api/') {
    return res.status(200).json({
      status: 'ok',
      message: 'AlphaJournal API is running',
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      routes: [
        '/api/healthcheck',
        '/api/user',
        '/api/login',
        '/api/register',
        '/api/logout',
        '/api/trades',
        '/api/journal',
        '/api/metrics'
      ]
    });
  }
  
  // For all other routes, redirect to the specific serverless function that matches
  const path = req.url.replace(/^\/api/, '');
  const redirectUrl = `/api${path}`;
  
  res.setHeader('Cache-Control', 'no-cache, no-store');
  
  // Redirect to the appropriate handler
  res.status(307).setHeader('Location', redirectUrl).end();
}