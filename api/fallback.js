// This fallback handler ensures proper handling of other API routes in Vercel

export default function handler(req, res) {
  // If this fallback is called, the route probably doesn't exist
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.url
  });
}