import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, FlatList, ScrollView, TouchableOpacity, Image, Modal,
  ActivityIndicator, RefreshControl, StyleSheet, StatusBar, Dimensions, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { getHeadlines } from './src/api/newsApi';

const { width } = Dimensions.get('window');
const AD_UNIT = __DEV__ ? TestIds.BANNER : 'ca-app-pub-6509298197152386/1259197573';

const STRINGS = {
  hi: {
    title: 'द ऑक्स न्यूज़', mustRead: 'ज़रूर पढ़ें', ticker: 'लाइव वायर: हजारों रियल-टाइम बहुभाषी अपडेट्स।',
    sectionsTitle: 'सेक्शंस', signInPrompt: 'अपनी रीडिंग सेव करने के लिए साइन इन करें',
    signInBtn: 'साइन इन →', unlockTitle: 'एक टैप। सब कुछ अनलॉक करें।', email: 'ईमेल',
    googleSign: 'गूगल लॉगिन', close: 'बंद करें', back: 'वापस जाएं',
    tabs: { feed: 'न्यूज़फ़ीड', markets: 'बाज़ार', city: 'शहर', explore: 'एक्सप्लोर' },
    cats: { India: 'भारत', World: 'विश्व', Sports: 'खेल', Entertainment: 'मनोरंजन', Business: 'व्यापार', Technology: 'तकनीक' }
  }
};
const SECTIONS = ['India', 'World', 'Sports', 'Entertainment', 'Business', 'Technology'];
const CITIES = ['Delhi', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan'];

export default function App() {
  const t = STRINGS['hi'];
  const [activeTab, setActiveTab] = useState('newsfeed');
  const [activeCategory, setActiveCategory] = useState('India');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [webViewModal, setWebViewModal] = useState({ visible: false, url: '', title: '' });

  useEffect(() => {
    mobileAds().initialize();
    GoogleSignin.configure({
      webClientId: '564274906544-js8lgcnmo5cn2vhvfnf67f6upph1n3i2.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    let query = activeTab === 'city' ? selectedCity : activeCategory;
    const data = await getHeadlines(query, 'hi');
    setArticles(data || []);
    setLoading(false); setRefreshing(false);
  }, [activeTab, activeCategory, selectedCity]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const handleRealGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setCurrentUser(userInfo.user);
      setAuthModalOpen(false);
    } catch (error) {
      let errorMsg = `Code: ${error.code}\nMessage: ${error.message}`;
      if (error.code === '10' || String(error.message).includes('DEVELOPER_ERROR')) {
         errorMsg = 'SHA-1 Mismatch Error: Please verify Google Services configuration.';
      }
      Alert.alert('Google Sign-In Error', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />
      <View style={styles.header}>
        <Text style={styles.mastheadTitle}>{t.title}</Text>
        <TouchableOpacity onPress={() => setAuthModalOpen(true)}>
          <Ionicons name="person-circle-outline" size={28} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {SECTIONS.map(sec => (
            <TouchableOpacity key={sec} style={[styles.categoryTab, activeCategory === sec && styles.categoryTabActive]} onPress={() => {setActiveCategory(sec); setActiveTab('newsfeed');}}>
              <Text style={[styles.categoryTabText, activeCategory === sec && styles.categoryTabTextActive]}>{t.cats[sec]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerBox}><ActivityIndicator size="large" color="#DC2626" /></View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFeed} />}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={index === 0 ? styles.leadCard : styles.compactCard} onPress={() => setWebViewModal({ visible: true, url: item.url, title: item.title })}>
              {index === 0 && item.image_url && <Image source={{ uri: item.image_url }} style={styles.leadImage} />}
              <Text style={index === 0 ? styles.leadTitle : styles.compactTitle}>{item.title}</Text>
              {index !== 0 && item.image_url && <Image source={{ uri: item.image_url }} style={styles.compactThumb} />}
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.admobContainer}>
        <BannerAd unitId={AD_UNIT} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
      </View>

      <Modal visible={authModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>{t.unlockTitle}</Text>
            <TouchableOpacity style={styles.googleBtn} onPress={handleRealGoogleLogin}>
              <Text style={styles.googleBtnText}>{t.googleSign}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAuthModalOpen(false)} style={{marginTop: 15}}>
              <Text style={{textAlign: 'center', color: '#64748B'}}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={webViewModal.visible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setWebViewModal({ visible: false, url: '', title: '' })} style={styles.readerBackBtn}>
            <Text style={styles.readerBackText}>{t.back}</Text>
          </TouchableOpacity>
          {webViewModal.url ? <WebView source={{ uri: webViewModal.url }} /> : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF8F5' },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  mastheadTitle: { fontSize: 19, fontWeight: '900', color: '#000' },
  categoryScrollWrapper: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  categoryScroll: { paddingHorizontal: 14, paddingVertical: 10 },
  categoryTab: { marginRight: 20, paddingBottom: 4 },
  categoryTabActive: { borderBottomWidth: 2, borderBottomColor: '#DC2626' },
  categoryTabText: { fontSize: 14, color: '#64748B', fontWeight: '700' },
  categoryTabTextActive: { color: '#000' },
  leadCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  leadTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 8 },
  leadImage: { width: '100%', height: 210, borderRadius: 8 },
  compactCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between' },
  compactTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B', paddingRight: 10 },
  compactThumb: { width: 88, height: 66, borderRadius: 6 },
  admobContainer: { alignItems: 'center', paddingVertical: 2, backgroundColor: '#F8FAFC' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  authCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 12, width: '85%' },
  authTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  googleBtn: { backgroundColor: '#EA4335', padding: 12, borderRadius: 8, alignItems: 'center' },
  googleBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  readerBackBtn: { padding: 16, backgroundColor: '#F1F5F9' },
  readerBackText: { fontSize: 16, fontWeight: 'bold' }
});
