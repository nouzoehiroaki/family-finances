import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('expenses.db');

interface CalendarAreaProps {
  onUpdateTotal: (total: number) => void;
  budget: number;
  onMonthChange: (month: Date) => void;
}

const CalendarArea = ({ onUpdateTotal, budget, onMonthChange }: CalendarAreaProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDeleteAllModalVisible, setDeleteAllModalVisible] = useState(false);
  const [isAddingAmount, setIsAddingAmount] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [hasExistingData, setHasExistingData] = useState(false);

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

    db.execSync(
      `CREATE TABLE IF NOT EXISTS monthly_budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year_month TEXT NOT NULL UNIQUE,
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
    const dailyBudgetForMark = Math.floor(budget / daysInMonth);

    let newMarkedDates: { [key: string]: any } = {};
    result.forEach((row) => {
      const isOverBudget = row.total > dailyBudgetForMark;
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
    const lastDay = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${lastDay.toString().padStart(2, "0")}`;

    const result = db.getFirstSync(
      `SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?;`,
      [startDate, endDate]
    ) as { total: number } | undefined;

    const total = result?.total ?? 0;
    onUpdateTotal(total);
  };

  const calculateDailyBudget = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    if (daysInMonth === 0) return 0;
    return Math.floor(budget / daysInMonth);
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);

    const result = db.getFirstSync(
      'SELECT SUM(amount) as total FROM expenses WHERE date = ?;',
      [day.dateString]
    ) as { total: number } | undefined;

    const hasData = result?.total !== null && result?.total !== undefined && result.total > 0;
    setHasExistingData(hasData);
    setAmount(hasData ? result.total.toString() : '');
    setIsAddingAmount(false);
    setTimeout(() => toggleModal(), 100);
  };

  const handleMonthChange = (month: { year: number, month: number }) => {
    const newDate = new Date(month.year, month.month - 1, 1);
    setCurrentMonth(newDate);
    onMonthChange(newDate);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const saveAmount = () => {
    if (!selectedDate || !amount) return;

    db.runSync('INSERT INTO expenses (date, amount) VALUES (?, ?);', [selectedDate, parseInt(amount)]);
    setHasExistingData(true);
    loadMarkedDates();
    calculateMonthlyTotal();
    toggleModal();
  };

  const deleteAmount = () => {
    if (!selectedDate) return;

    db.runSync('DELETE FROM expenses WHERE date = ?;', [selectedDate]);
    setHasExistingData(false);
    loadMarkedDates();
    calculateMonthlyTotal();
    toggleModal();
  };

  const deleteAllData = () => {
    db.runSync('DELETE FROM expenses;');
    loadMarkedDates();
    calculateMonthlyTotal();
    setDeleteAllModalVisible(false);
  };

  const saveAdditionalAmount = () => {
    if (!selectedDate || !additionalAmount) return;

    db.runSync(
      'INSERT INTO expenses (date, amount) VALUES (?, ?);',
      [selectedDate, parseInt(additionalAmount)]
    );

    const result = db.getFirstSync(
      'SELECT SUM(amount) as total FROM expenses WHERE date = ?;',
      [selectedDate]
    ) as { total: number } | undefined;

    setAmount(result?.total.toString() || '0');
    loadMarkedDates();
    calculateMonthlyTotal();
    setIsAddingAmount(false);
    setAdditionalAmount('');
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
            style={[styles.input, hasExistingData && styles.disabledInput]}
            placeholder="金額"
            keyboardType="numeric"
            value={amount ?? ''}
            onChangeText={setAmount}
            editable={!hasExistingData}
          />

          {!hasExistingData && (
            <TouchableOpacity
              onPress={saveAmount}
              disabled={!selectedDate}
              style={[styles.button, !selectedDate && styles.disabledButton]}
            >
              <Text style={styles.buttonText}>保存</Text>
            </TouchableOpacity>
          )}

          {hasExistingData && (
            <>
              {!isAddingAmount ? (
                <TouchableOpacity
                  onPress={() => setIsAddingAmount(true)}
                  style={[styles.button, styles.addButton]}
                >
                  <Text style={styles.buttonText}>金額を追加</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.additionalInputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="追加金額"
                    keyboardType="numeric"
                    value={additionalAmount}
                    onChangeText={setAdditionalAmount}
                    autoFocus={true}
                  />
                  <TouchableOpacity
                    onPress={saveAdditionalAmount}
                    style={[styles.button, styles.addButton]}
                  >
                    <Text style={styles.buttonText}>追加を保存</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={deleteAmount}
                style={[styles.button, styles.deleteButton]}
              >
                <Text style={styles.buttonText}>データ削除</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={toggleModal} style={styles.button}>
            <Text style={styles.buttonText}>完了</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={isDeleteAllModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>全てのデータを削除しますか？</Text>
          <Text style={styles.warningText}>この操作は取り消せません。</Text>

          <TouchableOpacity onPress={deleteAllData} style={[styles.button, styles.deleteButton]}>
            <Text style={styles.buttonText}>削除する</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setDeleteAllModalVisible(false)} style={styles.button}>
            <Text style={styles.buttonText}>完了</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Text style={styles.dailyBudgetText}>1日あたりの予算: {calculateDailyBudget()}円</Text>

      {/* <TouchableOpacity
        onPress={() => setDeleteAllModalVisible(true)}
        style={[styles.button, styles.deleteAllButton]}
      >
        <Text style={styles.buttonText}>入力した全ての金額クリア</Text>
      </TouchableOpacity> */}
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
  deleteAllButton: {
    backgroundColor: '#FF0000',
    width: '100%',
    marginTop: 20,
  },
  warningText: {
    color: '#FF0000',
    marginBottom: 15,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#28a745',
    marginTop: 10,
    width: 150,
  },
  additionalInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
});
