// Custom build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Determine if we're running in Vercel environment
const isVercel = process.env.VERCEL === '1';

console.log(`Running build script in ${isVercel ? 'Vercel' : 'local'} environment...`);

try {
  // Display environment information
  console.log('Node version:', process.version);
  console.log('Current directory:', process.cwd());
  console.log('Environment variables:', Object.keys(process.env).filter(key => 
    !key.includes('SECRET') && !key.includes('TOKEN') && !key.includes('PASSWORD')
  ));
  
  // If we're in a local environment and not Vercel, run the normal build command
  if (!isVercel) {
    console.log('Running normal build process for local environment...');
    execSync('vite build', { stdio: 'inherit' });
    console.log('Local build completed successfully!');
    process.exit(0);
  }
  
  // Special build process for Vercel
  console.log('Running Vercel-specific build process...');
  
  // List directory contents to debug
  console.log('Directory contents:', fs.readdirSync('.'));
  
  // Build the frontend with Vite
  console.log('Building frontend with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('Frontend build completed.');
  
  // Do NOT build server/index.ts to avoid external dependency issues
  console.log('Using serverless API routes instead of building server/index.ts');
  
  // Ensure the API files are executable
  if (fs.existsSync('api')) {
    console.log('API directory exists');
    console.log('API directory contents:', fs.readdirSync('api'));
  } else {
    console.error('API directory not found! This is required for Vercel deployment.');
    throw new Error('API directory not found');
  }
  
  // Create a minimal placeholder server file
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  fs.writeFileSync('dist/index.js', `
// This is a placeholder file for Vercel deployment
// The actual server functionality is handled by the API routes
console.log('AlphaJournal API server - Vercel deployment');
export default {};
  `.trim());
  
  // Create package.json in dist to satisfy Vercel
  console.log('Creating minimal package.json in dist directory...');
  fs.writeFileSync('dist/package.json', JSON.stringify({
    "name": "alphajournal-frontend",
    "version": "1.0.0",
    "type": "module"
  }, null, 2));
  
  console.log('Vercel build completed successfully!');
  console.log('IMPORTANT: Remember to set SESSION_SECRET environment variable in Vercel.');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}