import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity } from 'react-native';
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

    //toggleModal();
    setTimeout(() => toggleModal(), 100);
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

  // ✅ データを削除する（該当日付のデータを全削除）
  const deleteAmount = () => {
    if (!selectedDate) return;

    db.runSync('DELETE FROM expenses WHERE date = ?;', [selectedDate]);
    console.log(`Deleted: ${selectedDate}`);

    // データを再取得してカレンダーを更新
    loadMarkedDates();
    toggleModal(); // 削除後モーダルを閉じる
  };

  return (
    <View style={styles.calendarContainer}>
      {/* <Text style={styles.monthText}>カレンダー</Text> */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType={'custom'} // `custom` を使って金額表示
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
        }}
        renderDay={(day: { day: number | undefined }, item: { customText: string }) => (
          <View style={{ alignItems: 'center' }}>
            <Text>{day?.day !== undefined ? day.day.toString() : ""}</Text>
            {item?.customText ? <Text style={{ fontSize: 12, color: '#FF0000' }}>{item.customText}</Text> : null}
          </View>
        )}
      />

      {/* 金額入力モーダル */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>

          <Text style={styles.modalTitle}>
            選択した日付: {selectedDate ?? "日付未選択"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="金額"
            keyboardType="numeric"
            value={amount ?? ''}
            onChangeText={setAmount}
          />

          <TouchableOpacity onPress={saveAmount} disabled={!selectedDate} style={[styles.button, !selectedDate && styles.disabledButton]}>
            <Text style={styles.buttonText}>保存</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={deleteAmount} disabled={!selectedDate} style={[styles.button, styles.deleteButton, !selectedDate && styles.disabledButton]}>
            <Text style={styles.buttonText}>データ削除</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleModal} style={styles.button}>
            <Text style={styles.buttonText}>キャンセル</Text>
          </TouchableOpacity>
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
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: 100,
  },
  deleteButton: {
    backgroundColor: '#FF5733',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
