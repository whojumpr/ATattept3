// Custom build script for Vercel deployment
// This script is executed during Vercel builds and provides a simplified build process
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Starting custom Vercel build script...');

try {
  // Display environment information
  console.log('Node version:', process.version);
  console.log('Current directory:', process.cwd());
  
  // Build the frontend with Vite
  console.log('Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully.');
  
  // Copy static files to the dist directory
  if (fs.existsSync('health-check.html')) {
    console.log('Copying health-check.html to dist directory...');
    fs.copyFileSync('health-check.html', 'dist/health-check.html');
  }
  
  if (fs.existsSync('index.html')) {
    console.log('Copying static fallback index.html to dist directory...');
    fs.copyFileSync('index.html', 'dist/index-static.html');
  }
  
  // Add SPA routing configurations
  console.log('Adding SPA routing configurations...');
  
  // Create _redirects file for SPA routing
  fs.writeFileSync('dist/_redirects', '/*    /index.html   200');
  console.log('Created _redirects file');
  
  // Print the dist directory structure for debugging
  console.log('Final dist directory contents:');
  const listDirRecursive = (dir, indent = '') => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const path = `${dir}/${file}`;
      if (fs.statSync(path).isDirectory()) {
        console.log(`${indent}${file}/`);
        listDirRecursive(path, indent + '  ');
      } else {
        console.log(`${indent}${file}`);
      }
    });
  };
  
  if (fs.existsSync('dist')) {
    listDirRecursive('dist');
  }
  
  console.log('Vercel build completed successfully!');
  console.log('IMPORTANT: Remember to set SESSION_SECRET environment variable in Vercel.');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}