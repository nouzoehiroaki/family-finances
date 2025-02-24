import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

const CalendarArea = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    toggleModal();
  };

  return (
    <View style={styles.calendarContainer}>
      <Text style={styles.monthText}>{currentYear}年{currentMonth}月</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={
          selectedDate
            ? { [selectedDate]: { selected: true, marked: true } }
            : {}
        }
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
        }}
      />

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>金額を入力</Text>
          <TextInput
            style={styles.input}
            placeholder="金額"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Button title="保存" onPress={toggleModal} />
          <Button title="キャンセル" onPress={toggleModal} />
        </View>
      </Modal>

      <Text style={styles.selectedDate}>
        選択された日付: {selectedDate || 'なし'}
      </Text>
    </View>
  );
};

const App = () => {
  return (
    <View style={styles.container}>
      <CalendarArea />
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>月間</Text>
        <Text style={styles.summaryText}>予算: 135,000</Text>
        <Text style={styles.summaryText}>支出: 53,776</Text>
        <Text style={styles.summaryText}>残高: 81,224</Text>
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
});

export default App;