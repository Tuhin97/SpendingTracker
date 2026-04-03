import { View, StyleSheet } from 'react-native';

export default function LimitProgressBar({ spent = 0, limit = 1 }) {
  const progress = Math.min(spent / limit, 1);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { flex: progress }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, flexDirection: 'row' },
  fill: { backgroundColor: '#4caf50', borderRadius: 5 },
});
