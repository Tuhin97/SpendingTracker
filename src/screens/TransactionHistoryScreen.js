import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

export default function TransactionHistoryScreen() {
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState('all');

  const filtered = transactions.filter(txn => {
    if (filter === 'debits') return txn.type === 'debit';
    if (filter === 'credits') return txn.type === 'credit';
    return true;
  });

    return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'all' && styles.filterActive]} 
          onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'debits' && styles.filterActive]} 
          onPress={() => setFilter('debits')}>
          <Text style={[styles.filterText, filter === 'debits' && styles.filterTextActive]}>Debits</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'credits' && styles.filterActive]} 
          onPress={() => setFilter('credits')}>
          <Text style={[styles.filterText, filter === 'credits' && styles.filterTextActive]}>Credits</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {filtered.length === 0
          ? <Text style={styles.empty}>No transactions found</Text>
          : filtered.map(txn => (
            <View key={txn.id} style={styles.txnRow}>
              <View>
                <Text style={styles.merchant}>{txn.merchant}</Text>
                <Text style={styles.date}>{formatDate(txn.date)}</Text>
              </View>
              <Text style={[styles.amount, { color: txn.type === 'credit' ? '#43a047' : '#e53935' }]}>
                {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
              </Text>
            </View>
          ))
        }
      </ScrollView>

    </View>
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
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    elevation: 1,
  },
  filterActive: {
    backgroundColor: '#6200ee',
  },
  filterText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
  },
  merchant: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#757575',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  empty: {
    color: '#9e9e9e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
});
