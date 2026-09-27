import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getHeadlines } from './src/api/newsApi';

const { width } = Dimensions.get('window');

const STRINGS = {
  en: {
    title: 'THE OX NEWS',
    mustRead: 'MUST READ',
    ticker: 'Live Wire: Thousands of real-time multi-language updates streaming now.',
    sectionsTitle: 'Sections',
    signInPrompt: 'Sign in to save your reading',
    signInBtn: 'Sign In →',
    unlockTitle: 'One tap. Unlock it all.',
    benefit1: 'Bookmark articles you love',
    benefit2: 'Comment, reply & join the debate',
    benefit3: 'Get access to newsletters',
    mobilePlaceholder: 'Mobile Number',
    or: 'Or',
    email: 'Email',
    googleSign: 'Sign In',
    close: 'Close',
    back: 'Back',
    tabs: { feed: 'Newsfeed', markets: 'Markets', city: 'City', explore: 'Explore', exclusives: 'Exclusives' },
    cats: { India: 'India', World: 'World', Sports: 'Sports', Entertainment: 'Entertainment', Business: 'Business', Delhi: 'City / Delhi', Technology: 'Technology', Opinions: 'Opinions and Edits', Humour: 'Humour', Astrology: 'Astrology', EconomicTimes: 'Economic Times', Lifestyle: 'Lifestyle' },
  },
  hi: {
    title: 'द ऑक्स न्यूज़',
    mustRead: 'ज़रूर पढ़ें',
    ticker: 'लाइव वायर: हजारों रियल-टाइम बहुभाषी अपडेट्स लगातार प्रसारित हो रहे हैं।',
    sectionsTitle: 'सेक्शंस',
    signInPrompt: 'अपनी रीडिंग सेव करने के लिए साइन इन करें',
    signInBtn: 'साइन इन →',
    unlockTitle: 'एक टैप। सब कुछ अनलॉक करें।',
    benefit1: 'पसंदीदा आर्टिकल बुकमार्क करें',
    benefit2: 'कमेंट करें और चर्चा में शामिल हों',
    benefit3: 'न्यूज़लेटर का एक्सेस पाएं',
    mobilePlaceholder: 'मोबाइल नंबर',
    or: 'या',
    email: 'ईमेल',
    googleSign: 'साइन इन',
    close: 'बंद करें',
    back: 'वापस जाएं',
    tabs: { feed: 'न्यूज़फ़ीड', markets: 'बाज़ार', city: 'शहर', explore: 'एक्सप्लोर', exclusives: 'एक्सक्लूसिव' },
    cats: { India: 'भारत', World: 'विश्व', Sports: 'खेल', Entertainment: 'मनोरंजन', Business: 'व्यापार', Delhi: 'शहर / दिल्ली', Technology: 'तकनीक', Opinions: 'विचार और समीक्षा', Humour: 'हास्य', Astrology: 'राशिफल', EconomicTimes: 'इकोनॉमिक टाइम्स', Lifestyle: 'लाइफस्टाइल' },
  },
};

const SECTIONS = ['India', 'World', 'Sports', 'Entertainment', 'Business', 'Delhi', 'Technology', 'Opinions', 'Humour', 'Astrology', 'EconomicTimes', 'Lifestyle'];

