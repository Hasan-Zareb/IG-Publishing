import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { postService } from "./services/postService";
// Note: node-schedule removed for serverless compatibility
import { pool } from "./db";
import { progressTracker } from "./services/progressTrackingService";

const PgSession = connectPgSimple(session);
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration with PostgreSQL storage
app.use(session({
  secret: process.env.SESSION_SECRET || 'social_media_automation_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to false for development to allow HTTP
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for persistent login
    httpOnly: true,
    sameSite: 'lax'
  },
  store: new PgSession({
    pool: pool,
    tableName: 'sessions',
    createTableIfMissing: true
  })
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Setup Facebook authentication
setupAuth();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on configured port (default 5000 for Replit, can be changed via PORT env var)
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen(port, "0.0.0.0", async () => {
    log(`serving on port ${port}`);
    
    // Log Facebook OAuth callback URL for configuration
    const replitDomain = process.env.REPLIT_DOMAINS;
    if (replitDomain) {
      const baseUrl = `https://${replitDomain}`;
      const callbackUrl = `${baseUrl}/auth/facebook/callback`;
      console.log('\n=== FACEBOOK OAUTH CONFIGURATION ===');
      console.log(`App Domain: ${replitDomain}`);
      console.log(`Site URL: ${baseUrl}`);
      console.log(`Valid OAuth Redirect URI: ${callbackUrl}`);
      console.log('====================================\n');
    }
    
    try {
      // Set up progress tracking cleanup to prevent memory buildup
      const cleanupJob = schedule.scheduleJob('*/10 * * * *', async () => { // Every 10 minutes
        try {
          progressTracker.cleanupCompletedUploads();
        } catch (error) {
          console.error('Error in progress tracking cleanup:', error);
        }
      });
      log('Progress tracking cleanup job scheduled');
      
      // Set up a daily job to retry failed posts
      const retryJob = schedule.scheduleJob('0 */4 * * *', async () => { // Every 4 hours
        try {
          await postService.retryFailedPosts();
          log('Failed posts retry complete');
        } catch (error) {
          console.error('Error retrying failed posts:', error);
        }
      });
      
      log('Post management system initialized');
    } catch (error) {
      console.error('Error initializing post management system:', error);
    }
  });
})();
