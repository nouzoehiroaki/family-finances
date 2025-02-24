import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Calendar } from "react-native-calendars";

// デバイスの幅を取得して、曜日と日付の幅を統一
const screenWidth = Dimensions.get('window').width;
const dayWidth = screenWidth / 8; // 7列で均等割り

// 曜日リスト
const days = ['日', '月', '火', '水', '木', '金', '土'];

// 現在の年月を取得
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // JavaScriptの月は0始まりなので+1する

// カレンダーの日付データを生成
const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 月の開始曜日
  const lastDate = new Date(year, month, 0).getDate(); // 月の最終日
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate(); // 前月の最終日

  let nextMonthStart = 1;
  let daysArray: { date: number | null; isCurrentMonth: boolean; income?: number; expense?: number }[] = [];

  // 前月の日付を追加
  for (let i = firstDay - 1; i >= 0; i--) {
    daysArray.push({ date: prevMonthLastDate - i, isCurrentMonth: false });
  }

  // 当月の日付を追加（収支情報も仮データで設定）
  for (let i = 1; i <= lastDate; i++) {
    daysArray.push({
      date: i,
      isCurrentMonth: true,
      income: i % 5 === 0 ? Math.floor(Math.random() * 20000) : 0, // 5日ごとにランダム収入
      expense: i % 3 === 0 ? Math.floor(Math.random() * 10000) : 0, // 3日ごとにランダム支出
    });
  }

  // 翌月の日付を追加して、合計42マス（7×6）に調整
  while (daysArray.length % 7 !== 0) {
    daysArray.push({ date: nextMonthStart++, isCurrentMonth: false });
  }

  return daysArray;
};

// カレンダーコンポーネント
const CalendarArea = () => {
  // const calendarDays = getCalendarDays(currentYear, currentMonth);
  // const renderDay = ({ item }: { item: { date: number | null; isCurrentMonth: boolean; income?: number; expense?: number } }) => (
  //   <View style={[styles.dayContainer, item.isCurrentMonth ? styles.currentMonth : styles.otherMonth]}>
  //     <Text style={styles.dayText}>{item.date}</Text>
  //     {item.isCurrentMonth && (
  //       <View>
  //         {item.income ? <Text style={styles.incomeText}>{item.income.toLocaleString()}</Text> : null}
  //         {item.expense ? <Text style={styles.expenseText}>{item.expense.toLocaleString()}</Text> : null}
  //       </View>
  //     )}
  //   </View>
  // );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  return (
    <View style={styles.calendarContainer}>
      <Text style={styles.monthText}>{currentYear}年{currentMonth}月</Text>
      {/* カレンダーを表示 */}
      <Calendar
        onDayPress={(day: { dateString: React.SetStateAction<string | null>; }) => setSelectedDate(day.dateString)}
        markedDates={
          selectedDate
            ? { [selectedDate]: { selected: true, marked: true } }
            : {}
        }
        theme={{
          selectedDayBackgroundColor: "#00adf5",
          todayTextColor: "#00adf5",
        }}
      />

      {/* 選択された日付の表示 */}
      <Text style={styles.selectedDate}>
        選択された日付: {selectedDate || "なし"}
      </Text>
    </View>
  );
};

// メインコンポーネント
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

// スタイル
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5dc',
  },
  calendarContainer: {
    marginBottom: 20,
    overflowX: 'scroll',
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
    textAlign: "center",
  },
  // dayContainer: {
  //   width: dayWidth,
  //   height: dayWidth,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   margin: 2,
  // },
  // currentMonth: {
  //   backgroundColor: '#fff',
  // },
  // otherMonth: {
  //   backgroundColor: '#ddd',
  // },
  // dayText: {
  //   fontSize: 16,
  // },
  // incomeText: {
  //   fontSize: 12,
  //   color: 'blue',
  // },
  // expenseText: {
  //   fontSize: 12,
  //   color: 'red',
  // },
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
