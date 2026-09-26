import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { getHeadlines } from './src/api/newsApi';
import CategoryBar from './src/components/CategoryBar';
import NewsCard from './src/components/NewsCard';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async (category = selectedCategory) => {
    try {
      setError(null);
      const data = await getHeadlines(category);
      setArticles(data);
    } catch (err) {
      setError('Unable to load feed from freenewsapi.ai.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    loadNews(selectedCategory);
  }, [selectedCategory, loadNews]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNews(selectedCategory);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.brand}>News<Text style={styles.brandAccent}>Pulse</Text></Text>
      </View>

      <CategoryBar
        selected={selectedCategory}
        onSelect={(cat) => setSelectedCategory(cat)}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => <NewsCard article={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No articles found for this topic.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  brandAccent: {
    color: '#2563EB',
  },
  list: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 15,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 15,
  },
});
