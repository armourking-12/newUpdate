import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not defined in environment variables.");
}

// Global pool cache for serverless environments
let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required for Postgres storage.");
    }
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

let tableInitialized = false;

/**
 * Ensure the document_files table exists in Neon PostgreSQL
 */
export async function ensureTableExists(): Promise<void> {
  if (tableInitialized) return;
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS document_files (
      id VARCHAR(64) PRIMARY KEY,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size BIGINT NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  tableInitialized = true;
}

export interface StoredDocument {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  data: Buffer;
  createdAt: Date;
}

/**
 * Upload a document (PDF, DOCX, PPTX, etc.) directly into Neon PostgreSQL BYTEA storage.
 * Returns the download and preview URL path: /api/files/[id]
 */
export async function uploadToPostgres(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string = "application/pdf"
): Promise<string> {
  await ensureTableExists();
  const fileId = crypto.randomUUID();
  const p = getPool();

  await p.query(
    `INSERT INTO document_files (id, file_name, mime_type, file_size, data)
     VALUES ($1, $2, $3, $4, $5)`,
    [fileId, fileName, mimeType, fileBuffer.length, fileBuffer]
  );

  return `/api/files/${fileId}`;
}

/**
 * Retrieve a stored document by its ID from Neon PostgreSQL.
 */
export async function getFileFromPostgres(fileId: string): Promise<StoredDocument | null> {
  await ensureTableExists();
  const p = getPool();

  const result = await p.query(
    `SELECT id, file_name, mime_type, file_size, data, created_at
     FROM document_files
     WHERE id = $1`,
    [fileId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: Number(row.file_size),
    data: row.data,
    createdAt: row.created_at,
  };
}

/**
 * Delete a document from Neon PostgreSQL storage.
 * Accepts either the file URL (/api/files/[id]) or the raw file ID.
 */
export async function deleteFromPostgres(urlOrId: string): Promise<void> {
  if (!urlOrId) return;
  await ensureTableExists();
  const p = getPool();

  // Extract ID if URL is provided (e.g. /api/files/1234 or http://.../api/files/1234)
  const segments = urlOrId.split("/api/files/");
  const fileId = segments.length > 1 ? segments[1].split(/[?#]/)[0] : urlOrId;

  try {
    await p.query(`DELETE FROM document_files WHERE id = $1`, [fileId]);
  } catch (error) {
    console.error(`Failed to delete document ${fileId} from Postgres:`, error);
  }
}
