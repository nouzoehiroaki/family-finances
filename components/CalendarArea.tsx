import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { openDatabaseSync } from 'expo-sqlite'; // Expo SDK 49 以降は `openDatabaseSync`

// データベースを開く
const db = openDatabaseSync('expenses.db');

const CalendarArea = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    // アプリ起動時にデータをロード
    createTable();
    loadMarkedDates();
  }, []);

  // SQLite テーブルを作成
  const createTable = () => {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        amount INTEGER NOT NULL
      );`
    );
  };

  // データを取得してカレンダーに反映
  const loadMarkedDates = () => {
    const result = db.getAllSync('SELECT date, SUM(amount) as total FROM expenses GROUP BY date;') as { date: string; total: number }[];

    let newMarkedDates: { [key: string]: any } = {};
    result.forEach((row) => {
      newMarkedDates[row.date] = {
        selected: true,
        marked: true,
        customStyles: {
          container: {
            backgroundColor: '#FFD700', // 背景色 (ゴールド)
            borderRadius: 10,
            padding: 5,
          },
          text: {
            color: '#000000', // 文字色 (黒)
            fontWeight: 'bold',
          }
        },
        customText: `${row.total}円` // カレンダー上に表示する金額
      };
    });

    setMarkedDates(newMarkedDates);
  };

  // 日付を選択したとき
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);

    // SQLite から該当日付の合計金額を取得
    const result = db.getFirstSync('SELECT SUM(amount) as total FROM expenses WHERE date = ?;', [day.dateString]) as { total: number } | undefined;

    // 金額がある場合は表示、なければ空欄
    setAmount(result && result.total ? result.total.toString() : '');

    toggleModal();
  };

  // モーダルの開閉
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // 金額を保存する
  const saveAmount = () => {
    if (!selectedDate || !amount) return;

    db.runSync('INSERT INTO expenses (date, amount) VALUES (?, ?);', [selectedDate, parseInt(amount)]);
    console.log(`Saved: ${selectedDate} - ${amount}`);

    // データを再取得してカレンダーを更新
    loadMarkedDates();
    toggleModal();
  };

  return (
    <View style={styles.calendarContainer}>
      <Text style={styles.monthText}>カレンダー</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType={'custom'} // `custom` を使って金額表示
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
        }}
        renderDay={(day: { day: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, item: { customText: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
          <View style={{ alignItems: 'center' }}>
            <Text>{day?.day}</Text>
            {item?.customText && <Text style={{ fontSize: 12, color: '#FF0000' }}>{item.customText}</Text>}
          </View>
        )}
      />

      {/* 金額入力モーダル */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>選択した日付: {selectedDate}</Text>
          <TextInput
            style={styles.input}
            placeholder="金額"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Button title="保存" onPress={saveAmount} />
          <Button title="キャンセル" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
};

export default CalendarArea;

const styles = StyleSheet.create({
  calendarContainer: {
    marginBottom: 20,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
