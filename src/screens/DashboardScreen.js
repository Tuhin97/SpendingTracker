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