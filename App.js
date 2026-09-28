import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView, View, Text, FlatList, ScrollView, TouchableOpacity, Image, Modal,
  StyleSheet, StatusBar, Dimensions, Animated, TextInput, Platform, Share, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getHeadlines } from './src/api/newsApi';

const { width, height } = Dimensions.get('window');
const AD_UNIT = __DEV__ ? TestIds.BANNER : 'ca-app-pub-6509298197152386/1259197573';

const STRINGS = {
  hi: {
    appName: 'द ऑक्स न्यूज़', liveLabel: 'LIVE', tickerText: 'दुनिया भर की ताज़ा और ब्रेकिंग खबरें, सीधे आपके फोन पर।',
    home: 'होम', shorts: 'शॉर्ट्स', state: 'राज्य', search: 'खोजें', searchHint: 'कोई भी विषय या खबर खोजें...', 
    close: 'बंद करें', back: 'वापस', allCats: 'सभी कैटेगरीज', langToggle: 'ENG', readMore: 'पूरी खबर पढ़ें',
    shareText: 'द ऑक्स न्यूज़ ऐप डाउनलोड करें: दुनिया की ताज़ा खबरें सीधे आपके फोन पर! अभी इंस्टॉल करें।'
  },
  en: {
    appName: 'THE OX NEWS', liveLabel: 'LIVE', tickerText: 'Latest breaking news from around the world, right on your phone.',
    home: 'Home', shorts: 'Shorts', state: 'State', search: 'Search', searchHint: 'Search topics or news...', 
    close: 'Close', back: 'Back', allCats: 'All Categories', langToggle: 'हिंदी', readMore: 'Read Full Story',
    shareText: 'Download OX News app: Latest news right on your phone! Install now.'
  }
};

const CATEGORIES = {
  hi: [
    { id: 'breaking', name: 'ब्रेकिंग न्यूज़', query: 'ताज़ा खबर', icon: 'flame' },
    { id: 'india', name: 'भारत', query: 'भारत समाचार', icon: 'location' },
    { id: 'world', name: 'दुनिया संसार', query: 'अंतरराष्ट्रीय न्यूज़', icon: 'earth' },
    { id: 'entertainment', name: 'मनोरंजन', query: 'बॉलीवुड न्यूज़', icon: 'film' },
    { id: 'tech', name: 'तकनीक', query: 'टेक्नोलॉजी न्यूज़', icon: 'hardware-chip' },
    { id: 'sports', name: 'खेल', query: 'क्रिकेट समाचार', icon: 'trophy' },
  ],
  en: [
    { id: 'breaking', name: 'Breaking News', query: 'Latest Breaking News India', icon: 'flame' },
    { id: 'india', name: 'India', query: 'India News', icon: 'location' },
    { id: 'world', name: 'World', query: 'World News', icon: 'earth' },
    { id: 'entertainment', name: 'Entertainment', query: 'Bollywood Entertainment', icon: 'film' },
    { id: 'tech', name: 'Technology', query: 'Technology News', icon: 'hardware-chip' },
    { id: 'sports', name: 'Sports', query: 'Sports Cricket Football', icon: 'trophy' },
  ]
};

const STATES = [
  { id: 'delhi', hi: 'दिल्ली', en: 'Delhi', qHi: 'दिल्ली न्यूज़', qEn: 'Delhi News' },
  { id: 'bihar', hi: 'बिहार', en: 'Bihar', qHi: 'बिहार न्यूज़', qEn: 'Bihar News' },
  { id: 'up', hi: 'उत्तर प्रदेश', en: 'UP', qHi: 'उत्तर प्रदेश न्यूज़', qEn: 'UP News' },
  { id: 'maharashtra', hi: 'महाराष्ट्र', en: 'Maharashtra', qHi: 'महाराष्ट्र न्यूज़', qEn: 'Maharashtra News' }
];

const ShimmerCard = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.shimmerCard, { opacity }]}>
      <View style={styles.shimmerImg} />
      <View style={styles.shimmerText1} />
      <View style={styles.shimmerText2} />
    </Animated.View>
  );
};

