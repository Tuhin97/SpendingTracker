/**
 * TransactionHistoryScreen.js
 *
 * Shows the full list of all transactions with a filter bar at the top.
 * Filters: All | Debits | Credits
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

export default function TransactionHistoryScreen() {
  const { transactions, load } = useTransactions();
  const [filter, setFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const filtered = transactions.filter(txn => {
    if (filter === 'debits') return txn.type === 'debit';
    if (filter === 'credits') return txn.type === 'credit';
    return true;
  });

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <Text style={styles.headerSub}>{filtered.length} transactions</Text>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {['all', 'debits', 'credits'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}>
            <Ionicons
              name={f === 'all' ? 'list' : f === 'debits' ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={16}
              color={filter === f ? '#ffffff' : '#9e9e9e'}
            />
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#e0e0e0" />
            <Text style={styles.empty}>No transactions found</Text>
          </View>
        ) : (
          filtered.map(txn => (
            <View key={txn.id} style={styles.txnCard}>
              {/* Coloured icon circle */}
              <View style={[styles.txnIcon, {
                backgroundColor: txn.type === 'credit' ? '#e8f5e9' : '#ffebee'
              }]}>
                <Ionicons
                  name={txn.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={20}
                  color={txn.type === 'credit' ? '#43a047' : '#e53935'}
                />
              </View>

              {/* Merchant and date */}
              <View style={styles.txnInfo}>
                <Text style={styles.merchant}>{txn.merchant}</Text>
                <Text style={styles.date}>{formatDate(txn.date)}</Text>
              </View>

              {/* Amount */}
              <View style={styles.txnRight}>
                <Text style={[styles.amount, {
                  color: txn.type === 'credit' ? '#43a047' : '#e53935'
                }]}>
                  {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </Text>
                <Text style={styles.txnType}>
                  {txn.type === 'credit' ? 'Credit' : 'Debit'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

    </View>
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
    marginBottom: 16,
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  filterActive: {
    backgroundColor: '#6200ee',
  },
  filterText: {
    fontSize: 13,
    color: '#9e9e9e',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    elevation: 2,
    gap: 12,
  },
  txnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnInfo: {
    flex: 1,
  },
  merchant: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  txnType: {
    fontSize: 11,
    color: '#9e9e9e',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  empty: {
    color: '#9e9e9e',
    fontSize: 15,
  },
});
