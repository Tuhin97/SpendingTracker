import { View, Text, StyleSheet } from 'react-native';

export default function TransactionHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text>Transaction History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
