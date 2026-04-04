import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useLimits } from '../hooks/useLimits';

export default function SetLimitScreen() {
  const { limit, savingsGoal, setLimit, setSavingsGoal } = useLimits();

  const [limitInput, setLimitInput] = useState(limit ? String(limit) : '');
  const [savingsInput, setSavingsInput] = useState(savingsGoal ? String(savingsGoal) : '');
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    const limitValue = parseFloat(limitInput);
    const savingsValue = parseFloat(savingsInput);

    if (isNaN(limitValue) || limitValue <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a valid spend limit.');
      return;
    }

    if (isNaN(savingsValue) || savingsValue <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid savings goal.');
      return;
    }

    if (savingsValue >= limitValue) {
      Alert.alert('Invalid Goal', 'Savings goal must be less than your spend limit.');
      return;
    }

    await setLimit(limitValue);
    await setSavingsGoal(savingsValue);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }
  return (
      <View style={styles.container}>
        <Text style={styles.title}>Set Your Limits</Text>

        <Text style={styles.label}>Weekly Spend Limit ($)</Text>
        <TextInput
          style={styles.input}
          value={limitInput}
          onChangeText={setLimitInput}
          keyboardType="numeric"
          placeholder="e.g. 800"
        />

        <Text style={styles.label}>Weekly Savings Goal ($)</Text>
        <TextInput
          style={styles.input}
          value={savingsInput}
          onChangeText={setSavingsInput}
          keyboardType="numeric"
          placeholder="e.g. 200"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        {saved && <Text style={styles.success}>✅ Saved successfully!</Text>}

      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 40,
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#212121',
    marginBottom: 24,
    elevation: 2,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  success: {
    color: '#43a047',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
});
