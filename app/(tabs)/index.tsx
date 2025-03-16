import React, { useState, useEffect } from 'react';
import CalendarArea from '@/components/CalendarArea';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('expenses.db');

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

const App = () => {
  const [totalExpense, setTotalExpense] = useState(0);
  // ✅ 支出合計を管理
  const [budget, setBudget] = useState(135000);
  const [inputBudget, setInputBudget] = useState(budget.toString());
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadMonthlyBudget();
  }, [currentMonth]);

  const loadMonthlyBudget = () => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, "0");
    const yearMonth = `${year}-${month}`;

    const result = db.getFirstSync(
      'SELECT amount FROM monthly_budgets WHERE year_month = ?;',
      [yearMonth]
    ) as { amount: number } | undefined;

    if (result) {
      setBudget(result.amount);
      setInputBudget(result.amount.toString());
    }
  };

  // ✅ 予算を確定する
  const confirmBudget = () => {
    const newBudget = parseInt(inputBudget) || 0;
    setBudget(newBudget);

    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, "0");
    const yearMonth = `${year}-${month}`;

    db.runSync(
      'INSERT OR REPLACE INTO monthly_budgets (year_month, amount) VALUES (?, ?);',
      [yearMonth, newBudget]
    );

    setIsBudgetModalVisible(false);
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  return (
    <View style={styles.container}>
      <CalendarArea
        onUpdateTotal={setTotalExpense}
        budget={budget}
        onMonthChange={handleMonthChange}
      />
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>月間</Text>
        <View style={styles.budgetContainer}>
          <Text style={styles.summaryText}>予算: </Text>
          <Text style={styles.budgetText}>{budget.toLocaleString()}円</Text>
          <TouchableOpacity onPress={() => setIsBudgetModalVisible(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>編集</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.summaryText}>支出: {totalExpense.toLocaleString()}円</Text>
        <Text style={styles.summaryText}>残高: {(budget - totalExpense).toLocaleString()}円</Text>
      </View>

      <Modal visible={isBudgetModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>予算を入力</Text>
          <Text style={styles.modalSubtitle}>
            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月の予算
          </Text>
          <TextInput
            style={styles.budgetInput}
            keyboardType="numeric"
            value={inputBudget}
            onChangeText={setInputBudget}
            placeholder="予算を入力してください"
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              onPress={confirmBudget}
              style={[styles.modalButton, styles.confirmButton]}
            >
              <Text style={styles.buttonText}>確定</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsBudgetModalVisible(false)}
              style={[styles.modalButton, styles.cancelButton]}
            >
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5dc',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  selectedDate: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  budgetInput: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#007BFF',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  summaryContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  summaryText: {
    fontSize: 18,
    marginVertical: 5,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 18,
    marginLeft: 10,
  },
  editButton: {
    marginLeft: 10,
    backgroundColor: '#FFA500',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default App;