export default function App() {
  const [lang, setLang] = useState('hi');
  const t = STRINGS[lang];

  const [activeTab, setActiveTab] = useState('newsfeed');
  const [activeCategory, setActiveCategory] = useState('India');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auth & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileInput, setMobileInput] = useState('');

  // Modals & Navigation
  const [webViewModal, setWebViewModal] = useState({ visible: false, url: '', title: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [dismissedIds, setDismissedIds] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem('@ox_cloud_session');
        if (session) setCurrentUser(JSON.parse(session));
      } catch (err) {
        console.error('Session load error:', err);
      }
    })();
  }, []);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      let query = activeCategory;
      if (activeTab === 'markets') query = 'Stock Market Sensex Nifty';
      else if (activeTab === 'city') query = 'Delhi NCR local news';
      else if (activeTab === 'exclusives') query = 'Exclusive investigative news India';
      else if (activeTab === 'explore') query = activeCategory;

      const data = await getHeadlines(query, lang);
      setArticles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, activeCategory, lang]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleMobileLogin = async () => {
    if (!mobileInput || mobileInput.length < 10) {
      Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', lang === 'hi' ? 'कृपया वैध मोबाइल नंबर दर्ज करें।' : 'Please enter valid mobile number.');
      return;
    }
    const userSession = { name: `User (+91 ${mobileInput.slice(-5)})`, email: `mob_${mobileInput}@oxnews.in`, isGuest: false };
    await AsyncStorage.setItem('@ox_cloud_session', JSON.stringify(userSession));
    setCurrentUser(userSession);
    setAuthModalOpen(false);
    setMobileInput('');
    Alert.alert(lang === 'hi' ? 'सफल' : 'Success', lang === 'hi' ? 'सफलतापूर्वक लॉगिन हो गया!' : 'Successfully signed in!');
  };

  const handleGoogleAuth = async () => {
    const googleUser = { name: 'OX Reader (Google)', email: 'reader.oxnews@gmail.com', isGuest: false };
    await AsyncStorage.setItem('@ox_cloud_session', JSON.stringify(googleUser));
    setCurrentUser(googleUser);
    setAuthModalOpen(false);
    Alert.alert(lang === 'hi' ? 'स्वागत है' : 'Welcome', 'Google Sign-In successful.');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@ox_cloud_session');
    setCurrentUser(null);
    Alert.alert(lang === 'hi' ? 'लॉगआउट' : 'Logged Out', lang === 'hi' ? 'सफलतापूर्वक लॉगआउट हो गया।' : 'Successfully logged out.');
  };

  const toggleLanguage = () => setLang(l => (l === 'en' ? 'hi' : 'en'));

  const toggleBookmark = (id, title) => {
    const isNow = !bookmarkedIds[id];
    setBookmarkedIds(prev => ({ ...prev, [id]: isNow }));
    Alert.alert(lang === 'hi' ? (isNow ? 'सहेज लिया गया' : 'हटा दिया गया') : (isNow ? 'Bookmarked' : 'Removed'), title.slice(0, 40));
  };

  const visibleArticles = articles.filter(a => !dismissedIds[a.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.iconBtn}>
          <Ionicons name="menu" size={28} color="#1E293B" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('newsfeed')} style={styles.headerCenter}>
          <Text style={styles.mastheadTitle}>{t.title}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleLanguage} style={styles.langSwitchBtn}>
          <Text style={styles.langSwitchText}>{lang === 'en' ? 'हिन्दी' : 'ENG'}</Text>
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View style={styles.container}>
        {activeTab === 'newsfeed' && (
          <>
            <TouchableOpacity style={styles.tickerCard} onPress={() => { setActiveTab('exclusives'); loadFeed(); }}>
              <View style={styles.tickerBadge}>
                <Text style={styles.tickerBadgeText}>{t.mustRead}</Text>
              </View>
              <Text style={styles.tickerTitle} numberOfLines={2}>{t.ticker}</Text>
            </TouchableOpacity>

            <View style={styles.categoryScrollWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {SECTIONS.map((sec) => {
                  const isCurrent = activeCategory === sec;
                  return (
                    <TouchableOpacity
                      key={sec}
                      style={[styles.categoryTab, isCurrent && styles.categoryTabActive]}
                      onPress={() => setActiveCategory(sec)}
                    >
                      <Text style={[styles.categoryTabText, isCurrent && styles.categoryTabTextActive]}>
                        {t.cats[sec] || sec}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        )}

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#DC2626" />
          </View>
        ) : (
          <FlatList
            data={visibleArticles}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFeed} colors={['#DC2626']} />}
            renderItem={({ item, index }) => {
              const isLargeLead = index === 0;
              const isBookmarked = !!bookmarkedIds[item.id];

              return (
                <View>
                  {isLargeLead ? (
                    <View style={styles.leadCard}>
                      <View style={styles.metaRow}>
                        <Text style={styles.sectionLabel}>{item.source || activeCategory}</Text>
                        <View style={styles.actionIconRow}>
                          <TouchableOpacity style={{ marginRight: 14 }} onPress={() => toggleBookmark(item.id, item.title)}>
                            <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={isBookmarked ? '#DC2626' : '#64748B'} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setDismissedIds(p => ({ ...p, [item.id]: true }))}>
                            <Ionicons name="close" size={19} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => setWebViewModal({ visible: true, url: item.url, title: item.title })}>
                        <Text style={styles.leadTitle}>{item.title}</Text>
                        {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.leadImage} /> : null}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.compactCard}>
                      <View style={styles.metaRow}>
                        <Text style={styles.sectionLabel}>{item.source || activeCategory}</Text>
                        <View style={styles.actionIconRow}>
                          <TouchableOpacity style={{ marginRight: 10 }} onPress={() => toggleBookmark(item.id, item.title)}>
                            <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={17} color={isBookmarked ? '#DC2626' : '#64748B'} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setDismissedIds(p => ({ ...p, [item.id]: true }))}>
                            <Ionicons name="close" size={17} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.compactRow} onPress={() => setWebViewModal({ visible: true, url: item.url, title: item.title })}>
                        <View style={styles.compactTextCol}>
                          <Text style={styles.compactTitle} numberOfLines={3}>{item.title}</Text>
                        </View>
                        {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.compactThumb} /> : null}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>

      {/* ADMOB BANNER */}
      <View style={styles.admobContainer}>
        <BannerAd unitId={TestIds.BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
      </View>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('newsfeed')}>
          <Ionicons name="newspaper-outline" size={21} color={activeTab === 'newsfeed' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'newsfeed' && styles.tabLabelActive]}>{t.tabs.feed}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('markets')}>
          <Ionicons name="trending-up-outline" size={21} color={activeTab === 'markets' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'markets' && styles.tabLabelActive]}>{t.tabs.markets}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('city')}>
          <Ionicons name="location-outline" size={21} color={activeTab === 'city' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'city' && styles.tabLabelActive]}>{t.tabs.city}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('explore')}>
          <Ionicons name="compass-outline" size={21} color={activeTab === 'explore' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'explore' && styles.tabLabelActive]}>{t.tabs.explore}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => { setActiveTab('exclusives'); loadFeed(); }}>
          <MaterialCommunityIcons name="shield-lock" size={22} color={activeTab === 'exclusives' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'exclusives' && styles.tabLabelExclusive]}>{t.tabs.exclusives}</Text>
        </TouchableOpacity>
      </View>

      {/* WEBVIEW MODAL */}
      <Modal visible={webViewModal.visible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setWebViewModal({ visible: false, url: '', title: '' })} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle} numberOfLines={1}>{webViewModal.title}</Text>
            <View style={{ width: 30 }} />
          </View>
          {webViewModal.url ? <WebView source={{ uri: webViewModal.url }} startInLoadingState /> : null}
        </SafeAreaView>
      </Modal>

      {/* AUTH MODAL (Matching Screenshot) */}
      <Modal visible={authModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.authCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.authCardMainTitle}>{t.unlockTitle}</Text>
              <TouchableOpacity onPress={() => setAuthModalOpen(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.benefitBox}>
              <View style={styles.benefitRow}><Ionicons name="checkmark-circle" size={16} color="#16A34A" /><Text style={styles.benefitText}>{t.benefit1}</Text></View>
              <View style={styles.benefitRow}><Ionicons name="checkmark-circle" size={16} color="#16A34A" /><Text style={styles.benefitText}>{t.benefit2}</Text></View>
              <View style={styles.benefitRow}><Ionicons name="checkmark-circle" size={16} color="#16A34A" /><Text style={styles.benefitText}>{t.benefit3}</Text></View>
            </View>

            <View style={styles.mobileInputRow}>
              <TextInput
                placeholder={t.mobilePlaceholder}
                style={styles.authMobileInput}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileInput}
                onChangeText={setMobileInput}
              />
              <TouchableOpacity style={styles.mobileArrowBtn} onPress={handleMobileLogin}>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.authDividerRow}>
              <View style={styles.authDividerLine} />
              <Text style={styles.authDividerText}>{t.or}</Text>
              <View style={styles.authDividerLine} />
            </View>

            <View style={styles.socialAuthRow}>
              <TouchableOpacity style={styles.socialOptionBtn} onPress={() => Alert.alert('Email Login', 'Enter email credentials')}>
                <Ionicons name="mail-outline" size={18} color="#0F172A" style={{ marginRight: 6 }} />
                <Text style={styles.socialOptionText}>{t.email}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialOptionBtn} onPress={handleGoogleAuth}>
                <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 6 }} />
                <Text style={styles.socialOptionText}>{t.googleSign}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SIDE DRAWER (Matching Screenshot) */}
      <Modal visible={drawerOpen} transparent animationType="fade">
        <View style={styles.drawerBackdrop}>
          <View style={styles.drawerContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.drawerProfileBox}>
                <View style={styles.profileAvatar}>
                  <Ionicons name={currentUser?.isGuest ? 'person-outline' : 'person'} size={26} color="#FFF" />
                </View>
                {currentUser ? (
                  <>
                    <Text style={styles.drawerUserNameText}>{currentUser.name}</Text>
                    <Text style={styles.drawerUserEmailText}>{currentUser.email}</Text>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                      <Text style={styles.logoutBtnText}>{lang === 'hi' ? 'लॉगआउट करें' : 'Logout'}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.drawerProfileText}>{t.signInPrompt}</Text>
                    <TouchableOpacity style={styles.signInBtn} onPress={() => { setDrawerOpen(false); setAuthModalOpen(true); }}>
                      <Text style={styles.signInBtnText}>{t.signInBtn}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <Text style={styles.drawerSectionHeading}>{t.sectionsTitle}</Text>
              {SECTIONS.map((sec) => (
                <TouchableOpacity key={sec} style={styles.drawerRow} onPress={() => { setActiveCategory(sec); setDrawerOpen(false); }}>
                  <Ionicons name="chevron-forward-outline" size={16} color="#64748B" style={{ width: 24 }} />
                  <Text style={styles.drawerRowText}>{t.cats[sec] || sec}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setDrawerOpen(false)}>
              <Ionicons name="close" size={20} color="#1E293B" /><Text style={{ marginLeft: 6, fontWeight: '700' }}>{t.close}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF8F5' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 54, backgroundColor: '#FFF8F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  mastheadTitle: { fontSize: 19, fontWeight: '900', letterSpacing: 1.5, fontFamily: 'serif', color: '#000000' },
  iconBtn: { padding: 4 },
  langSwitchBtn: { backgroundColor: '#0F172A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  langSwitchText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  tickerCard: { marginHorizontal: 14, marginTop: 10, padding: 10, backgroundColor: '#FFF5F5', borderRadius: 10, borderWidth: 1, borderColor: '#FECACA' },
  tickerBadge: { alignSelf: 'flex-start', backgroundColor: '#DC2626', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  tickerBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  tickerTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', lineHeight: 18 },
  categoryScrollWrapper: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  categoryScroll: { paddingHorizontal: 14, paddingVertical: 10 },
  categoryTab: { marginRight: 20, paddingBottom: 4 },
  categoryTabActive: { borderBottomWidth: 2, borderBottomColor: '#DC2626' },
  categoryTabText: { fontSize: 14, color: '#64748B', fontWeight: '700' },
  categoryTabTextActive: { color: '#000000' },
  listContent: { paddingBottom: 24 },
  leadCard: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  leadTitle: { fontSize: 18, fontWeight: '800', lineHeight: 25, color: '#0F172A', marginBottom: 10 },
  leadImage: { width: '100%', height: 210, borderRadius: 8, backgroundColor: '#F1F5F9' },
  compactCard: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  compactRow: { flexDirection: 'row', justifyContent: 'space-between' },
  compactTextCol: { flex: 1, paddingRight: 12 },
  compactTitle: { fontSize: 15, fontWeight: '700', lineHeight: 21, color: '#1E293B' },
  compactThumb: { width: 88, height: 66, borderRadius: 6, backgroundColor: '#F1F5F9' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  actionIconRow: { flexDirection: 'row', alignItems: 'center' },
  admobContainer: { alignItems: 'center', backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 2 },
  bottomBar: { height: 56, flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center', justifyContent: 'space-around' },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, marginTop: 2, color: '#64748B', fontWeight: '600' },
  tabLabelActive: { color: '#DC2626', fontWeight: '800' },
  tabLabelExclusive: { color: '#DC2626', fontWeight: '800' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row' },
  drawerContent: { width: width * 0.75, backgroundColor: '#FFFFFF', height: '100%', padding: 18, justifyContent: 'space-between' },
  drawerProfileBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#94A3B8', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  drawerUserNameText: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 4, textAlign: 'center' },
  drawerUserEmailText: { fontSize: 12, color: '#64748B', marginBottom: 10, textAlign: 'center' },
  logoutBtn: { backgroundColor: '#FEE2E2', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, marginTop: 4 },
  logoutBtnText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
  drawerProfileText: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 10, fontWeight: '500' },
  signInBtn: { backgroundColor: '#0F172A', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6, width: '100%', alignItems: 'center' },
  signInBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  drawerSectionHeading: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 10, marginTop: 6 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  drawerRowText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  drawerCloseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  readerHeader: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  readerBackBtn: { flexDirection: 'row', alignItems: 'center' },
  readerBackText: { fontSize: 14, fontWeight: '700', marginLeft: 6, color: '#0F172A' },
  readerHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  authCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, width: width * 0.88 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  authCardMainTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  benefitBox: { marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  benefitText: { fontSize: 13, color: '#334155', marginLeft: 8, fontWeight: '600' },
  mobileInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 48, marginBottom: 14 },
  authMobileInput: { flex: 1, fontSize: 15, color: '#0F172A' },
  mobileArrowBtn: { backgroundColor: '#0F172A', width: 36, height: 36, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  authDividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  authDividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  authDividerText: { marginHorizontal: 10, color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  socialAuthRow: { flexDirection: 'row', justifyContent: 'space-between' },
  socialOptionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 44, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', marginHorizontal: 4 },
  socialOptionText: { color: '#0F172A', fontWeight: '700', fontSize: 13 },
});
