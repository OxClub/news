import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, FlatList, ScrollView, TouchableOpacity, Image, Modal,
  ActivityIndicator, RefreshControl, StyleSheet, StatusBar, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getHeadlines } from './src/api/newsApi';

const { width } = Dimensions.get('window');
const AD_UNIT = __DEV__ ? TestIds.BANNER : 'ca-app-pub-6509298197152386/1259197573';

const STRINGS = {
  hi: {
    appName: 'द ऑक्स न्यूज़', liveLabel: 'LIVE', tickerText: 'दुनिया भर की ताज़ा और ब्रेकिंग खबरें, सीधे आपके फोन पर।',
    home: 'होम', state: 'राज्य', explore: 'एक्सप्लोर', guest: 'गेस्ट यूज़र', login: 'गूगल से लॉगिन करें', 
    logout: 'लॉगआउट करें', close: 'बंद करें', back: 'वापस', allCats: 'सभी कैटेगरीज', langToggle: 'ENG'
  },
  en: {
    appName: 'THE OX NEWS', liveLabel: 'LIVE', tickerText: 'Latest breaking news from around the world, right on your phone.',
    home: 'Home', state: 'State', explore: 'Explore', guest: 'Guest User', login: 'Login with Google', 
    logout: 'Logout', close: 'Close', back: 'Back', allCats: 'All Categories', langToggle: 'हिंदी'
  }
};

const CATEGORIES = {
  hi: [
    { id: 'breaking', name: 'ब्रेकिंग न्यूज़', query: 'Latest Breaking News India' },
    { id: 'india', name: 'भारत', query: 'India News' },
    { id: 'world', name: 'दुनिया संसार', query: 'World News' },
    { id: 'entertainment', name: 'मनोरंजन', query: 'Bollywood Entertainment' },
    { id: 'movies', name: 'मूवीज', query: 'New Movies Reviews' },
    { id: 'webseries', name: 'वेब सीरीज', query: 'Web Series OTT' },
    { id: 'tech', name: 'तकनीक', query: 'Technology News' },
    { id: 'cyber', name: 'साइबर सिक्योरिटी', query: 'Cyber Security Hacks' },
    { id: 'gaming', name: 'गेमिंग', query: 'Video Games Esports' },
    { id: 'sports', name: 'खेल', query: 'Sports Cricket Football' },
  ],
  en: [
    { id: 'breaking', name: 'Breaking News', query: 'Latest Breaking News India' },
    { id: 'india', name: 'India', query: 'India News' },
    { id: 'world', name: 'World', query: 'World News' },
    { id: 'entertainment', name: 'Entertainment', query: 'Bollywood Entertainment' },
    { id: 'movies', name: 'Movies', query: 'New Movies Reviews' },
    { id: 'webseries', name: 'Web Series', query: 'Web Series OTT' },
    { id: 'tech', name: 'Technology', query: 'Technology News' },
    { id: 'cyber', name: 'Cyber Security', query: 'Cyber Security Hacks' },
    { id: 'gaming', name: 'Gaming', query: 'Video Games Esports' },
    { id: 'sports', name: 'Sports', query: 'Sports Cricket Football' },
  ]
};

const STATES = ['Delhi', 'Bihar', 'UP', 'Maharashtra', 'Rajasthan', 'Jharkhand', 'MP', 'Gujarat'];

