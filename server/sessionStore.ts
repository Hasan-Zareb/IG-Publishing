import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

const PgSession = connectPgSimple(session);

interface PgSessionStoreOptions {
  pool: Pool;
  tableName?: string;
  schemaName?: string;
  createTableIfMissing?: boolean;
  ttl?: number; // Time to live in seconds
  pruneSessionInterval?: number | false; // Interval to prune expired sessions in seconds
}

export class PgSessionStore extends PgSession {
  constructor(options: PgSessionStoreOptions) {
    super(options);
  }
}
