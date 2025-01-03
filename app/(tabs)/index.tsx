import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import createTable from '@/helpers/sqlite';

interface Row {
  id: number;        // Assuming 'id' is a number, adjust if necessary
  value: string;     // Assuming 'value' is a string, adjust if necessary
  intValue: number;  // Assuming 'intValue' is a number, adjust if necessary
}


export default function TabOneScreen() {
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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
