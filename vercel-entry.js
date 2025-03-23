// This is a special file for Vercel deployment
// It simplifies the server entry point to avoid the external module error

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Log deployment info
console.log('Vercel deployment starting...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Create a very simple handler that just uses the API routes
export default function handler(req, res) {
  // Redirect to the API routes
  console.log('Request received:', req.url);
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>AlphaJournal</title>
        <meta http-equiv="refresh" content="0;url=/" />
      </head>
      <body>
        <p>Redirecting to application...</p>
      </body>
    </html>
  `);
}