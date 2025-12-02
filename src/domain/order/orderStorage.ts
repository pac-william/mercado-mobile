import * as SQLite from 'expo-sqlite';
import { Order } from '../orderDomain';

let db: SQLite.SQLiteDatabase | null = null;

interface OrderRow {
  id: string;
  userId: string;
  marketId: string;
  delivererId?: string | null;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  rawData?: string | null;
  syncedAt?: string;
}

export const initDB = async () => {
  if (!db) db = await SQLite.openDatabaseAsync('app.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      marketId TEXT NOT NULL,
      delivererId TEXT,
      totalPrice REAL NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      rawData TEXT,
      syncedAt TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId);
    CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt DESC);
  `);
};

export const saveOrder = async (order: Order) => {
  await initDB();

  try {
    const rawData = JSON.stringify(order);
    const syncedAt = new Date().toISOString();

    await db!.runAsync(
      `INSERT OR REPLACE INTO orders (
        id, userId, marketId, delivererId, totalPrice, status, 
        createdAt, updatedAt, rawData, syncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.userId,
        order.marketId,
        order.delivererId || null,
        order.totalPrice || 0,
        order.status || 'PENDENTE',
        order.createdAt,
        order.updatedAt || order.createdAt,
        rawData,
        syncedAt,
      ]
    );
  } catch (error: unknown) {
    console.error('Erro ao salvar pedido localmente:', error);
    throw error;
  }
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  await initDB();

  try {
    const result = await db!.getAllAsync<OrderRow>(
      `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`,
      [userId]
    );

    return result.map((row) => {
      if (row.rawData) {
        try {
          return JSON.parse(row.rawData) as Order;
        } catch (e: unknown) {
          console.warn('Erro ao parsear rawData, usando dados do banco:', e);
        }
      }

      return {
        id: row.id,
        userId: row.userId,
        marketId: row.marketId,
        delivererId: row.delivererId,
        totalPrice: row.totalPrice,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt || row.createdAt,
      } as Order;
    });
  } catch (error: unknown) {
    console.error('Erro ao buscar pedidos locais:', error);
    return [];
  }
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  await initDB();

  try {
    const result = await db!.getFirstAsync<{
      id: string;
      userId: string;
      marketId: string;
      delivererId?: string;
      totalPrice: number;
      status: string;
      createdAt: string;
      updatedAt: string;
      rawData?: string;
    }>(
      `SELECT * FROM orders WHERE id = ?`,
      [id]
    );

    if (!result) return null;

    if (result.rawData) {
      try {
        return JSON.parse(result.rawData) as Order;
      } catch (e: unknown) {
        console.warn('Erro ao parsear rawData:', e);
      }
    }

    return {
      id: result.id,
      userId: result.userId,
      marketId: result.marketId,
      delivererId: result.delivererId,
      totalPrice: result.totalPrice,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt || result.createdAt,
    } as Order;
  } catch (error: unknown) {
    console.error('Erro ao buscar pedido por ID:', error);
    return null;
  }
};

export const clearOrders = async () => {
  await initDB();
  await db!.execAsync('DELETE FROM orders');
};

export const deleteOrder = async (id: string): Promise<void> => {
  await initDB();
  await db!.runAsync('DELETE FROM orders WHERE id = ?', [id]);
};
