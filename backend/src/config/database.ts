import * as mysql from 'mysql2/promise';
import { PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { DatabasePool, MockDatabase } from '../types/database.types.js';

dotenv.config();

// Prüfe, ob wir den Mock-Modus verwenden sollen
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

let pool: DatabasePool;

// Type definitions for mock data
interface MockUser extends RowDataPacket {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status?: string;
  department_id?: number | null;
  department_name?: string | null;
  position?: string;
  password?: string;
}

interface MockDepartment extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface MockDocument extends RowDataPacket {
  id: number;
  user_id: number;
  file_name: string;
  category: string;
  upload_date: Date;
}

if (USE_MOCK_DB) {
  // Mock-Implementierung
  const mockDb: MockDatabase = {
    async query<
      T extends RowDataPacket[][] | RowDataPacket[] | ResultSetHeader,
    >(sql: string, params?: any[]): Promise<T> {
      // Einfache Mock-Daten für Entwicklung
      if (sql.includes('SELECT * FROM users WHERE role = "employee"')) {
        return [[] as MockUser[]] as unknown as T;
      } else if (sql.includes('SELECT * FROM departments')) {
        return [
          [
            {
              id: 1,
              name: 'Entwicklung',
              description: 'Software-Entwicklung',
              status: 'active',
            },
            {
              id: 2,
              name: 'Marketing',
              description: 'Marketing und Verkauf',
              status: 'active',
            },
          ] as MockDepartment[],
        ] as unknown as T;
      } else if (sql.includes('SELECT * FROM documents')) {
        return [
          [
            {
              id: 1,
              user_id: 1,
              file_name: 'Arbeitsvertrag.pdf',
              category: 'Vertrag',
              upload_date: new Date(),
            },
            {
              id: 2,
              user_id: 2,
              file_name: 'Gehaltsabrechnung.pdf',
              category: 'Gehaltsabrechnung',
              upload_date: new Date(),
            },
          ] as MockDocument[],
        ] as unknown as T;
      } else if (sql.includes('COUNT(*) as count FROM users')) {
        return [[{ count: 0 }] as RowDataPacket[]] as T;
      } else if (sql.includes('COUNT(*) as count FROM departments')) {
        return [[{ count: 2 }] as RowDataPacket[]] as T;
      } else if (sql.includes('COUNT(*) as count FROM documents')) {
        return [[{ count: 2 }] as RowDataPacket[]] as T;
      } else if (sql.includes('SELECT * FROM users WHERE username = ?')) {
        if (params && params[0] === 'admin') {
          return [
            [
              {
                id: 999,
                username: 'admin',
                password:
                  '$2b$10$0h85p.WVUvyRJ1taW9vEvehv7Lz.GcMRkRdSOWLG.GaOSydbE8u3a',
                first_name: 'Admin',
                last_name: 'User',
                email: 'admin@example.com',
                role: 'admin',
              },
            ] as MockUser[],
          ] as unknown as T;
        }
        return [[]] as unknown as T;
      } else if (
        sql.includes(
          'SELECT u.*, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?'
        )
      ) {
        // Mock für findById
        const userId = params ? params[0] : null;
        if (userId == 999) {
          return [
            [
              {
                id: 999,
                username: 'admin',
                first_name: 'Admin',
                last_name: 'User',
                email: 'admin@example.com',
                role: 'admin',
                department_id: null,
                department_name: null,
              },
            ] as MockUser[],
          ] as unknown as T;
        }
        return [[]] as unknown as T;
      } else if (
        sql.includes('UPDATE users SET') &&
        sql.includes('WHERE id = ?')
      ) {
        // Mock für update
        return [{ affectedRows: 1 } as ResultSetHeader] as unknown as T;
      } else if (sql.includes('INSERT INTO users')) {
        // Mock für create
        return [{ insertId: 4 } as ResultSetHeader] as unknown as T;
      } else if (sql.includes('DELETE FROM users WHERE id = ?')) {
        // Mock für delete
        return [{ affectedRows: 1 } as ResultSetHeader] as unknown as T;
      }

      // Standardantwort für nicht implementierte Abfragen
      return [[]] as unknown as T;
    },
    // Execute method (alias for query in mock)
    async execute<
      T extends RowDataPacket[][] | RowDataPacket[] | ResultSetHeader,
    >(sql: string, params?: any[]): Promise<T> {
      return this.query<T>(sql, params);
    },
    async getConnection() {
      // Mock connection object
      const mockConnection = {
        async query<
          T extends RowDataPacket[][] | RowDataPacket[] | ResultSetHeader,
        >(sql: string, params?: any[]): Promise<T> {
          // Use the same mock query function
          return mockDb.query<T>(sql, params);
        },
        async execute<
          T extends RowDataPacket[][] | RowDataPacket[] | ResultSetHeader,
        >(sql: string, params?: any[]): Promise<T> {
          // Use the same mock query function
          return mockDb.execute<T>(sql, params);
        },
        async beginTransaction() {
          // Mock transaction - do nothing
        },
        async commit() {
          // Mock commit - do nothing
        },
        async rollback() {
          // Mock rollback - do nothing
        },
        release() {
          // Mock release - do nothing
        },
      };
      return mockConnection;
    },
  };

  pool = mockDb;
} else {
  // Echte Datenbankverbindung
  console.log('[DEBUG] Database config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  // Initialize pool immediately with config
  const config: PoolOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'main',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: false, // Sicherheitsverbesserung
    charset: 'utf8mb4',
    connectTimeout: 60000, // 60 seconds
    stringifyObjects: false,
    supportBigNumbers: true,
    bigNumberStrings: false,
    dateStrings: false,
    debug: false,
    typeCast: function (field: any, next: any) {
      if (
        field.type === 'VAR_STRING' ||
        field.type === 'STRING' ||
        field.type === 'BLOB'
      ) {
        return field.string('utf8');
      }
      return next();
    },
  };

  try {
    pool = mysql.createPool(config);
    console.log('[DEBUG] Database pool created successfully');

    // Test the connection immediately
    pool
      .getConnection()
      .then((conn: any) => {
        console.log('[DEBUG] Database connection test successful');
        conn.release();
      })
      .catch((err: any) => {
        console.error('[DEBUG] Database connection test failed:', err.message);
      });
  } catch (error) {
    console.error('Fehler beim Verbinden mit der Datenbank:', error);
    // Create a dummy pool that throws errors
    pool = {
      async query(): Promise<any> {
        throw new Error('Database connection failed');
      },
      async execute(): Promise<any> {
        throw new Error('Database connection failed');
      },
      async getConnection(): Promise<any> {
        throw new Error('Database connection failed');
      },
    } as MockDatabase;
  }
}

// Export the pool
export default pool;
export { pool };

// Named export for executeQuery function
export async function executeQuery<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: any[]
): Promise<[T, any]> {
  if ('query' in pool && typeof pool.query === 'function') {
    const result = await (pool as any).query(sql, params);
    if (Array.isArray(result) && result.length === 2) {
      return result as [T, any];
    }
    return [result as T, null];
  }
  throw new Error('Database pool not properly initialized');
}

// CommonJS compatibility
