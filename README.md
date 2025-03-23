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
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (root of the repository)
   - **Build Command**: `node vercel-build.js`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Environment Variables

For proper functionality, set these environment variables in your Vercel project settings:

- `NODE_ENV`: Set to `production`
- `SESSION_SECRET`: A strong random string for securing session cookies

### Handling the External Module Error

If you encounter the error: `The entry point "server/index.ts" cannot be marked as external`, the custom build script (`vercel-build.js`) should handle this by:

1. Building only the frontend using Vite
2. Creating a placeholder server file 
3. Using the serverless API routes in the `api` directory for backend functionality

The `vercel.json` file contains proper routing configuration to direct API requests to the appropriate serverless functions.

### Deployment Troubleshooting

If you encounter issues during deployment:

1. Ensure all environment variables are properly set in the Vercel dashboard
2. Check Vercel's function logs for any API-related errors
3. Verify that the custom build script ran completely
4. Remember that a demo user (username: `demo`, password: `demo123`) is automatically created for testing

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