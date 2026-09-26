import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function NewsCard({ article }) {
  const handlePress = async () => {
    if (article.url) {
      await WebBrowser.openBrowserAsync(article.url);
    }
  };

  const formattedDate = article.published_date
    ? new Date(article.published_date).toLocaleDateString()
    : 'Recent';

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={handlePress}>
      {article.image_url ? (
        <Image source={{ uri: article.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>NewsPulse</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.source}>{article.source}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        {article.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {article.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  content: {
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  source: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
