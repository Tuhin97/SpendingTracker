/**
 * SetLimitScreen.js
 *
 * Lets the user configure two values that drive the Dashboard:
 *
 *   Weekly Spend Limit  - the maximum they want to spend in a pay week.
 *                         The progress bar on the Dashboard tracks against this.
 *
 *   Weekly Savings Goal - how much they want to save. Must be less than
 *                         the spend limit (you can't save more than your limit).
 *                         The Dashboard shows whether this goal has been reached.
 *
 * Values are saved to AsyncStorage via useLimits() so they persist across
 * app restarts. The Dashboard reloads them on every tab focus via loadLimits().
 */

import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useLimits } from '../hooks/useLimits';

export default function SetLimitScreen() {
  const { limit, savingsGoal, setLimit, setSavingsGoal } = useLimits();

  // Pre-fill the inputs with whatever is already saved (if anything)
  const [limitInput, setLimitInput] = useState(limit ? String(limit) : '');
  const [savingsInput, setSavingsInput] = useState(savingsGoal ? String(savingsGoal) : '');

  // Controls the "✅ Saved successfully!" message — shows for 3 seconds after saving
  const [saved, setSaved] = useState(false);

  /**
   * handleSave
   *
   * Validates both inputs before saving. Rules:
   *   1. Spend limit must be a positive number
   *   2. Savings goal must be a positive number
   *   3. Savings goal must be LESS than the spend limit
   *      (e.g. limit $500, goal $200 — you save $200 by spending only $300)
   *
   * If all checks pass, both values are saved to AsyncStorage and a brief
   * success message is shown for 3 seconds.
   */
  async function handleSave() {
    const limitValue = parseFloat(limitInput);
    const savingsValue = parseFloat(savingsInput);

    // Check that the spend limit is a valid positive number
    if (isNaN(limitValue) || limitValue <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a valid spend limit.');
      return;
    }

    // Check that the savings goal is a valid positive number
    if (isNaN(savingsValue) || savingsValue <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid savings goal.');
      return;
    }

    // Savings goal must be less than the spend limit — otherwise there's
    // nothing left to spend, which doesn't make sense
    if (savingsValue >= limitValue) {
      Alert.alert('Invalid Goal', 'Savings goal must be less than your spend limit.');
      return;
    }

    // Persist both values to AsyncStorage via the useLimits hook
    await setLimit(limitValue);
    await setSavingsGoal(savingsValue);

    // Show the success message, then hide it after 3 seconds
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

      {/* Only rendered for 3 seconds after a successful save */}
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
