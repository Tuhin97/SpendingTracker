/**
 * SetLimitScreen.js
 *
 * Lets the user configure two values that drive the Dashboard:
 *
 *   Weekly Spend Limit  - the maximum they want to spend in a pay week.
 *   Weekly Savings Goal - how much they want to save.
 */

import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLimits } from '../hooks/useLimits';

export default function SetLimitScreen() {
  const { limit, savingsGoal, setLimit, setSavingsGoal } = useLimits();

  const [limitInput, setLimitInput] = useState(limit ? String(limit) : '');
  const [savingsInput, setSavingsInput] = useState(savingsGoal ? String(savingsGoal) : '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setError('');
    const limitValue = parseFloat(limitInput);
    const savingsValue = parseFloat(savingsInput);

    if (isNaN(limitValue) || limitValue <= 0) {
      setError('Please enter a valid spend limit.');
      return;
    }
    if (isNaN(savingsValue) || savingsValue <= 0) {
      setError('Please enter a valid savings goal.');
      return;
    }
    if (savingsValue >= limitValue) {
      setError('Savings goal must be less than your spend limit.');
      return;
    }

    await setLimit(limitValue);
    await setSavingsGoal(savingsValue);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set Your Limits</Text>
        <Text style={styles.headerSub}>Control your weekly spending and savings</Text>
      </View>

      {/* Spend Limit input card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="wallet-outline" size={22} color="#6200ee" />
          <Text style={styles.cardTitle}>Weekly Spend Limit</Text>
        </View>
        <Text style={styles.cardDesc}>
          The maximum you want to spend each week. The dashboard tracks your progress against this.
        </Text>
        <View style={styles.inputRow}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            style={styles.input}
            value={limitInput}
            onChangeText={setLimitInput}
            keyboardType="numeric"
            placeholder="e.g. 800"
            placeholderTextColor="#bdbdbd"
          />
        </View>
      </View>

      {/* Savings Goal input card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up-outline" size={22} color="#6200ee" />
          <Text style={styles.cardTitle}>Weekly Savings Goal</Text>
        </View>
        <Text style={styles.cardDesc}>
          How much you want to save this week. Must be less than your spend limit.
        </Text>
        <View style={styles.inputRow}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            style={styles.input}
            value={savingsInput}
            onChangeText={setSavingsInput}
            keyboardType="numeric"
            placeholder="e.g. 200"
            placeholderTextColor="#bdbdbd"
          />
        </View>
      </View>

      {/* Error message */}
      {error !== '' && (
        <View style={styles.errorBadge}>
          <Ionicons name="alert-circle" size={16} color="#ffffff" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#ffffff" />
        <Text style={styles.saveButtonText}>Save Limits</Text>
      </TouchableOpacity>

      {/* Success message */}
      {saved && (
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
          <Text style={styles.successText}>Saved successfully!</Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f7',
  },
  header: {
    backgroundColor: '#6200ee',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 13,
    color: '#ce93d8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  cardDesc: {
    fontSize: 13,
    color: '#9e9e9e',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  dollar: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ee',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    paddingVertical: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6200ee',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e53935',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#43a047',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  successText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