export default function App() {
  const [lang, setLang] = useState('hi');
  const t = STRINGS[lang];
  const [activeTab, setActiveTab] = useState('home');
  const [activeCatId, setActiveCatId] = useState('breaking');
  const [selectedStateId, setSelectedStateId] = useState('bihar');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [webViewModal, setWebViewModal] = useState({ visible: false, url: '', title: '' });

  useEffect(() => { mobileAds().initialize(); }, []);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    let query = '';
    if (activeTab === 'search') {
      query = searchQuery || (lang === 'hi' ? 'ताज़ा खबर' : 'Latest News');
    } else if (activeTab === 'state') {
      query = lang === 'hi' ? STATES.find(s => s.id === selectedStateId).qHi : STATES.find(s => s.id === selectedStateId).qEn;
    } else {
      query = CATEGORIES[lang].find(c => c.id === activeCatId).query;
    }
    
    const data = await getHeadlines(query, lang);
    setArticles(data || []);
    setLoading(false);
  }, [activeTab, activeCatId, selectedStateId, lang, searchQuery]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const handleShareApp = async () => {
    try { await Share.share({ message: t.shareText + '\n\nDownload Link: https://www.amazon.com/appstore' }); } catch (e) {}
  };

  const renderDrawer = () => (
    <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
      <View style={styles.drawerBackdrop}>
        <View style={styles.drawerContent}>
          <View style={styles.drawerHeaderBox}>
            <Text style={styles.drawerTitle}>OX NEWS</Text>
            <Text style={styles.drawerSubtitle}>{t.tickerText}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingTop: 10}}>
            <Text style={styles.catHeading}>{t.allCats}</Text>
            {CATEGORIES[lang].map(cat => (
              <TouchableOpacity key={cat.id} style={[styles.drawerItem, activeCatId === cat.id && styles.drawerItemActive]} 
                onPress={() => { setActiveCatId(cat.id); setActiveTab('home'); setDrawerOpen(false); }}>
                <Ionicons name={cat.icon} size={20} color={activeCatId === cat.id ? "#DC2626" : "#64748B"} style={{marginRight: 14}}/>
                <Text style={[styles.drawerItemText, activeCatId === cat.id && styles.drawerItemTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setDrawerOpen(false)}>
            <Ionicons name="close-circle" size={24} color="#0F172A" style={{marginRight: 8}}/>
            <Text style={styles.drawerCloseText}>{t.close}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{flex: 1}} onPress={() => setDrawerOpen(false)} />
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />
      
      {activeTab !== 'shorts' && (
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.iconBtn}>
              <Ionicons name="menu" size={32} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.mastheadTitle}>{t.appName}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => setLang(l => l === 'hi' ? 'en' : 'hi')} style={styles.langBtn}>
              <Text style={styles.langBtnText}>{t.langToggle}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareApp} style={styles.iconBtn}>
              <Ionicons name="share-social" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.mainContainer}>
        {activeTab === 'search' && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={22} color="#94A3B8" style={{marginRight: 10}} />
            <TextInput style={styles.searchInput} placeholder={t.searchHint} placeholderTextColor="#94A3B8"
              value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={loadFeed} returnKeyType="search" />
          </View>
        )}

        {activeTab === 'state' && (
          <View style={styles.stateSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {STATES.map(state => (
                <TouchableOpacity key={state.id} style={[styles.stateBtn, selectedStateId === state.id && styles.stateBtnActive]} onPress={() => setSelectedStateId(state.id)}>
                  <Text style={[styles.stateBtnText, selectedStateId === state.id && styles.stateBtnTextActive]}>{lang === 'hi' ? state.hi : state.en}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <ScrollView style={{padding: 12}}>
            <ShimmerCard /><ShimmerCard /><ShimmerCard />
          </ScrollView>
        ) : (
          <>
            {activeTab === 'shorts' ? (
              <FlatList
                data={articles}
                keyExtractor={item => item.url}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ImageBackground source={{ uri: item.image_url }} style={styles.shortsImage} resizeMode="cover">
                    <View style={styles.shortsOverlay}>
                      <Text style={styles.shortsTag}>{CATEGORIES[lang].find(c => c.id === activeCatId)?.name || 'News'}</Text>
                      <Text style={styles.shortsTitle} numberOfLines={4}>{item.title}</Text>
                      <Text style={styles.shortsSource}>{item.source}</Text>
                      <TouchableOpacity style={styles.readMoreBtn} onPress={() => setWebViewModal({ visible: true, url: item.url })}>
                        <Text style={styles.readMoreText}>{t.readMore}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </ImageBackground>
                )}
              />
            ) : (
              <FlatList
                data={articles}
                keyExtractor={item => item.url}
                contentContainerStyle={{padding: 12, paddingBottom: 90}}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.cinematicCard} onPress={() => setWebViewModal({ visible: true, url: item.url })}>
                    <ImageBackground source={{ uri: item.image_url }} style={styles.cardImage} imageStyle={{borderRadius: 16}}>
                      <View style={styles.cardOverlay}>
                        <Text style={styles.cardTitle} numberOfLines={3}>{item.title}</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
                          <Text style={styles.cardSource}>{item.source}</Text>
                          <Ionicons name="chevron-forward-circle" size={24} color="#DC2626" />
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.floatingBarContainer}>
        <View style={styles.floatingBar}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => {setActiveTab('home'); setActiveCatId('breaking');}}>
            <Ionicons name={activeTab === 'home' ? "home" : "home-outline"} size={26} color={activeTab === 'home' ? "#DC2626" : "#64748B"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('shorts')}>
            <Ionicons name={activeTab === 'shorts' ? "play-circle" : "play-circle-outline"} size={32} color={activeTab === 'shorts' ? "#DC2626" : "#64748B"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('state')}>
            <Ionicons name={activeTab === 'state' ? "map" : "map-outline"} size={26} color={activeTab === 'state' ? "#DC2626" : "#64748B"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('search')}>
            <Ionicons name={activeTab === 'search' ? "search" : "search-outline"} size={26} color={activeTab === 'search' ? "#DC2626" : "#64748B"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{backgroundColor: '#FFF'}}>
        <BannerAd unitId={AD_UNIT} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
      </View>

      {renderDrawer()}

      <Modal visible={webViewModal.visible} animationType="slide" onRequestClose={() => setWebViewModal({ visible: false, url: '' })}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setWebViewModal({ visible: false, url: '' })} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="close" size={30} color="#0F172A" />
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
  header: { height: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#DC2626', elevation: 5 },
  iconBtn: { padding: 4 },
  mastheadTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 0.5, marginLeft: 10 },
  langBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 15 },
  langBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  mainContainer: { flex: 1, backgroundColor: '#F1F5F9' },
  
  cinematicCard: { marginBottom: 16, borderRadius: 16, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  cardImage: { width: '100%', height: 260, justifyContent: 'flex-end' },
  cardOverlay: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 18, paddingTop: 30, backgroundColor: 'rgba(0,0,0,0.65)' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', lineHeight: 28 },
  cardSource: { fontSize: 13, color: '#CBD5E1', fontWeight: '700', textTransform: 'uppercase' },

  shortsImage: { width, height: height - 100 },
  shortsOverlay: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 120, backgroundColor: 'rgba(0,0,0,0.5)' },
  shortsTag: { backgroundColor: '#DC2626', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, color: '#FFF', fontWeight: 'bold', marginBottom: 12 },
  shortsTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', lineHeight: 36, marginBottom: 10 },
  shortsSource: { fontSize: 15, color: '#94A3B8', fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase' },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  readMoreText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginRight: 8 },

  floatingBarContainer: { position: 'absolute', bottom: 70, left: 0, right: 0, alignItems: 'center' },
  floatingBar: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.95)', width: '85%', height: 65, borderRadius: 35, justifyContent: 'space-around', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5 },
  tabBtn: { alignItems: 'center', justifyContent: 'center', flex: 1 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 12, paddingHorizontal: 16, borderRadius: 16, elevation: 2 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: '#0F172A', fontWeight: '600' },
  stateSelector: { paddingVertical: 12, paddingHorizontal: 8 },
  stateBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, backgroundColor: '#FFF', marginHorizontal: 6, elevation: 2 },
  stateBtnActive: { backgroundColor: '#DC2626' },
  stateBtnText: { color: '#475569', fontWeight: '700', fontSize: 15 },
  stateBtnTextActive: { color: '#FFF' },

  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' },
  drawerContent: { width: width * 0.75, backgroundColor: '#FFF', height: '100%' },
  drawerHeaderBox: { backgroundColor: '#DC2626', padding: 24, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#B91C1C' },
  drawerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  drawerSubtitle: { fontSize: 12, color: '#FECACA', marginTop: 4 },
  catHeading: { padding: 18, fontSize: 14, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase' },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },
  drawerItemActive: { backgroundColor: '#FEF2F2', borderRightWidth: 4, borderRightColor: '#DC2626' },
  drawerItemText: { fontSize: 16, color: '#334155', fontWeight: '700' },
  drawerItemTextActive: { color: '#DC2626', fontWeight: '900' },
  drawerCloseBtn: { padding: 20, backgroundColor: '#F8FAFC', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  drawerCloseText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },

  shimmerCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  shimmerImg: { width: '100%', height: 180, backgroundColor: '#E2E8F0', borderRadius: 12, marginBottom: 16 },
  shimmerText1: { width: '80%', height: 20, backgroundColor: '#E2E8F0', borderRadius: 4, marginBottom: 10 },
  shimmerText2: { width: '50%', height: 15, backgroundColor: '#E2E8F0', borderRadius: 4 },

  readerHeader: { height: 60, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  readerBackText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 }
});
