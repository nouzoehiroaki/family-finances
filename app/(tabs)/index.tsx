import CalendarArea from '@/components/CalendarArea';
import { View, Text, StyleSheet } from 'react-native';


const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

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