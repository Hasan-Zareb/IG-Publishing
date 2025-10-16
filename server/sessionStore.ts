import session from 'express-session';
import { Pool } from 'pg';

// Use PostgreSQL for session storage instead of memory
export class PostgresSessionStore extends session.Store {
  private pool: Pool;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
  }

  async get(sessionId: string, callback: (err: any, session?: any) => void) {
    try {
      const result = await this.pool.query(
        'SELECT session_data FROM sessions WHERE session_id = $1 AND expires_at > NOW()',
        [sessionId]
      );
      callback(null, result.rows[0]?.session_data);
    } catch (err) {
      callback(err);
    }
  }

  async set(sessionId: string, session: any, callback?: (err?: any) => void) {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await this.pool.query(
        `INSERT INTO sessions (session_id, session_data, expires_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (session_id) 
         DO UPDATE SET session_data = $2, expires_at = $3`,
        [sessionId, session, expiresAt]
      );
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  async destroy(sessionId: string, callback?: (err?: any) => void) {
    try {
      await this.pool.query('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  async touch(sessionId: string, session: any, callback?: (err?: any) => void) {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await this.pool.query(
        'UPDATE sessions SET expires_at = $1 WHERE session_id = $2',
        [expiresAt, sessionId]
      );
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}
