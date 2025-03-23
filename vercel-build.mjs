// Custom build script for Vercel deployment
// Using ES modules syntax for Vercel compatibility
import { execSync } from 'child_process';
import fs from 'fs';

// Determine if we're running in Vercel environment
const isVercel = process.env.VERCEL === '1';

console.log(`Running build script in ${isVercel ? 'Vercel' : 'local'} environment...`);

try {
  // Display environment information
  console.log('Node version:', process.version);
  console.log('Current directory:', process.cwd());
  
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
  
  // Build the frontend with Vite - Avoiding 'npx' to prevent package resolution issues
  console.log('Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('Frontend build completed.');
  
  // Using serverless API routes 
  console.log('Using serverless API routes instead of building server/index.ts');
  
  // Ensure the API files are executable
  if (fs.existsSync('api')) {
    console.log('API directory exists');
    console.log('API directory contents:', fs.readdirSync('api'));
  } else {
    console.error('API directory not found! This is required for Vercel deployment.');
    throw new Error('API directory not found');
  }
  
  // We don't need to create any placeholder files anymore
  // Vite already builds the frontend files into the dist directory
  
  // Add a _redirects file to ensure SPA routing works correctly
  if (fs.existsSync('dist')) {
    console.log('Adding SPA redirect configuration...');
    // This ensures all routes are handled by index.html for SPA routing
    fs.writeFileSync('dist/_redirects', `
/*    /index.html   200
    `.trim());
  } else {
    console.error('dist directory not found after build! This is required for frontend deployment.');
    throw new Error('dist directory not found');
  }
  
  console.log('Vercel build completed successfully!');
  console.log('IMPORTANT: Remember to set SESSION_SECRET environment variable in Vercel.');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}