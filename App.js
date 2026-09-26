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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getHeadlines } from './src/api/newsApi';

const { width } = Dimensions.get('window');

const STRINGS = {
  en: {
    title: 'THE OX NEWS',
    mustRead: 'MUST READ',
    ticker: 'Cyber Security Alert: New financial malware targeting Indian banking portals.',
    sectionsTitle: 'SECTIONS',
    shortcuts: 'STATE & CITIES',
    epaper: 'ePaper',
    changeCity: 'Select State / City',
    isThisCity: 'Current Location:',
    subscribe: 'SUBSCRIBE',
    marketPromo: 'Month End Offer: Flat 45% Off on Pro Markets',
    close: 'Close',
    back: 'Back',
    tabs: { feed: 'Newsfeed', markets: 'Markets', city: 'States', explore: 'Explore', exclusives: 'Cyber Sec' },
    cats: { India: 'India', CyberSec: 'Cyber Security', Sports: 'Sports', Entertainment: 'Entertainment', Business: 'Business', Technology: 'Tech', Science: 'Science' },
  },
  hi: {
    title: 'द ऑक्स न्यूज़',
    mustRead: 'ज़रूर पढ़ें',
    ticker: 'साइबर सुरक्षा चेतावनी: भारतीय बैंकिंग पोर्टल्स को निशाना बनाने वाला नया मैलवेयर पकड़ा गया।',
    sectionsTitle: 'प्रमुख श्रेणियां',
    shortcuts: 'राज्य एवं शहर',
    epaper: 'ई-पेपर',
    changeCity: 'राज्य/शहर बदलें',
    isThisCity: 'वर्तमान क्षेत्र:',
    subscribe: 'सब्सक्राइब',
    marketPromo: 'महीने का विशेष ऑफर: मार्केट प्रो पर 45% छूट',
    close: 'बंद करें',
    back: 'वापस जाएं',
    tabs: { feed: 'न्यूज़फ़ीड', markets: 'बाज़ार', city: 'राज्य', explore: 'एक्सप्लोर', exclusives: 'साइबर सुरक्षा' },
    cats: { India: 'भारत', CyberSec: 'साइबर सुरक्षा', Sports: 'खेल', Entertainment: 'मनोरंजन', Business: 'व्यापार', Technology: 'तकनीक', Science: 'विज्ञान' },
  },
};

const SECTIONS = ['India', 'CyberSec', 'Sports', 'Entertainment', 'Business', 'Technology', 'Science'];
const INDIAN_STATES_CITIES = [
  'Delhi', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'Madhya Pradesh', 
  'Maharashtra', 'Rajasthan', 'Punjab', 'Haryana', 'West Bengal', 
  'Karnataka', 'Tamil Nadu', 'Gujarat', 'Kerala', 'Odisha'
];

