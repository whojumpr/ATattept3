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
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Environment Variables

For proper functionality, set these environment variables in your Vercel project settings:

- `NODE_ENV`: Set to `production`
- `SESSION_SECRET`: A strong random string for securing session cookies

### Deployment Troubleshooting

If you encounter issues during deployment:

1. Ensure all environment variables are properly set in the Vercel dashboard
2. Check Vercel's function logs for any API-related errors
3. Verify that the build was completed successfully
4. Make sure Vercel's routing configuration isn't blocking API requests

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