/**
 * DashboardScreen.js
 *
 * The main screen the user sees first. Shows a real-time summary of:
 *   - Money earned and spent this pay week (since last Tuesday)
 *   - Weekly spend limit and how much is remaining
 *   - A colour-coded progress bar (green → yellow → red)
 *   - Savings goal status
 *   - The 5 most recent transactions
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../hooks/useTransactions';
import { useLimits } from '../hooks/useLimits';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

export default function DashboardScreen() {
  const { transactions, load, getWeeklyTotal, getWeeklyCredits } = useTransactions();
  const { limit, savingsGoal, loadLimits } = useLimits();

  const weeklySpent = getWeeklyTotal();
  const weeklyEarned = getWeeklyCredits();
  const remaining = (limit ?? 0) - weeklySpent;
  const savedSoFar = weeklyEarned - weeklySpent;
  const progress = limit ? (weeklySpent / limit) * 100 : 0;
  const recentTransactions = transactions.slice(0, 5);
  const progressColor = progress >= 100 ? '#e53935' : progress >= 80 ? '#fb8c00' : '#43a047';

  useFocusEffect(
    useCallback(() => {
      load();
      loadLimits();
    }, [])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Purple header with big spend amount */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SpendingTracker</Text>
        <Text style={styles.headerSub}>Week of {formatDate(new Date().toISOString())}</Text>
        <Text style={styles.headerAmount}>{formatCurrency(weeklySpent)}</Text>
        <Text style={styles.headerLabel}>spent this week</Text>
      </View>

      {/* Three mini summary cards in a row */}
      <View style={styles.row}>
        <View style={[styles.miniCard, { borderLeftColor: '#43a047' }]}>
          <Ionicons name="arrow-down-circle" size={22} color="#43a047" />
          <Text style={styles.miniAmount}>{formatCurrency(weeklyEarned)}</Text>
          <Text style={styles.miniLabel}>Earned</Text>
        </View>
        <View style={[styles.miniCard, { borderLeftColor: '#e53935' }]}>
          <Ionicons name="arrow-up-circle" size={22} color="#e53935" />
          <Text style={styles.miniAmount}>{formatCurrency(weeklySpent)}</Text>
          <Text style={styles.miniLabel}>Spent</Text>
        </View>
        <View style={[styles.miniCard, { borderLeftColor: '#1565c0' }]}>
          <Ionicons name="cash" size={22} color="#1565c0" />
          <Text style={styles.miniAmount}>{formatCurrency(remaining)}</Text>
          <Text style={styles.miniLabel}>Remaining</Text>
        </View>
      </View>

      {/* Spend limit progress bar */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="speedometer-outline" size={20} color="#6200ee" />
          <Text style={styles.cardTitle}>Spend Limit</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: progressColor,
          }]} />
        </View>
        <View style={styles.progressMeta}>
          <Text style={[styles.progressPct, { color: progressColor }]}>
            {Math.round(progress)}%
          </Text>
          <Text style={styles.progressLimit}>of {formatCurrency(limit ?? 0)}</Text>
        </View>
        {progress >= 100 && (
          <View style={styles.alertBadge}>
            <Ionicons name="warning" size={16} color="#ffffff" />
            <Text style={styles.alertText}>Over limit!</Text>
          </View>
        )}
        {progress >= 80 && progress < 100 && (
          <View style={[styles.alertBadge, { backgroundColor: '#fb8c00' }]}>
            <Ionicons name="alert-circle" size={16} color="#ffffff" />
            <Text style={styles.alertText}>Only {formatCurrency(remaining)} left</Text>
          </View>
        )}
      </View>

      {/* Savings goal card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up-outline" size={20} color="#6200ee" />
          <Text style={styles.cardTitle}>Savings Goal</Text>
        </View>
        <View style={styles.savingsRow}>
          <View>
            <Text style={styles.savingsValue}>{formatCurrency(savedSoFar)}</Text>
            <Text style={styles.savingsLabel}>saved so far</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.savingsValue}>{formatCurrency(savingsGoal ?? 0)}</Text>
            <Text style={styles.savingsLabel}>goal</Text>
          </View>
        </View>
        {savedSoFar >= (savingsGoal ?? 0) ? (
          <View style={[styles.alertBadge, { backgroundColor: '#43a047' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
            <Text style={styles.alertText}>Goal reached!</Text>
          </View>
        ) : (
          <View style={[styles.alertBadge, { backgroundColor: '#9e9e9e' }]}>
            <Ionicons name="time-outline" size={16} color="#ffffff" />
            <Text style={styles.alertText}>{formatCurrency((savingsGoal ?? 0) - savedSoFar)} to go</Text>
          </View>
        )}
      </View>

      {/* Recent transactions */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="receipt-outline" size={20} color="#6200ee" />
          <Text style={styles.cardTitle}>Recent Transactions</Text>
        </View>
        {recentTransactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet</Text>
        ) : (
          recentTransactions.map(txn => (
            <View key={txn.id} style={styles.txnRow}>
              <View style={[styles.txnIcon, { backgroundColor: txn.type === 'credit' ? '#e8f5e9' : '#ffebee' }]}>
                <Ionicons
                  name={txn.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={txn.type === 'credit' ? '#43a047' : '#e53935'}
                />
              </View>
              <Text style={styles.txnMerchant} numberOfLines={1}>{txn.merchant}</Text>
              <Text style={[styles.txnAmount, { color: txn.type === 'credit' ? '#43a047' : '#e53935' }]}>
                {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
              </Text>
            </View>
          ))
        )}
      </View>

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
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    color: '#ce93d8',
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 13,
    color: '#ce93d8',
    marginBottom: 12,
  },
  headerAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerLabel: {
    fontSize: 14,
    color: '#ce93d8',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    borderLeftWidth: 4,
  },
  miniAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 6,
  },
  miniLabel: {
    fontSize: 11,
    color: '#9e9e9e',
    marginTop: 2,
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
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  progressTrack: {
    height: 14,
    backgroundColor: '#eeeeee',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPct: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressLimit: {
    fontSize: 13,
    color: '#9e9e9e',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  alertText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  savingsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
  },
  savingsLabel: {
    fontSize: 12,
    color: '#9e9e9e',
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#eeeeee',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 10,
  },
  txnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnMerchant: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  empty: {
    color: '#9e9e9e',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
