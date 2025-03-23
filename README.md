# AlphaJournal

A sophisticated day trading journal application designed to empower traders with comprehensive performance tracking, advanced analytics, and intuitive visualization tools.

## Features

- Trade tracking with detailed entry/exit data
- Performance analytics with visualizations
- Trading journal for reflection and insights
- Dashboard with key performance metrics
- User authentication system
- Responsive design for desktop and mobile

## Tech Stack

- React.js
- TypeScript
- Tailwind CSS
- Express.js
- Chart.js for data visualization
- Shadcn UI components

## Deployment to Vercel

This project is configured for seamless deployment to Vercel. Follow these steps to deploy:

1. Sign up for a Vercel account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository to Vercel
3. Use the following deployment settings:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (root of the repository)
   - **Build Command**: `node vercel-build.js`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Development Command**: Leave blank

### Important: Fixing "npm run build" Error

If you encounter the error: `Error: Command "npm run build" exited with 1`, follow these steps:

1. In your Vercel project settings, go to the "Build & Development Settings" section
2. Make sure the "Build Command" is set to `node vercel-build.js` (not `npm run build`)
3. Set "Framework Preset" to `Other` (not Vite)
4. Remove any auto-detected framework settings

### Environment Variables

For proper functionality, set these environment variables in your Vercel project settings:

- `NODE_ENV`: Set to `production`
- `SESSION_SECRET`: A strong random string for securing session cookies

### Handling the External Module Error

The custom build script (`vercel-build.js`) handles the error: `The entry point "server/index.ts" cannot be marked as external` by:

1. Building only the frontend using Vite
2. Creating a placeholder server file 
3. Using the serverless API routes in the `api` directory for backend functionality

The `vercel.json` file contains the routing configuration to direct API requests to the appropriate serverless functions.

### Important Files for Deployment

- **vercel.json**: Configures build settings and routes
- **vercel-build.js**: Custom build script that avoids the external module error
- **api/server.js**: Contains the serverless API implementation
- **.vercelignore**: Controls which files are included/excluded in deployment

### Deployment Troubleshooting

If you encounter issues during deployment:

1. Ensure all environment variables are properly set in the Vercel dashboard
2. Check Vercel's function logs for any API-related errors
3. Verify that the custom build script ran completely (look for "Build completed successfully" in logs)
4. Make sure the build command is `node vercel-build.js` and not `npm run build`
5. Remember that a demo user (username: `demo`, password: `demo123`) is automatically created for testing

## Development

To run the project locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser at `http://localhost:5000`

## Build

To build the project for production:

```bash
npm run build
```

This will generate optimized files in the `dist` directory.