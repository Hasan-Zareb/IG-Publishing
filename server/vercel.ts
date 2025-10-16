import express from 'express';
import { setupMiddleware } from './middleware';
import { registerRoutes } from './routes';
import passport from 'passport';
import { initializePassport } from './auth';

// Create Express app
const app = express();

// Setup middleware
setupMiddleware(app);

// Initialize Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Register all routes
registerRoutes(app);

// Export for Vercel
export default app;
