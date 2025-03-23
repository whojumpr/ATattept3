// Custom build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running custom Vercel build script...');

try {
  // Build the frontend
  console.log('Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit' });

  // Instead of building server/index.ts which has external dependency issues,
  // we'll use our serverless API files directly
  console.log('Skipping server build due to external dependency issues in Vercel...');
  console.log('Using serverless API routes instead');
  
  // Create a placeholder dist/index.js file to satisfy the build process
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  fs.writeFileSync('dist/index.js', `
    // This is a placeholder file for Vercel deployment
    // The actual server functionality is handled by the API routes
    console.log('AlphaJournal API server - Vercel deployment');
    export default {};
  `);
  
  console.log('Build completed successfully!');
  console.log('IMPORTANT: Remember to set SESSION_SECRET environment variable in Vercel.');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}