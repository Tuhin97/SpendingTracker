import { View, Text, StyleSheet } from 'react-native';

export default function SetLimitScreen() {
  return (
    <View style={styles.container}>
      <Text>Set Limit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
