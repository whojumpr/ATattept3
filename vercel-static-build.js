// This file ensures that static files are properly handled by Vercel
// It helps with SPA routing to prevent 404 errors

const fs = require('fs');
const path = require('path');

// Make sure the dist directory exists
if (!fs.existsSync('dist')) {
  console.error('dist directory not found! Build must be run first.');
  process.exit(1);
}

// Create a _redirects file for better SPA routing
fs.writeFileSync(path.join('dist', '_redirects'), '/* /index.html 200');
console.log('Created _redirects file for SPA routing');

// Create a router.json file to help Vercel with SPA routing
const router = {
  version: 1,
  routes: [
    { handle: "filesystem" },
    { src: "/api/(.*)", dest: "/api/$1" },
    { src: "/(.*)", dest: "/index.html" }
  ]
};

fs.writeFileSync(path.join('dist', 'router.json'), JSON.stringify(router, null, 2));
console.log('Created router.json file for Vercel SPA routing');