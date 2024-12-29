import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';

interface Row {
  id: number;        // Assuming 'id' is a number, adjust if necessary
  value: string;     // Assuming 'value' is a string, adjust if necessary
  intValue: number;  // Assuming 'intValue' is a number, adjust if necessary
}

export default function createTable() {
  useEffect(() => {
    async function insertData() {
      try {
        const db = await SQLite.openDatabaseAsync('databaseName');
        await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
        INSERT INTO test (value, intValue) VALUES ('test1', 123);
        INSERT INTO test (value, intValue) VALUES ('test2', 456);
        INSERT INTO test (value, intValue) VALUES ('test3', 789);
        `);
        const allRows: Row[] = await db.getAllAsync('SELECT * FROM test');
        for (const row of allRows) {
          console.log(row.id, row.value, row.intValue);
        }
        console.log('rows', allRows);
      } catch (error) {
        console.log('Error:', error);
      }
    }
    insertData();
  }, []);
}

