// This fallback handler ensures proper handling of routes in Vercel
// It serves the main HTML file for client-side routes to support SPA routing

export default function handler(req, res) {
  const { path } = req.query;
  
  // Exclude API routes from SPA handling
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({
      status: 'error',
      message: 'API endpoint not found',
      path: req.url
    });
  }
  
  // For all other routes, serve the index.html to let client-side routing handle it
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="AlphaJournal - A sophisticated day trading journal for tracking performance and analyzing trades" />
        <title>AlphaJournal - Day Trading Journal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script>
          // Handle any route-specific redirects or special cases
          window.REQUESTED_PATH = "${req.url}";
          console.log("AlphaJournal SPA route requested:", window.REQUESTED_PATH);
        </script>
        <style>
          :root {
            --profit: #10B981;
            --loss: #EF4444;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
              Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .app-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f8f9fa;
            color: #374151;
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #10B981;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div id="root">
          <div class="app-loading">
            <div class="spinner"></div>
            <h1>Loading AlphaJournal...</h1>
            <p>Redirecting to the requested page</p>
          </div>
        </div>
        <script>
          // Redirect to the home page with the path as a hash
          window.location.href = '/' + (window.REQUESTED_PATH ? '?path=' + encodeURIComponent(window.REQUESTED_PATH) : '');
        </script>
      </body>
    </html>
  `);
}