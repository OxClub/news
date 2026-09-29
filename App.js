import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, StatusBar, Linking, ScrollView 
} from 'react-native';
import CountrySelector from './CountrySelector';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState('in');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedLang, setSelectedLang] = useState('en'); // 'en' या 'hi'
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // सभी एडवांस्ड कैटेगरीज
  const categories = [
    { id: 'general', labelEn: 'Top News', labelHi: 'ब्रेकिंग न्यूज़' },
    { id: 'business', labelEn: 'Business', labelHi: 'व्यापार' },
    { id: 'technology', labelEn: 'Technology', labelHi: 'तकनीक' },
    { id: 'sports', labelEn: 'Sports', labelHi: 'खेल' },
    { id: 'entertainment', labelEn: 'Entertainment', labelHi: 'मनोरंजन' },
    { id: 'health', labelEn: 'Health', labelHi: 'स्वास्थ्य' }
  ];

  // न्यूज़ फेच करने का एडवांस्ड फंक्शन (लैंग्वेज और कंट्री के साथ)
  const fetchNews = async (country, category, lang) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.freenewsapi.ai/v1/latest?country=${country}&category=${category}&language=${lang}`);
      const data = await response.json();
      
      if (data && data.articles && data.articles.length > 0) {
        setNews(data.articles);
      } else if (data && data.results && data.results.length > 0) {
        setNews(data.results);
      } else {
        // फॉलबैक यदि डायरेक्ट डेटा न मिले
        const fallbackRes = await fetch(`https://api.freenewsapi.ai/v1/latest?language=${lang}`);
        const fallbackData = await fallbackRes.json();
        setNews(fallbackData.articles || fallbackData.results || []);
      }
    } catch (error) {
      setNews([
        { 
          title: lang === 'hi' ? `OX न्यूज़ लाइव (${country.toUpperCase()}) - कनेक्टेड` : `OX News Live Feed (${country.toUpperCase()})`, 
          description: lang === 'hi' ? 'शीर्ष खबरें देखने के लिए 212+ देशों में से अपना पसंदीदा देश चुनें।' : 'Explore top headlines and switch between 212+ countries instantly.',
          url: '' 
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews(selectedCountry, selectedCategory, selectedLang);
  }, [selectedCountry, selectedCategory, selectedLang]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#B71C1C" barStyle="light-content" />
      
      {/* मुख्य हेडर */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>OX NEWS</Text>
          <Text style={styles.headerSubtitle}>
            {selectedLang === 'hi' ? 'दुनिया भर की ताज़ा और ब्रेकिंग खबरें' : 'Global & Local Breaking News'}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          {/* भाषा बदलने का बटन (English/Hindi) */}
          <TouchableOpacity 
            style={styles.langBtn} 
            onPress={() => setSelectedLang(selectedLang === 'en' ? 'hi' : 'en')}
          >
            <Text style={styles.langBtnText}>{selectedLang === 'en' ? 'हिन्दी' : 'ENG'}</Text>
          </TouchableOpacity>

          {/* कंट्री सेलेक्टर बटन */}
          <TouchableOpacity 
            style={styles.countryBtn} 
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.countryBtnText}>🌍 {selectedCountry.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* यदि कंट्री सेलेक्टर खुला है */}
      {showCountryModal ? (
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedLang === 'hi' ? 'देश चुनें (212+ उपलब्ध)' : 'Select Country (212+)'}
            </Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Text style={styles.closeText}>✕ {selectedLang === 'hi' ? 'बंद करें' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
          <CountrySelector onSelectCountry={(code) => {
            setSelectedCountry(code);
            setShowCountryModal(false);
            fetchNews(code, selectedCategory, selectedLang);
          }} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* कैटेगरीज हॉरिजॉन्टल स्क्रॉल बार */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id}
                  style={[styles.catTab, selectedCategory === cat.id && styles.activeCatTab]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.catText, selectedCategory === cat.id && styles.activeCatText]}>
                    {selectedLang === 'hi' ? cat.labelHi : cat.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* न्यूज़ फीड लिस्ट */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#B71C1C" />
                <Text style={{ marginTop: 10, color: '#666' }}>
                  {selectedLang === 'hi' ? 'ताज़ा खबरें लोड हो रही हैं...' : 'Loading breaking news...'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={news}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.newsCard}
                    onPress={() => item.url && Linking.openURL(item.url)}
                  >
                    <Text style={styles.newsTitle}>{item.title || 'Breaking News Update'}</Text>
                    <Text style={styles.newsDesc} numberOfLines={3}>
                      {item.description || item.snippet || 'Click to read full article details...'}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  header: { 
    backgroundColor: '#B71C1C', 
    padding: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    elevation: 6
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 11, color: '#FFCDD2' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16 },
  langBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  countryBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16 },
  countryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#B71C1C' },
  closeText: { fontSize: 16, color: '#B71C1C', fontWeight: 'bold' },
  categoryContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8 },
  catScroll: { paddingHorizontal: 12, alignItems: 'center' },
  catTab: { paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#f1f1f1', borderRadius: 20, marginRight: 8 },
  activeCatTab: { backgroundColor: '#B71C1C' },
  catText: { fontSize: 14, color: '#444', fontWeight: '500' },
  activeCatText: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, padding: 12 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  newsCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  newsTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  newsDesc: { fontSize: 14, color: '#555', lineHeight: 20 }
});
