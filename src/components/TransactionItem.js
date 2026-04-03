import { View, Text, StyleSheet } from 'react-native';

export default function TransactionItem({ transaction }) {
  return (
    <View style={styles.row}>
      <Text>{transaction?.description}</Text>
      <Text>{transaction?.amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
});
