# Instagram Publishing Platform

A full-stack social media automation platform for scheduling and publishing posts to Instagram and Facebook.

## Features

- **Instagram Integration**: Schedule and publish Instagram posts, Reels, and Stories
- **Facebook Integration**: Schedule and publish Facebook posts
- **CSV Import**: Bulk import posts from CSV/Excel files
- **Multi-Account Support**: Manage multiple Instagram and Facebook accounts
- **Real-time Monitoring**: Track post status and engagement
- **Audio Mixing**: Add custom audio to videos and Reels

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel (Frontend + Backend)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session secret for authentication
- `INSTAGRAM_APP_ID`: Instagram/Facebook App ID
- `INSTAGRAM_APP_SECRET`: Instagram/Facebook App Secret
- `INSTAGRAM_REDIRECT_URI`: OAuth redirect URI

## Deployment

This project is configured for deployment on Vercel. The build process automatically handles both frontend and backend deployment.

## License

MIT# Vercel deployment trigger