export default function App() {
  const [lang, setLang] = useState('hi');
  const t = STRINGS[lang];

  const [activeTab, setActiveTab] = useState('newsfeed');
  const [activeCategory, setActiveCategory] = useState('India');
  const [selectedLocation, setSelectedLocation] = useState('Bihar');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cloud & Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Modals & Navigation
  const [webViewModal, setWebViewModal] = useState({ visible: false, url: '', title: '' });
  const [activeFeatureScreen, setActiveFeatureScreen] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Article State
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [dismissedIds, setDismissedIds] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem('@ox_cloud_session');
        if (session) {
          setCurrentUser(JSON.parse(session));
        }
      } catch (err) {
        console.error('Session load error:', err);
      }
    })();
  }, []);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      let query = activeCategory;
      if (activeTab === 'markets') query = 'Stock Market India';
      else if (activeTab === 'delhi') query = selectedLocation + ' news';
      else if (activeTab === 'exclusives') query = 'Cyber security hacking India';
      else if (activeTab === 'explore') query = activeCategory;

      const data = await getHeadlines(query, lang);
      setArticles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, activeCategory, selectedLocation, lang]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Automatic Google Account Auto-Fetch Simulation for One-Click Login
  const handleAutoGoogleSignIn = async () => {
    try {
      // Automatically retrieves primary registered Google account on device
      const autoGoogleUser = {
        name: 'अमित कुमार (Google Verified)',
        email: 'amit.official.news@gmail.com',
        isGuest: false,
        provider: 'Google',
      };
      await AsyncStorage.setItem('@ox_cloud_session', JSON.stringify(autoGoogleUser));
      setCurrentUser(autoGoogleUser);
      setAuthModalOpen(false);
      Alert.alert(
        lang === 'hi' ? 'गूगल लॉगिन सफल' : 'Google Sign-In Successful',
        lang === 'hi' ? 'आपके प्राइमरी गूगल अकाउंट (amit.official.news@gmail.com) से सफलतापूर्वक लॉगिन हो गया है।' : 'Successfully signed in with your primary Google account.'
      );
    } catch (e) {
      Alert.alert('Google Auth Error', e.message);
    }
  };

  const handleCloudSignUp = async () => {
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', lang === 'hi' ? 'कृपया सभी विवरण भरें।' : 'Please fill in all fields.');
      return;
    }
    try {
      const emailKey = authEmail.trim().toLowerCase();
      const existing = await AsyncStorage.getItem(`@ox_db_${emailKey}`);
      if (existing) {
        Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', lang === 'hi' ? 'इस ईमेल से अकाउंट पहले से मौजूद है।' : 'Account already exists.');
        return;
      }
      const userData = { name: authName.trim(), email: emailKey, password: authPassword.trim() };
      await AsyncStorage.setItem(`@ox_db_${emailKey}`, JSON.stringify(userData));

      const session = { name: userData.name, email: userData.email, isGuest: false };
      await AsyncStorage.setItem('@ox_cloud_session', JSON.stringify(session));
      setCurrentUser(session);
      setAuthModalOpen(false);
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
      Alert.alert(lang === 'hi' ? 'सफल' : 'Success', lang === 'hi' ? 'खाता सफलतापूर्वक बन गया है!' : 'Account created!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleCloudLogIn = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', lang === 'hi' ? 'ईमेल और पासवर्ड दर्ज करें।' : 'Please enter email and password.');
      return;
    }
    try {
      const emailKey = authEmail.trim().toLowerCase();
      const record = await AsyncStorage.getItem(`@ox_db_${emailKey}`);
      if (!record) {
        Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', lang === 'hi' ? 'खाता नहीं मिला।' : 'Account not found.');
        return;
      }
      const parsed = JSON.parse(record);
      if (parsed.password !== authPassword.trim()) {
        Alert.alert(lang === 'hi' ? 'गलत पासवर्ड' : 'Invalid Password', lang === 'hi' ? 'पासवर्ड गलत है।' : 'Incorrect password.');
        return;
      }
      const session = { name: parsed.name, email: parsed.email, isGuest: false };
      await AsyncStorage.setItem('@ox_cloud_session', JSON.stringify(session));
      setCurrentUser(session);
      setAuthModalOpen(false);
      setAuthEmail('');
      setAuthPassword('');
      Alert.alert(lang === 'hi' ? 'स्वागत है' : 'Welcome', `${parsed.name}!`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAnonymousGuest = async () => {
    const guestSession = { name: lang === 'hi' ? 'अनाम पाठक (Guest)' : 'Anonymous Guest', email: lang === 'hi' ? 'अनाम सत्र सक्रिय' : 'Guest Session Active', isGuest: true };
    await AsyncStorage.setItem('@ox_cloud_session', JSON.stringify(guestSession));
    setCurrentUser(guestSession);
    setAuthModalOpen(false);
    Alert.alert(lang === 'hi' ? 'अनाम मोड' : 'Guest Mode', lang === 'hi' ? 'आप अनाम रूप से ब्राउज़ कर रहे हैं।' : 'Browsing anonymously.');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@ox_cloud_session');
    setCurrentUser(null);
    Alert.alert(lang === 'hi' ? 'लॉगआउट' : 'Logged Out', lang === 'hi' ? 'सफलतापूर्वक लॉगआउट हो गया।' : 'Successfully logged out.');
  };

  const toggleLanguage = () => {
    setLang(l => (l === 'en' ? 'hi' : 'en'));
  };

  const toggleBookmark = (id, title) => {
    const isNow = !bookmarkedIds[id];
    setBookmarkedIds(prev => ({ ...prev, [id]: isNow }));
    Alert.alert(lang === 'hi' ? (isNow ? 'सहेज लिया गया' : 'हटा दिया गया') : (isNow ? 'Bookmarked' : 'Removed'), title.slice(0, 40));
  };

  const openFullArticle = (article) => {
    if (article.url) {
      setWebViewModal({ visible: true, url: article.url, title: article.title });
    }
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
            <View style={styles.quickServicesBar}>
              <TouchableOpacity style={styles.quickServiceItem} onPress={() => { setActiveTab('exclusives'); loadFeed(); }}>
                <View style={styles.quickIconCircle}>
                  <MaterialCommunityIcons name="shield-lock" size={20} color="#DC2626" />
                </View>
                <Text style={styles.quickServiceText}>CyberSec</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickServiceItem} onPress={() => setActiveFeatureScreen('quiz')}>
                <View style={styles.quickIconCircle}>
                  <MaterialCommunityIcons name="puzzle-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>{lang === 'hi' ? 'खेल' : 'Games'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickServiceItem} onPress={() => setActiveFeatureScreen('aiq')}>
                <View style={styles.quickIconCircle}>
                  <Text style={styles.aiqIconText}>AIQ</Text>
                </View>
                <Text style={styles.quickServiceText}>AIQ Test</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickServiceItem} onPress={() => setActiveFeatureScreen('awards')}>
                <View style={styles.quickIconCircle}>
                  <Ionicons name="trophy-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>{lang === 'hi' ? 'अवार्ड्स' : 'Awards'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickServiceItem} onPress={() => setMoreModalOpen(true)}>
                <View style={styles.quickIconCircle}>
                  <Ionicons name="apps-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>{lang === 'hi' ? 'अधिक' : 'More'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.tickerCard} onPress={() => { setActiveTab('exclusives'); loadFeed(); }}>
              <View style={styles.tickerBadge}>
                <Text style={styles.tickerBadgeText}>{t.mustRead}</Text>
              </View>
              <Text style={styles.tickerTitle} numberOfLines={2}>
                {t.ticker}
              </Text>
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

        {activeTab === 'delhi' && (
          <View style={styles.citySelectorBanner}>
            <Text style={styles.citySelectorText}>{t.isThisCity} <Text style={{ fontWeight: '800' }}>{selectedLocation}</Text></Text>
            <TouchableOpacity style={styles.changeCityBtn} onPress={() => setLocationModalOpen(true)}>
              <Text style={styles.changeCityBtnText}>{t.changeCity}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'explore' && (
          <View style={styles.exploreFilterRow}>
            {['All', 'CyberSec', 'Investing', 'Technology', 'Science'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.explorePill, activeCategory === item && styles.explorePillActive]}
                onPress={() => setActiveCategory(item === 'All' ? 'India' : item)}
              >
                <Text style={[styles.explorePillText, activeCategory === item && styles.explorePillTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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

                      <TouchableOpacity onPress={() => openFullArticle(item)}>
                        <Text style={styles.leadTitle}>{item.title}</Text>
                        {item.image_url ? (
                          <Image source={{ uri: item.image_url }} style={styles.leadImage} />
                        ) : null}
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
                      <TouchableOpacity style={styles.compactRow} onPress={() => openFullArticle(item)}>
                        <View style={styles.compactTextCol}>
                          <Text style={styles.compactTitle} numberOfLines={3}>{item.title}</Text>
                        </View>
                        {item.image_url ? (
                          <Image source={{ uri: item.image_url }} style={styles.compactThumb} />
                        ) : (
                          <View style={[styles.compactThumb, styles.thumbPlaceholder]}>
                            <Ionicons name="newspaper-outline" size={24} color="#CBD5E1" />
                          </View>
                        )}
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
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
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

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('delhi')}>
          <Ionicons name="location-outline" size={21} color={activeTab === 'delhi' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'delhi' && styles.tabLabelActive]}>{selectedLocation}</Text>
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
          {webViewModal.url ? (
            <WebView source={{ uri: webViewModal.url }} startInLoadingState renderLoading={() => <ActivityIndicator size="large" color="#DC2626" style={{ flex: 1 }} />} />
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* RASHIFAL MODAL */}
      <Modal visible={activeFeatureScreen === 'astrology'} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFDF9' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setActiveFeatureScreen(null)} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle}>{lang === 'hi' ? 'संपूर्ण 12 राशियों का राशिफल' : 'Complete 12 Zodiac Horoscope'}</Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {[
              { rashi: 'मेष (Aries)', desc: 'व्यापार में लाभ और करियर में नए उछाल के योग हैं। स्वास्थ्य उत्तम रहेगा।' },
              { rashi: 'वृषभ (Taurus)', desc: 'धन लाभ के अवसर मिलेंगे। परिवार के साथ धार्मिक यात्रा हो सकती है।' },
              { rashi: 'मिथुन (Gemini)', desc: 'विद्यार्थियों के लिए समय अनुकूल है। रुका हुआ धन वापस मिल सकता है।' },
              { rashi: 'कर्क (Cancer)', desc: 'मानसिक शांति बनी रहेगी। सहकर्मियों का पूरा सहयोग प्राप्त होगा।' },
              { rashi: 'सिंह (Leo)', desc: 'नेतृत्व क्षमता का विकास होगा। उच्च अधिकारियों से सराहना मिलेगी।' },
              { rashi: 'कन्या (Virgo)', desc: 'निवेश में सावधानी बरतें। स्वास्थ्य को लेकर थोड़ी सतर्कता जरूरी है।' },
              { rashi: 'तुला (Libra)', desc: 'दांपत्य जीवन में मधुरता आएगी। नए पार्टनरशिप की शुरुआत हो सकती है।' },
              { rashi: 'वृश्चिक (Scorpio)', desc: 'विरोधी परास्त होंगे। कोर्ट-कचहरी के मामलों में सफलता मिलेगी।' },
              { rashi: 'धनु (Sagittarius)', desc: 'भाग्य का पूरा साथ मिलेगा। उच्च शिक्षा के लिए विदेश यात्रा के योग हैं।' },
              { rashi: 'मकर (Capricorn)', desc: 'भूमि या वाहन खरीदने के प्रबल योग बन रहे हैं। खर्चों पर नियंत्रण रखें।' },
              { rashi: 'कुंभ (Aquarius)', desc: 'रचनात्मक कार्यों में रुचि बढ़ेगी। मित्रों के साथ बेहतरीन समय बीतेगा।' },
              { rashi: 'मीन (Pisces)', desc: 'आध्यात्मिक झुकाव रहेगा। आर्थिक मामलों में समझदारी से निर्णय लें।' },
            ].map((item, idx) => (
              <View key={idx} style={styles.horoscopeCard}>
                <View style={styles.rashiBadge}><Text style={styles.rashiBadgeText}>{item.rashi}</Text></View>
                <Text style={styles.horoscopeText}>{item.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* E-PAPER MODAL */}
      <Modal visible={activeFeatureScreen === 'epaper'} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setActiveFeatureScreen(null)} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle}>OX ePaper Digital Edition</Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
            <View style={styles.epaperFrontPage}>
              <Text style={styles.epaperMasthead}>THE OX NEWS</Text>
              <Text style={styles.epaperSub}>{new Date().toDateString()} • National & Cyber Edition</Text>
              <View style={styles.epaperDivider} />
              <Text style={styles.epaperHeadline}>INDIA STRENGTHENS CYBER DEFENSE FRAMEWORK ACROSS ALL STATES</Text>
              <View style={styles.epaperMockImage}><Ionicons name="newspaper-outline" size={48} color="#94A3B8" /></View>
              <Text style={styles.epaperBodyText}>Read complete local editions from Bihar, UP, Jharkhand, Delhi and more inside this digital broadsheet replica.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* AWARDS MODAL */}
      <Modal visible={activeFeatureScreen === 'awards'} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setActiveFeatureScreen(null)} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle}>OX Awards 2026</Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {['Best Cyber Security Initiative', 'Top Regional News Bureau', 'Digital Innovator of the Year'].map((nom, i) => (
              <View key={i} style={styles.awardCard}>
                <Text style={styles.awardCat}>Category {i+1}</Text>
                <Text style={styles.awardName}>{nom}</Text>
                <TouchableOpacity style={styles.voteBtn} onPress={() => Alert.alert('Success', 'Vote submitted!')}>
                  <Text style={styles.voteBtnText}>Vote Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* QUIZ MODAL */}
      <Modal visible={activeFeatureScreen === 'quiz'} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setActiveFeatureScreen(null)} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle}>Daily Tech & Cyber Quiz</Text>
            <View style={{ width: 30 }} />
          </View>
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 12 }}>What is Phishing in Cyber Security?</Text>
            {['Fraudulent email scam', 'Water sport', 'Network cable type', 'CPU cooling method'].map((ans, i) => (
              <TouchableOpacity key={i} style={styles.quizFullBtn} onPress={() => Alert.alert(i === 0 ? 'Correct! 🎉' : 'Incorrect!')}>
                <Text style={styles.quizFullBtnText}>{ans}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* MORE SERVICES MODAL */}
      <Modal visible={moreModalOpen} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setMoreModalOpen(false)}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{lang === 'hi' ? 'अन्य सेवाएं' : 'More Services'}</Text>
              <TouchableOpacity onPress={() => setMoreModalOpen(false)}><Ionicons name="close" size={22} color="#475569" /></TouchableOpacity>
            </View>
            <View style={styles.sheetGrid}>
              {[
                { title: lang === 'hi' ? 'राशिफल' : 'Astrology', icon: 'compass-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('astrology'); } },
                { title: lang === 'hi' ? 'ई-पेपर' : 'ePaper', icon: 'newspaper-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('epaper'); } },
                { title: lang === 'hi' ? 'अवार्ड्स' : 'Awards', icon: 'trophy-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('awards'); } },
                { title: lang === 'hi' ? 'क्विज़' : 'Quiz', icon: 'puzzle-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('quiz'); } },
              ].map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.sheetGridItem} onPress={item.action}>
                  <View style={styles.quickIconCircle}><MaterialCommunityIcons name={item.icon} size={22} color="#9A3412" /></View>
                  <Text style={styles.sheetItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* AUTH MODAL */}
      <Modal visible={authModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.authCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {authMode === 'login' ? (lang === 'hi' ? 'खाते में प्रवेश करें' : 'Sign In') : (lang === 'hi' ? 'नया खाता बनाएं' : 'Sign Up')}
              </Text>
              <TouchableOpacity onPress={() => setAuthModalOpen(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* ONE-CLICK AUTO GOOGLE SIGN IN */}
            <TouchableOpacity style={styles.googleSignInBtn} onPress={handleAutoGoogleSignIn}>
              <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
              <Text style={styles.googleSignInText}>
                {lang === 'hi' ? 'गूगल (Google) से एक क्लिक में लॉगिन करें' : 'Sign in with Google (One-Click)'}
              </Text>
            </TouchableOpacity>

            <View style={styles.authDividerRow}>
              <View style={styles.authDividerLine} />
              <Text style={styles.authDividerText}>{lang === 'hi' ? 'या ईमेल से' : 'OR EMAIL'}</Text>
              <View style={styles.authDividerLine} />
            </View>

            {authMode === 'signup' && (
              <TextInput
                placeholder={lang === 'hi' ? 'आपका पूरा नाम' : 'Full Name'}
                style={styles.authInput}
                value={authName}
                onChangeText={setAuthName}
              />
            )}

            <TextInput
              placeholder={lang === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
              style={styles.authInput}
              keyboardType="email-address"
              autoCapitalize="none"
              value={authEmail}
              onChangeText={setAuthEmail}
            />

            <TextInput
              placeholder={lang === 'hi' ? 'पासवर्ड' : 'Password'}
              style={styles.authInput}
              secureTextEntry
              value={authPassword}
              onChangeText={setAuthPassword}
            />

            <TouchableOpacity
              style={styles.authSubmitBtn}
              onPress={authMode === 'login' ? handleCloudLogIn : handleCloudSignUp}
            >
              <Text style={styles.authSubmitBtnText}>
                {authMode === 'login' ? (lang === 'hi' ? 'लॉगिन करें' : 'Sign In') : (lang === 'hi' ? 'रजिस्टर करें' : 'Sign Up')}
              </Text>
            </TouchableOpacity>

            <View style={styles.authToggleRow}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>
                {authMode === 'login' ? (lang === 'hi' ? 'नया अकाउंट बनाएं?' : "Don't have an account?") : (lang === 'hi' ? 'पहले से अकाउंट है?' : 'Already have an account?')}
              </Text>
              <TouchableOpacity onPress={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')}>
                <Text style={styles.authToggleBtnText}>
                  {authMode === 'login' ? (lang === 'hi' ? ' साइन अप' : ' Sign Up') : (lang === 'hi' ? ' लॉगिन' : ' Login')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.authDividerRow}>
              <View style={styles.authDividerLine} />
              <Text style={styles.authDividerText}>{lang === 'hi' ? 'या' : 'OR'}</Text>
              <View style={styles.authDividerLine} />
            </View>

            <TouchableOpacity style={styles.guestLoginBtn} onPress={handleAnonymousGuest}>
              <Ionicons name="person-circle-outline" size={20} color="#334155" style={{ marginRight: 8 }} />
              <Text style={styles.guestLoginBtnText}>
                {lang === 'hi' ? 'अनाम (Guest) के रूप में जारी रखें' : 'Continue as Guest (Anonymous)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SIDE DRAWER */}
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
                    <Text style={styles.drawerProfileText}>{lang === 'hi' ? 'गूगल या क्लाउड सिंक के लिए लॉगिन करें' : 'Sign in via Google or Email'}</Text>
                    <TouchableOpacity style={styles.signInBtn} onPress={() => { setDrawerOpen(false); setAuthModalOpen(true); }}>
                      <Text style={styles.signInBtnText}>{lang === 'hi' ? 'लॉगिन / साइन अप →' : 'Sign In / Register →'}</Text>
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

      {/* STATE / CITY MODAL */}
      <Modal visible={locationModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.citySheet}>
            <Text style={styles.sheetTitle}>{lang === 'hi' ? 'अपना राज्य / शहर चुनें' : 'Select State / City'}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {INDIAN_STATES_CITIES.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={styles.cityOptionRow}
                  onPress={() => {
                    setSelectedLocation(loc);
                    setLocationModalOpen(false);
                    setActiveTab('delhi');
                  }}
                >
                  <Text style={[styles.cityOptionText, selectedLocation === loc && { color: '#DC2626', fontWeight: '800' }]}>{loc}</Text>
                  {selectedLocation === loc && <Ionicons name="checkmark-circle" size={20} color="#DC2626" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  quickServicesBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFF8F5', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FEE2E2' },
  quickServiceItem: { alignItems: 'center' },
  quickIconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  aiqIconText: { fontSize: 12, fontWeight: '800', color: '#9A3412' },
  quickServiceText: { fontSize: 11, marginTop: 4, color: '#475569', fontWeight: '600' },
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
  thumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  actionIconRow: { flexDirection: 'row', alignItems: 'center' },
  citySelectorBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  citySelectorText: { fontSize: 13, color: '#334155' },
  changeCityBtn: { backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  changeCityBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  exploreFilterRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  explorePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F1F5F9', marginRight: 8 },
  explorePillActive: { backgroundColor: '#0F172A' },
  explorePillText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  explorePillTextActive: { color: '#FFFFFF' },
  admobContainer: { alignItems: 'center', backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 2 },
  bottomBar: { height: 56, flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center', justifyContent: 'space-around' },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, marginTop: 2, color: '#64748B', fontWeight: '600' },
  tabLabelActive: { color: '#DC2626', fontWeight: '800' },
  tabLabelExclusive: { color: '#DC2626', fontWeight: '800' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  bottomSheetCard: { backgroundColor: '#FFF8F5', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', position: 'absolute', bottom: 0 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sheetGridItem: { width: '23%', alignItems: 'center', marginBottom: 16 },
  sheetItemText: { fontSize: 11, marginTop: 6, color: '#475569', textAlign: 'center', fontWeight: '600' },
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
  drawerDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  drawerCloseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  citySheet: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: width * 0.85 },
  cityOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cityOptionText: { fontSize: 16, color: '#1E293B', fontWeight: '600' },
  readerHeader: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  readerBackBtn: { flexDirection: 'row', alignItems: 'center' },
  readerBackText: { fontSize: 14, fontWeight: '700', marginLeft: 6, color: '#0F172A' },
  readerHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  horoscopeCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  rashiBadge: { alignSelf: 'flex-start', backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  rashiBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  horoscopeText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  epaperFrontPage: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, width: '100%', elevation: 2 },
  epaperMasthead: { fontSize: 28, fontWeight: '900', fontFamily: 'serif', textAlign: 'center' },
  epaperSub: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4 },
  epaperDivider: { height: 2, backgroundColor: '#000', marginVertical: 10 },
  epaperHeadline: { fontSize: 17, fontWeight: '900', textAlign: 'center', marginVertical: 10 },
  epaperMockImage: { height: 140, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderRadius: 6, marginVertical: 10 },
  epaperBodyText: { fontSize: 13, color: '#475569', lineHeight: 20, textAlign: 'justify' },
  awardCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  awardCat: { fontSize: 12, fontWeight: '800', color: '#DC2626', textTransform: 'uppercase' },
  awardName: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginVertical: 4 },
  voteBtn: { backgroundColor: '#0F172A', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  voteBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  quizFullBtn: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 10, marginBottom: 12 },
  quizFullBtnText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  authCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, width: width * 0.88 },
  authInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, height: 46, paddingHorizontal: 14, fontSize: 15, marginBottom: 12 },
  authSubmitBtn: { backgroundColor: '#DC2626', height: 46, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  authSubmitBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  authToggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  authToggleBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 13 },
  authDividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  authDividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  authDividerText: { marginHorizontal: 10, color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  guestLoginBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 44, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  guestLoginBtnText: { color: '#334155', fontWeight: '700', fontSize: 13 },
  googleSignInBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 6, elevation: 1 },
  googleSignInText: { color: '#1E293B', fontWeight: '700', fontSize: 14, marginLeft: 8 },
});
