import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('expenses.db');

const CalendarArea = ({ onUpdateTotal, budget }: { onUpdateTotal: (total: number) => void, budget: number }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    createTable();
    loadMarkedDates();
    calculateMonthlyTotal();
  }, [budget, currentMonth]);

  const createTable = () => {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        amount INTEGER NOT NULL
      );`
    );
  };

  const loadMarkedDates = () => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, "0");
    const result = db.getAllSync(
      'SELECT date, SUM(amount) as total FROM expenses WHERE strftime("%Y-%m", date) = ? GROUP BY date;',
      [`${year}-${month}`]
    ) as { date: string; total: number }[];

    const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
    const today = new Date();
    const remainingDays = currentMonth.getMonth() === today.getMonth() ? daysInMonth - today.getDate() + 1 : daysInMonth;
    const dailyBudget = Math.floor(budget / remainingDays);

    let newMarkedDates: { [key: string]: any } = {};
    result.forEach((row) => {
      const isOverBudget = row.total > dailyBudget;
      newMarkedDates[row.date] = {
        selected: true,
        marked: true,
        customStyles: {
          container: {
            backgroundColor: isOverBudget ? '#FF0000' : '#00adf5',
            borderRadius: 10,
            padding: 5,
          },
          text: {
            color: '#000000',
            fontWeight: 'bold',
          }
        },
        customText: `${row.total}円`
      };
    });

    setMarkedDates(newMarkedDates);
  };

  const calculateMonthlyTotal = () => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    const result = db.getFirstSync(
      `SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?;`,
      [startDate, endDate]
    ) as { total: number } | undefined;

    const total = result?.total ?? 0;
    onUpdateTotal(total);
  };

  const calculateDailyBudget = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const today = new Date();
    const remainingDays = currentMonth.getMonth() === today.getMonth() ? daysInMonth - today.getDate() + 1 : daysInMonth;
    const dailyBudget = Math.floor(budget / remainingDays);
    return dailyBudget;
  };

  const handleDayPress = (day: { dateString: string }) => {
    const today = new Date();
    const selected = new Date(day.dateString);

    if (selected.getTime() < today.setHours(0, 0, 0, 0)) {
      return;
    }

    setSelectedDate(day.dateString);

    const result = db.getFirstSync('SELECT SUM(amount) as total FROM expenses WHERE date = ?;', [day.dateString]) as { total: number } | undefined;

    setAmount(result && result.total ? result.total.toString() : '');

    setTimeout(() => toggleModal(), 100);
  };

  const handleMonthChange = (month: { year: number, month: number }) => {
    setCurrentMonth(new Date(month.year, month.month - 1, 1));
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const saveAmount = () => {
    if (!selectedDate || !amount) return;

    db.runSync('INSERT INTO expenses (date, amount) VALUES (?, ?);', [selectedDate, parseInt(amount)]);
    loadMarkedDates();
    calculateMonthlyTotal();
    toggleModal();
  };

  const deleteAmount = () => {
    if (!selectedDate) return;

    db.runSync('DELETE FROM expenses WHERE date = ?;', [selectedDate]);
    loadMarkedDates();
    calculateMonthlyTotal();
    toggleModal();
  };

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        markingType={'custom'}
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

      <Text style={styles.dailyBudgetText}>1日あたりの予算: {calculateDailyBudget()}円</Text>
    </View>
  );
};

export default CalendarArea;

const styles = StyleSheet.create({
  calendarContainer: {
    marginBottom: 20,
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
  dailyBudgetText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
