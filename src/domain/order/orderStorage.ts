import * as SQLite from 'expo-sqlite';
import { Order } from '../orderDomain'; 
let db: SQLite.SQLiteDatabase | null = null;

export const initDB = async () => {
  if (!db) db = await SQLite.openDatabaseAsync('app.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      marketId TEXT NOT NULL,
      items TEXT NOT NULL,
      totalPrice REAL,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);
};

export const saveOrder = async (order: Order) => {
  if (!db) db = await SQLite.openDatabaseAsync('app.db');

  await db.runAsync(
    `INSERT OR REPLACE INTO orders (id, userId, marketId, items, totalPrice, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.id,
      order.userId,
      order.marketId,
      JSON.stringify(order.items),
      order.totalPrice,
      order.status,
      order.createdAt,
      order.updatedAt,
    ]
  );
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  if (!db) db = await SQLite.openDatabaseAsync('app.db');

  const result = await db.getAllAsync(
    `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`,
    [userId]
  );

  return result.map(row => ({
    ...row,
    items: JSON.parse(row.items),
  })) as Order[];
};

export const clearOrders = async () => {
  if (!db) db = await SQLite.openDatabaseAsync('app.db');
  await db.execAsync('DELETE FROM orders');
};
