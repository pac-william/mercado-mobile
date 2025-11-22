const mockDatabase = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
};

const openDatabaseAsync = jest.fn().mockResolvedValue(mockDatabase);

export const SQLiteDatabase = jest.fn().mockImplementation(() => mockDatabase);

export default {
  openDatabaseAsync,
  SQLiteDatabase,
};


