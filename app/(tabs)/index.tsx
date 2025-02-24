import React, { useState } from 'react';
import CalendarArea from '@/components/CalendarArea';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';


const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

const App = () => {
  const [totalExpense, setTotalExpense] = useState(0); // ✅ 支出合計を管理
  const [budget, setBudget] = useState(135000);
  const [inputBudget, setInputBudget] = useState(budget.toString());
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  // ✅ 予算を確定する
  const confirmBudget = () => {
    const newBudget = parseInt(inputBudget) || 0;
    setBudget(newBudget);
    setIsEditingBudget(false);
  };
  return (
    <View style={styles.container}>
      <CalendarArea onUpdateTotal={setTotalExpense} budget={budget} />
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>月間</Text>
        <View style={styles.budgetContainer}>
          <Text style={styles.summaryText}>予算:</Text>
          {isEditingBudget ? (
            <>
              <TextInput
                style={styles.budgetInput}
                keyboardType="numeric"
                value={inputBudget}
                onChangeText={setInputBudget}
              />
              <TouchableOpacity onPress={confirmBudget} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>確定</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.budgetText}>{budget.toLocaleString()}円</Text>
              <TouchableOpacity onPress={() => setIsEditingBudget(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>編集</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text style={styles.summaryText}>支出: {totalExpense.toLocaleString()}円</Text>
        <Text style={styles.summaryText}>残高: {(budget - totalExpense).toLocaleString()}円</Text>
      </View>
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
  budgetInput: {
    fontSize: 18,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderColor: '#000',
    width: 100,
    textAlign: 'right',
  },
  confirmButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
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