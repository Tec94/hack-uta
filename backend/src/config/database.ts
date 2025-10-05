import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:[YOUR-PASSWORD]@db.vigwdzkvcnxnibaujrsp.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Database connection class
class Database {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Get a client from the pool
  async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      console.error('Error getting database client:', error);
      throw error;
    }
  }

  // Execute a query
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
      console.log('Current time from database:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  // Close all connections in the pool
  async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('Database pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
      throw error;
    }
  }

  // Get pool statistics
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }

  // Bank Links operations
  async createBankLink(userId: string, plaidToken: string): Promise<any> {
    try {
      const query = `
        INSERT INTO bank_links (user_id, plaid_token)
        VALUES ($1, $2)
        RETURNING id, created_at, user_id, plaid_token
      `;
      const result = await this.query(query, [userId, plaidToken]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating bank link:', error);
      throw error;
    }
  }

  async getBankLinkByUserId(userId: string): Promise<any> {
    try {
      const query = `
        SELECT id, created_at, user_id, plaid_token
        FROM bank_links
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const result = await this.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting bank link:', error);
      throw error;
    }
  }

  async updateBankLinkToken(userId: string, plaidToken: string): Promise<any> {
    try {
      const query = `
        UPDATE bank_links
        SET plaid_token = $2, created_at = now()
        WHERE user_id = $1
        RETURNING id, created_at, user_id, plaid_token
      `;
      const result = await this.query(query, [userId, plaidToken]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating bank link token:', error);
      throw error;
    }
  }

  async deleteBankLink(userId: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM bank_links
        WHERE user_id = $1
      `;
      const result = await this.query(query, [userId]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting bank link:', error);
      throw error;
    }
  }

  // Card Catalog operations
  async getAllCards(): Promise<any[]> {
    try {
      const query = `
        SELECT id, created_at, bank_name, card_name, network, category, reward_summary
        FROM card_catalog
        ORDER BY created_at DESC
      `;
      const result = await this.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all cards:', error);
      throw error;
    }
  }

  async getCardById(cardId: number): Promise<any> {
    try {
      const query = `
        SELECT id, created_at, bank_name, card_name, network, category, reward_summary
        FROM card_catalog
        WHERE id = $1
      `;
      const result = await this.query(query, [cardId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting card by ID:', error);
      throw error;
    }
  }

  async getCardsByCategory(category: string): Promise<any[]> {
    try {
      const query = `
        SELECT id, created_at, bank_name, card_name, network, category, reward_summary
        FROM card_catalog
        WHERE category = $1
        ORDER BY created_at DESC
      `;
      const result = await this.query(query, [category]);
      return result.rows;
    } catch (error) {
      console.error('Error getting cards by category:', error);
      throw error;
    }
  }

  async getCardsByBank(bankName: string): Promise<any[]> {
    try {
      const query = `
        SELECT id, created_at, bank_name, card_name, network, category, reward_summary
        FROM card_catalog
        WHERE bank_name = $1
        ORDER BY created_at DESC
      `;
      const result = await this.query(query, [bankName]);
      return result.rows;
    } catch (error) {
      console.error('Error getting cards by bank:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const database = new Database();

export default database;
export { Database };
