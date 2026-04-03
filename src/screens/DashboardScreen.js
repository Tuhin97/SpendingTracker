import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useLimits } from '../hooks/useLimits';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

export default function DashboardScreen() {
  const { transactions, getWeeklyTotal, getWeeklyCredits } = useTransactions();
  const { limit, savingsGoal } = useLimits();

  const weeklySpent = getWeeklyTotal();
  const weeklyEarned = getWeeklyCredits();
  const remaining = (limit ?? 0) - weeklySpent;
  const savedSoFar = weeklyEarned - weeklySpent;
  const progress = limit ? (weeklySpent / limit) * 100 : 0;
  const recentTransactions = transactions.slice(0, 5);

  useFocusEffect(
    useCallback(() => {
      // screen is focused, data refreshes automatically
      // because hooks re-read from AsyncStorage
    }, [])
  );

    return (
    <ScrollView style={styles.container}>
      
      <Text style={styles.title}>💰 Spending Tracker</Text>
      <Text style={styles.week}>Week of {formatDate(new Date().toISOString())}</Text>

      <View style={styles.card}>
        <Text style={styles.row}>Earned:    {formatCurrency(weeklyEarned)}</Text>
        <Text style={styles.row}>Spent:     {formatCurrency(weeklySpent)}</Text>
        <Text style={styles.row}>Limit:     {formatCurrency(limit ?? 0)}</Text>
        <Text style={styles.row}>Remaining: {formatCurrency(remaining)}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, 
            { width: `${Math.min(progress, 100)}%`,
              backgroundColor: progress >= 100 ? '#e53935' : progress >= 80 ? '#fb8c00' : '#43a047'
            }]} 
          />
        </View>
        <Text style={styles.progressLabel}>{Math.round(progress)}% of limit</Text>
        {progress >= 100 && <Text style={styles.danger}>🚨 Over limit!</Text>}
        {progress >= 80 && progress < 100 && <Text style={styles.warning}>⚠️ Warning: only {formatCurrency(remaining)} left!</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.row}>Savings Goal:  {formatCurrency(savingsGoal ?? 0)}</Text>
        <Text style={styles.row}>Saved so far:  {formatCurrency(savedSoFar)}</Text>
        {savedSoFar >= (savingsGoal ?? 0) 
          ? <Text style={styles.success}>✅ Goal reached!</Text>
          : <Text style={styles.warning}>⚠️ Not there yet</Text>
        }
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length === 0 
          ? <Text style={styles.empty}>No transactions yet</Text>
          : recentTransactions.map(txn => (
            <View key={txn.id} style={styles.txnRow}>
              <Text style={styles.txnMerchant}>{txn.merchant}</Text>
              <Text style={[styles.txnAmount, { color: txn.type === 'credit' ? '#43a047' : '#e53935' }]}>
                {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
              </Text>
            </View>
          ))
        }
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 40,
    marginBottom: 4,
  },
  week: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  row: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  txnMerchant: {
    fontSize: 16,
    color: '#212121',
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  warning: {
    color: '#fb8c00',
    fontSize: 14,
    marginTop: 8,
  },
  danger: {
    color: '#e53935',
    fontSize: 14,
    marginTop: 8,
  },
  success: {
    color: '#43a047',
    fontSize: 14,
    marginTop: 8,
  },
  empty: {
    color: '#9e9e9e',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
