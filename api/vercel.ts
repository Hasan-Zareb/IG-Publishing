import express from 'express';
import path from 'path';
import { setupMiddleware } from '../server/middleware';
import { registerRoutes } from '../server/routes';
import passport from 'passport';
import { setupAuth } from '../server/auth';

// Create Express app
const app = express();

// Setup middleware
setupMiddleware(app);

// Initialize Passport
setupAuth();
app.use(passport.initialize());
app.use(passport.session());

// Register all routes
registerRoutes(app);

// Serve static files from the built frontend
app.use(express.static(path.join(process.cwd(), 'client/dist')));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the React app for all other routes
  res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
});

// Export for Vercel
export default app;