export default function App() {
  const [lang, setLang] = useState('hi');
  const t = STRINGS[lang];
  
  const [activeTab, setActiveTab] = useState('home');
  const [activeCatId, setActiveCatId] = useState('breaking');
  const [selectedState, setSelectedState] = useState('Bihar');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [webViewModal, setWebViewModal] = useState({ visible: false, url: '', title: '' });

  useEffect(() => {
    mobileAds().initialize();
    GoogleSignin.configure({
      webClientId: '564274906544-js8lgcnmo5cn2vhvfnf67f6upph1n3i2.apps.googleusercontent.com',
      offlineAccess: true,
    });
    checkLoginState();
  }, []);

  const checkLoginState = async () => {
    const session = await AsyncStorage.getItem('@ox_user');
    if (session) setCurrentUser(JSON.parse(session));
  };

  const loadFeed = useCallback(async () => {
    setLoading(true);
    const currentCategory = CATEGORIES[lang].find(c => c.id === activeCatId);
    let query = activeTab === 'state' ? selectedState + ' News' : currentCategory.query;
    const data = await getHeadlines(query, lang);
    setArticles(data || []);
    setLoading(false); setRefreshing(false);
  }, [activeTab, activeCatId, selectedState, lang]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'hi' ? 'en' : 'hi');
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      await AsyncStorage.setItem('@ox_user', JSON.stringify(userInfo.user));
      setCurrentUser(userInfo.user);
      setDrawerOpen(false);
    } catch (error) {
      Alert.alert('Login Error', 'Unable to login. Please try again.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@ox_user');
    setCurrentUser(null);
    try { await GoogleSignin.signOut(); } catch(e) {}
  };

  const renderDrawer = () => (
    <Modal visible={drawerOpen} transparent animationType="fade">
      <View style={styles.drawerBackdrop}>
        <View style={styles.drawerContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profileBox}>
              <Ionicons name="person-circle" size={50} color="#DC2626" />
              {currentUser ? (
                <View style={{marginLeft: 10}}>
                  <Text style={styles.profileName} numberOfLines={1}>{currentUser.name}</Text>
                  <Text style={styles.profileEmail} numberOfLines={1}>{currentUser.email}</Text>
                  <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>{t.logout}</Text></TouchableOpacity>
                </View>
              ) : (
                <View style={{marginLeft: 10}}>
                  <Text style={styles.profileName}>{t.guest}</Text>
                  <TouchableOpacity style={styles.loginBtn} onPress={handleGoogleLogin}>
                    <Text style={styles.loginBtnText}>{t.login}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.drawerHeader}>{t.allCats}</Text>
            {CATEGORIES[lang].map(cat => (
              <TouchableOpacity key={cat.id} style={styles.drawerItem} onPress={() => { setActiveCatId(cat.id); setActiveTab('home'); setDrawerOpen(false); }}>
                <Ionicons name="chevron-forward" size={16} color="#64748B" style={{marginRight: 10}}/>
                <Text style={[styles.drawerItemText, activeCatId === cat.id && styles.drawerItemTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setDrawerOpen(false)}>
            <Text style={styles.drawerCloseText}>{t.close}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{flex: 1}} onPress={() => setDrawerOpen(false)} />
      </View>
    </Modal>
  );

  const currentCategoryName = CATEGORIES[lang].find(c => c.id === activeCatId)?.name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Premium Header with Translator */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.iconBtn}>
          <Ionicons name="menu" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.mastheadTitle}>{t.appName}</Text>
        <View style={styles.rightHeaderBox}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langSwitchBtn}>
            <Text style={styles.langSwitchText}>{t.langToggle}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDrawerOpen(true)}>
            <Ionicons name={currentUser ? "person" : "person-outline"} size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tickerBar}>
        <Text style={styles.tickerLabel}>{t.liveLabel}</Text>
        <Text style={styles.tickerText} numberOfLines={1}>{t.tickerText}</Text>
      </View>

      <View style={{flex: 1, backgroundColor: '#F8FAFC'}}>
        {activeTab === 'state' && (
          <View style={styles.stateSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {STATES.map(state => (
                <TouchableOpacity key={state} style={[styles.stateBtn, selectedState === state && styles.stateBtnActive]} onPress={() => setSelectedState(state)}>
                  <Text style={[styles.stateBtnText, selectedState === state && styles.stateBtnTextActive]}>{state}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <View style={styles.centerBox}><ActivityIndicator size="large" color="#DC2626" /></View>
        ) : (
          <FlatList
            data={articles}
            keyExtractor={item => item.id}
            contentContainerStyle={{paddingBottom: 20}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFeed} colors={['#DC2626']} />}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={index === 0 ? styles.leadCard : styles.compactCard} onPress={() => setWebViewModal({ visible: true, url: item.url, title: item.title })}>
                {index === 0 ? (
                  <>
                    <Image source={{ uri: item.image_url }} style={styles.leadImage} />
                    <View style={styles.leadContent}>
                      <Text style={styles.tagText}>{activeTab === 'state' ? selectedState : currentCategoryName}</Text>
                      <Text style={styles.leadTitle}>{item.title}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.compactContent}>
                      <Text style={styles.compactTitle} numberOfLines={3}>{item.title}</Text>
                      <Text style={styles.sourceText}>{item.source}</Text>
                    </View>
                    <Image source={{ uri: item.image_url }} style={styles.compactThumb} />
                  </>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <BannerAd unitId={AD_UNIT} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomTab} onPress={() => {setActiveTab('home'); setActiveCatId('breaking');}}>
          <Ionicons name="home" size={22} color={activeTab === 'home' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.bottomTabText, activeTab === 'home' && {color: '#DC2626', fontWeight: 'bold'}]}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setActiveTab('state')}>
          <Ionicons name="map" size={22} color={activeTab === 'state' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.bottomTabText, activeTab === 'state' && {color: '#DC2626', fontWeight: 'bold'}]}>{t.state}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setDrawerOpen(true)}>
          <Ionicons name="grid" size={22} color="#64748B" />
          <Text style={styles.bottomTabText}>{t.explore}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={webViewModal.visible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setWebViewModal({ visible: false, url: '', title: '' })} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="arrow-back" size={24} color="#000" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
          </View>
          {webViewModal.url ? <WebView source={{ uri: webViewModal.url }} /> : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#DC2626' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#DC2626' },
  mastheadTitle: { fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  rightHeaderBox: { flexDirection: 'row', alignItems: 'center' },
  langSwitchBtn: { backgroundColor: '#B91C1C', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: '#F87171' },
  langSwitchText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  tickerBar: { backgroundColor: '#1E293B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  tickerLabel: { backgroundColor: '#DC2626', color: '#FFF', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  tickerText: { color: '#F8FAFC', fontSize: 12, flex: 1 },
  stateSelector: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 6, elevation: 2, marginBottom: 4 },
  stateBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginHorizontal: 6 },
  stateBtnActive: { backgroundColor: '#DC2626' },
  stateBtnText: { color: '#475569', fontWeight: '600' },
  stateBtnTextActive: { color: '#FFF', fontWeight: 'bold' },
  leadCard: { backgroundColor: '#FFF', marginBottom: 8, elevation: 1 },
  leadImage: { width: '100%', height: 220 },
  leadContent: { padding: 16 },
  tagText: { color: '#DC2626', fontSize: 12, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' },
  leadTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', lineHeight: 28 },
  compactCard: { backgroundColor: '#FFF', flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  compactContent: { flex: 1, paddingRight: 12, justifyContent: 'center' },
  compactTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', lineHeight: 22 },
  sourceText: { fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: '600' },
  compactThumb: { width: 90, height: 75, borderRadius: 8 },
  bottomBar: { flexDirection: 'row', backgroundColor: '#FFF', height: 60, borderTopWidth: 1, borderTopColor: '#E2E8F0', justifyContent: 'space-around', alignItems: 'center' },
  bottomTab: { alignItems: 'center', flex: 1 },
  bottomTabText: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: '600' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' },
  drawerContent: { width: width * 0.75, backgroundColor: '#FFF', height: '100%' },
  profileBox: { backgroundColor: '#F8FAFC', padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', maxWidth: 180 },
  profileEmail: { fontSize: 12, color: '#64748B', maxWidth: 180 },
  loginBtn: { marginTop: 6, backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  loginBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  logoutText: { color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  drawerHeader: { padding: 16, fontSize: 14, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  drawerItemText: { fontSize: 16, color: '#334155', fontWeight: '600' },
  drawerItemTextActive: { color: '#DC2626', fontWeight: '800' },
  drawerCloseBtn: { padding: 16, backgroundColor: '#F1F5F9', alignItems: 'center' },
  drawerCloseText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  readerHeader: { height: 56, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  readerBackText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
