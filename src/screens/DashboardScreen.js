/**
 * DashboardScreen.js
 *
 * The main screen the user sees first. Shows a real-time summary of:
 *   - Money earned and spent this pay week (since last Tuesday)
 *   - Weekly spend limit and how much is remaining
 *   - A colour-coded progress bar (green → yellow → red)
 *   - Savings goal status
 *   - The 5 most recent transactions
 *
 * Uses useFocusEffect to reload data every time the user switches to this tab,
 * ensuring the dashboard is always fresh after new transactions or limit changes.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useEffect } from 'react';
import { sendLimitWarning } from '../utils/notifications';
import { useTransactions } from '../hooks/useTransactions';
import { useLimits } from '../hooks/useLimits';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

export default function DashboardScreen() {
  const { transactions, load, getWeeklyTotal, getWeeklyCredits } = useTransactions();
  const { limit, savingsGoal, loadLimits } = useLimits();

  // Derived values calculated from the current state
  const weeklySpent = getWeeklyTotal();
  const weeklyEarned = getWeeklyCredits();
  const remaining = (limit ?? 0) - weeklySpent;
  // Savings = what's left after spending (earned minus spent)
  const savedSoFar = weeklyEarned - weeklySpent;
  // Progress as a percentage of the limit (capped at 100% in the JSX below)
  const progress = limit ? (weeklySpent / limit) * 100 : 0;
  // Only show the 5 most recent transactions in the dashboard preview
  const recentTransactions = transactions.slice(0, 5);

  // Reload both transactions AND limits every time this tab comes into focus.
  // Without this, navigating away and back would show stale data.
  useFocusEffect(
    useCallback(() => {
      load();
      loadLimits();
    }, [])
  );
  
  // useRef tracks whether we've already sent each alert this session.
  // Without this, a notification would fire on every re-render once
  // the threshold is crossed (every tab switch, every new transaction).
  const notifiedRef = useRef({ warned: false, overlimit: false });

  useEffect(() => {
    // Don't fire if limit hasn't been set yet
    if (!limit || progress === 0) return;

    if (progress >= 100 && !notifiedRef.current.overlimit) {
      // Only send the over-limit alert once
      notifiedRef.current.overlimit = true;
      sendLimitWarning(weeklySpent, limit, true);
    } else if (progress >= 80 && progress < 100 && !notifiedRef.current.warned) {
      // Only send the 80% warning once
      notifiedRef.current.warned = true;
      sendLimitWarning(weeklySpent, limit, false);
    }

    // If spending drops back below 80% (e.g. after clearing data), reset the flags
    if (progress < 80) {
      notifiedRef.current = { warned: false, overlimit: false };
    }
  }, [progress, limit]); // Re-evaluate whenever spending or limit changes

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>💰 Spending Tracker</Text>
      <Text style={styles.week}>Week of {formatDate(new Date().toISOString())}</Text>

      {/* Weekly summary card */}
      <View style={styles.card}>
        <Text style={styles.row}>Earned:    {formatCurrency(weeklyEarned)}</Text>
        <Text style={styles.row}>Spent:     {formatCurrency(weeklySpent)}</Text>
        <Text style={styles.row}>Limit:     {formatCurrency(limit ?? 0)}</Text>
        <Text style={styles.row}>Remaining: {formatCurrency(remaining)}</Text>
      </View>

      {/* Progress bar card
          - Green  below 80% of limit (on track)
          - Orange between 80–99% (getting close)
          - Red    at or above 100% (over limit)
          Math.min caps the bar width at 100% so it doesn't overflow */}
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

      {/* Savings goal card */}
      <View style={styles.card}>
        <Text style={styles.row}>Savings Goal:  {formatCurrency(savingsGoal ?? 0)}</Text>
        <Text style={styles.row}>Saved so far:  {formatCurrency(savedSoFar)}</Text>
        {savedSoFar >= (savingsGoal ?? 0)
          ? <Text style={styles.success}>✅ Goal reached!</Text>
          : <Text style={styles.warning}>⚠️ Not there yet</Text>
        }
      </View>

      {/* Recent transactions preview (last 5 only — full list is in History tab) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length === 0
          ? <Text style={styles.empty}>No transactions yet</Text>
          : recentTransactions.map(txn => (
            <View key={txn.id} style={styles.txnRow}>
              <Text style={styles.txnMerchant}>{txn.merchant}</Text>
              {/* Credits shown in green with +, debits in red with - */}
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
