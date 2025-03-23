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
2. Install the Vercel CLI: `npm i -g vercel`
3. Run `vercel login` to authenticate
4. From the project root directory, run `vercel` to deploy
5. Follow the prompts and confirm the deployment settings

### Environment Variables

For proper functionality, set these environment variables in your Vercel project settings:

- `SESSION_SECRET`: A strong random string for securing session cookies

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