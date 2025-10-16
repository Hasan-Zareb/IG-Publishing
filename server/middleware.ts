import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { PgSessionStore } from './sessionStore';
import { pool } from './database';

export function setupMiddleware(app: express.Application) {
  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));

  // Session configuration with PostgreSQL store
  const sessionStore = new PgSessionStore({
    pool: pool,
    tableName: 'sessions',
    createTableIfMissing: true
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Body parsing
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
}
