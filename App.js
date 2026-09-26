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
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { getHeadlines } from './src/api/newsApi';

const { width, height } = Dimensions.get('window');

const STRINGS = {
  en: {
    title: 'THE OX NEWS',
    mustRead: 'MUST READ',
    ticker: 'Cyber Security Alert: New financial malware targeting Indian banking portals.',
    sectionsTitle: 'SECTIONS',
    shortcuts: 'STATE & CITIES',
    bookmarks: 'Bookmarks',
    epaper: 'ePaper',
    talkToUs: 'Talk to us',
    changeCity: 'Select State / City',
    isThisCity: 'Current Location:',
    subscribe: 'SUBSCRIBE',
    marketPromo: 'Month End Offer: Flat 45% Off on Pro Markets',
    close: 'Close',
    back: 'Back',
    admobNotice: 'AdMob Test Banner: ca-app-pub-3940256099942544/6300978111',
    tabs: { feed: 'Newsfeed', markets: 'Markets', city: 'States', explore: 'Explore', exclusives: 'Cyber Sec' },
    cats: { India: 'India', CyberSec: 'Cyber Security', Sports: 'Sports', Entertainment: 'Entertainment', Business: 'Business', Technology: 'Tech', Science: 'Science' },
  },
  hi: {
    title: 'द ऑक्स न्यूज़',
    mustRead: 'ज़रूर पढ़ें',
    ticker: 'साइबर सुरक्षा चेतावनी: भारतीय बैंकिंग पोर्टल्स को निशाना बनाने वाला नया मैलवेयर पकड़ा गया।',
    sectionsTitle: 'प्रमुख श्रेणियां',
    shortcuts: 'राज्य एवं शहर',
    bookmarks: 'सहेजे गए समाचार',
    epaper: 'ई-पेपर',
    talkToUs: 'हमसे संपर्क करें',
    changeCity: 'राज्य/शहर बदलें',
    isThisCity: 'वर्तमान क्षेत्र:',
    subscribe: 'सब्सक्राइब',
    marketPromo: 'महीने का विशेष ऑफर: मार्केट प्रो पर 45% छूट',
    close: 'बंद करें',
    back: 'वापस जाएं',
    admobNotice: 'AdMob Test Banner: ca-app-pub-3940256099942544/6300978111',
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

  // WebView In-App Reader Modal
  const [webViewModal, setWebViewModal] = useState({ visible: false, url: '', title: '' });

  // Feature Screens
  const [activeFeatureScreen, setActiveFeatureScreen] = useState(null); // 'astrology', 'epaper', 'awards', 'quiz', 'aiq'

  // Menus
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Bookmarks & Dismissals
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [dismissedIds, setDismissedIds] = useState({});

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      let query = activeCategory;
      if (activeTab === 'markets') query = 'Stock Market India Sensex';
      else if (activeTab === 'delhi') query = selectedLocation + ' news';
      else if (activeTab === 'exclusives') query = 'Cyber security hacking scam India';
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

  const toggleLanguage = () => {
    setLang(l => (l === 'en' ? 'hi' : 'en'));
  };

  const toggleBookmark = (id, title) => {
    const isNow = !bookmarkedIds[id];
    setBookmarkedIds(prev => ({ ...prev, [id]: isNow }));
    Alert.alert(
      lang === 'hi' ? (isNow ? 'सहेज लिया गया' : 'हटा दिया गया') : (isNow ? 'Bookmarked' : 'Removed'),
      title.slice(0, 45) + '...'
    );
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

      {/* TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.iconBtn}>
          <Ionicons name="menu" size={28} color="#1E293B" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('newsfeed')} style={styles.headerCenter}>
          <Text style={styles.mastheadTitle}>{t.title}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langSwitchBtn}>
            <Text style={styles.langSwitchText}>{lang === 'en' ? 'हिन्दी' : 'ENG'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTAINER */}
      <View style={styles.container}>
        {activeTab === 'newsfeed' && (
          <>
            {/* Quick Action Buttons */}
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

            {/* Must Read Ticker */}
            <TouchableOpacity style={styles.tickerCard} onPress={() => { setActiveTab('exclusives'); loadFeed(); }}>
              <View style={styles.tickerBadge}>
                <Text style={styles.tickerBadgeText}>{t.mustRead}</Text>
              </View>
              <Text style={styles.tickerTitle} numberOfLines={2}>
                {t.ticker}
              </Text>
            </TouchableOpacity>

            {/* Horizontal Categories */}
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

        {/* States & Cities Header */}
        {activeTab === 'delhi' && (
          <View style={styles.citySelectorBanner}>
            <Text style={styles.citySelectorText}>{t.isThisCity} <Text style={{ fontWeight: '800' }}>{selectedLocation}</Text></Text>
            <TouchableOpacity style={styles.changeCityBtn} onPress={() => setLocationModalOpen(true)}>
              <Text style={styles.changeCityBtnText}>{t.changeCity}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Explore Categories Strip */}
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

        {/* ARTICLES FEED */}
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

              // Insert AdMob test banner after every 4 articles
              const showInFeedAd = index > 0 && index % 4 === 0;

              return (
                <View>
                  {showInFeedAd && (
                    <View style={styles.inFeedAdBox}>
                      <View style={styles.adTagSmall}><Text style={styles.adTagSmallText}>Ad</Text></View>
                      <Text style={styles.inFeedAdText}>AdMob Banner: ca-app-pub-3940256099942544/6300978111</Text>
                    </View>
                  )}

                  {isLargeLead ? (
                    <View style={styles.leadCard}>
                      <View style={styles.metaRow}>
                        <Text style={styles.sectionLabel}>{item.source || activeCategory}</Text>
                        <View style={styles.actionIconRow}>
                          <TouchableOpacity style={{ marginRight: 14 }} onPress={() => toggleBookmark(item.id, item.title)}>
                            <Ionicons
                              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                              size={18}
                              color={isBookmarked ? '#DC2626' : '#64748B'}
                            />
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
                            <Ionicons
                              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                              size={17}
                              color={isBookmarked ? '#DC2626' : '#64748B'}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setDismissedIds(p => ({ ...p, [item.id]: true }))}>
                            <Ionicons name="close" size={17} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.compactRow} onPress={() => openFullArticle(item)}>
                        <View style={styles.compactTextCol}>
                          <Text style={styles.compactTitle} numberOfLines={3}>
                            {item.title}
                          </Text>
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

      {/* ADMOB STICKY FOOTER TEST BANNER */}
      <View style={styles.admobBannerBar}>
        <View style={styles.admobTag}><Text style={styles.admobTagText}>Ad</Text></View>
        <Text style={styles.admobBannerText} numberOfLines={1}>{t.admobNotice}</Text>
      </View>

      {/* 5-TAB BOTTOM NAVIGATION */}
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

      {/* IN-APP MULTI-PAGE WEBVIEW READER */}
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

      {/* FULL FEATURE: COMPLETE 12 RASHIFAL SCREEN */}
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
                <View style={styles.rashiBadge}>
                  <Text style={styles.rashiBadgeText}>{item.rashi}</Text>
                </View>
                <Text style={styles.horoscopeText}>{item.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* FULL FEATURE: E-PAPER */}
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

      {/* FULL FEATURE: AWARDS */}
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

      {/* FULL FEATURE: QUIZ */}
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
              <TouchableOpacity onPress={() => setMoreModalOpen(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetGrid}>
              {[
                { title: lang === 'hi' ? 'राशिफल' : 'Astrology', icon: 'compass-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('astrology'); } },
                { title: lang === 'hi' ? 'ई-पेपर' : 'ePaper', icon: 'newspaper-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('epaper'); } },
                { title: lang === 'hi' ? 'अवार्ड्स' : 'Awards', icon: 'trophy-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('awards'); } },
                { title: lang === 'hi' ? 'क्विज़' : 'Quiz', icon: 'puzzle-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('quiz'); } },
              ].map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.sheetGridItem} onPress={item.action}>
                  <View style={styles.quickIconCircle}>
                    <MaterialCommunityIcons name={item.icon} size={22} color="#9A3412" />
                  </View>
                  <Text style={styles.sheetItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* SIDE DRAWER */}
      <Modal visible={drawerOpen} transparent animationType="fade">
        <View style={styles.drawerBackdrop}>
          <View style={styles.drawerContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.drawerProfileBox}>
                <View style={styles.profileAvatar}><Ionicons name="person" size={26} color="#FFF" /></View>
                <Text style={styles.drawerProfileText}>{lang === 'hi' ? 'प्रोफ़ाइल सिंक करें' : 'Sign in to sync bookmarks'}</Text>
                <TouchableOpacity style={styles.signInBtn} onPress={() => Alert.alert('OX Account', 'Logged in successfully.')}>
                  <Text style={styles.signInBtnText}>{lang === 'hi' ? 'लॉगिन करें →' : 'Sign In →'}</Text>
                </TouchableOpacity>
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
              <Ionicons name="close" size={20} color="#1E293B" />
              <Text style={{ marginLeft: 6, fontWeight: '700' }}>{t.close}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>

      {/* STATES & CITIES SELECTION MODAL */}
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
  header: {
    height: 54,
    backgroundColor: '#FFF8F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  mastheadTitle: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'serif',
    color: '#000000',
  },
  iconBtn: { padding: 4 },
  langSwitchBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
  },
  langSwitchText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  quickServicesBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF8F5',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  quickServiceItem: { alignItems: 'center' },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  aiqIconText: { fontSize: 12, fontWeight: '800', color: '#9A3412' },
  quickServiceText: { fontSize: 11, marginTop: 4, color: '#475569', fontWeight: '600' },
  tickerCard: {
    marginHorizontal: 14,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  tickerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
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
  citySelectorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  citySelectorText: { fontSize: 13, color: '#334155' },
  changeCityBtn: { backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  changeCityBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  exploreFilterRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  explorePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F1F5F9', marginRight: 8 },
  explorePillActive: { backgroundColor: '#0F172A' },
  explorePillText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  explorePillTextActive: { color: '#FFFFFF' },
  inFeedAdBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adTagSmall: { backgroundColor: '#D97706', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  adTagSmallText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  inFeedAdText: { fontSize: 11, color: '#78350F', fontFamily: 'monospace', flex: 1 },
  admobBannerBar: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  admobTag: { backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  admobTagText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  admobBannerText: { fontSize: 11, color: '#64748B', flex: 1, fontFamily: 'monospace' },
  bottomBar: {
    height: 56,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
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
  readerHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
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
});
