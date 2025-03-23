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
  
  // Add SPA routing configurations for better client-side routing
  if (fs.existsSync('dist')) {
    console.log('Adding SPA routing configurations...');
    
    // Add _redirects file for Netlify-style hosting
    fs.writeFileSync('dist/_redirects', `/*    /index.html   200`.trim());
    console.log('Created _redirects file');
    
    // Add a router.json file for Vercel
    const router = {
      version: 1,
      routes: [
        { handle: "filesystem" },
        { src: "/api/(.*)", dest: "/api/$1" },
        { src: "/(.*)", dest: "/index.html" }
      ]
    };
    fs.writeFileSync('dist/router.json', JSON.stringify(router, null, 2));
    console.log('Created router.json file');
    
    // Also create a fallback for traditional web servers
    fs.writeFileSync('dist/.htaccess', `
# Handle client-side routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
    `.trim());
    console.log('Created .htaccess file');
    
    // Add a diagnostic HTML file that can be accessed if the main app fails
    fs.writeFileSync('dist/health-check.html', `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AlphaJournal Health Check</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 { color: #10B981; }
      .status { 
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
      }
      .ok { background: #d1fae5; color: #065f46; }
      button {
        background: #10B981;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      pre {
        background: #f1f5f9;
        padding: 10px;
        overflow: auto;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <h1>AlphaJournal Health Check</h1>
    <div class="status ok">
      ✅ If you can see this page, static file serving is working correctly
    </div>
    
    <div id="api-status">Checking API status...</div>
    
    <h2>Environment Info</h2>
    <div id="env-info">
      <p>Build time: ${new Date().toISOString()}</p>
      <p>Deployment: Vercel</p>
    </div>
    
    <h2>Actions</h2>
    <button onclick="location.href='/'">Go to Main Application</button>
    <button onclick="checkAPI()">Check API</button>
    
    <script>
      async function checkAPI() {
        const statusEl = document.getElementById('api-status');
        statusEl.innerHTML = 'Checking API connection...';
        
        try {
          const response = await fetch('/api/healthcheck');
          const data = await response.json();
          
          if (data.status === 'ok') {
            statusEl.innerHTML = \`
              <div class="status ok">
                ✅ API is responsive
                <pre>\${JSON.stringify(data, null, 2)}</pre>
              </div>
            \`;
          } else {
            statusEl.innerHTML = \`
              <div class="status" style="background:#fee2e2;color:#b91c1c">
                ❌ API returned unexpected response
                <pre>\${JSON.stringify(data, null, 2)}</pre>
              </div>
            \`;
          }
        } catch (error) {
          statusEl.innerHTML = \`
            <div class="status" style="background:#fee2e2;color:#b91c1c">
              ❌ API connection failed
              <pre>\${error.message}</pre>
            </div>
          \`;
        }
      }
      
      // Auto-check API on page load
      window.onload = checkAPI;
    </script>
  </body>
</html>
    `.trim());
    console.log('Created health-check.html diagnostic file');
    
    // Create a minimal version of index.html as a fallback
    fs.writeFileSync('dist/index-fallback.html', fs.readFileSync('client/index.html', 'utf8'));
    console.log('Created index-fallback.html file');
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