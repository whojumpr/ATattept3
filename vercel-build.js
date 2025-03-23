// Custom build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running custom Vercel build script...');

try {
  // Build the frontend
  console.log('Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit' });

  // Build the server without the --packages=external flag
  console.log('Building server with esbuild...');
  execSync('esbuild server/index.ts --platform=node --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Ensure we have the needed directories
  if (!fs.existsSync('.vercel/output')) {
    fs.mkdirSync('.vercel/output', { recursive: true });
  }
  
  if (!fs.existsSync('.vercel/output/functions')) {
    fs.mkdirSync('.vercel/output/functions', { recursive: true });
  }
  
  // Make sure our API directory is ready for Vercel
  if (!fs.existsSync('.vercel/output/static')) {
    fs.mkdirSync('.vercel/output/static', { recursive: true });
  }

  console.log('Copying files to Vercel output directory...');
  
  // Copy the static assets
  execSync('cp -r dist/* .vercel/output/static/', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}