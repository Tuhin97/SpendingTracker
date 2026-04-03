import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState({ message = 'No transactions yet.' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#9e9e9e', fontSize: 16 },
});
