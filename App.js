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
import * as WebBrowser from 'expo-web-browser';
import { getHeadlines } from './src/api/newsApi';

const { width } = Dimensions.get('window');

const STRINGS = {
  en: {
    title: 'THE OX NEWS',
    mustRead: 'MUST READ',
    ticker: 'Asian Games Medal Tally: India hits record medals in key athletics & kabaddi.',
    sectionsTitle: 'SECTIONS',
    shortcuts: 'YOUR SHORTCUTS',
    bookmarks: 'Bookmarks',
    epaper: 'ePaper',
    talkToUs: 'Talk to us',
    changeCity: 'No, Change City',
    isThisCity: 'Is this your city?',
    subscribe: 'SUBSCRIBE',
    marketPromo: 'Month End Offer: Flat 45% Off on Pro Markets',
    close: 'Close',
    submit: 'Submit',
    tabs: { feed: 'Newsfeed', markets: 'Markets', city: 'City', explore: 'Explore', exclusives: 'Exclusives' },
    cats: { India: 'India', World: 'World', Sports: 'Sports', Entertainment: 'Entertainment', Business: 'Business', Technology: 'Technology', Science: 'Science' },
  },
  hi: {
    title: 'द ऑक्स न्यूज़',
    mustRead: 'ज़रूर पढ़ें',
    ticker: 'एशियाई खेल पदक तालिका: भारत ने कबड्डी और एथलेटिक्स में ऐतिहासिक पदक जीते।',
    sectionsTitle: 'प्रमुख श्रेणियां',
    shortcuts: 'शॉर्टकट',
    bookmarks: 'सहेजे गए समाचार',
    epaper: 'ई-पेपर',
    talkToUs: 'हमसे संपर्क करें',
    changeCity: 'शहर बदलें',
    isThisCity: 'क्या यह आपका शहर है?',
    subscribe: 'सब्सक्राइब',
    marketPromo: 'महीने का विशेष ऑफर: मार्केट प्रो पर 45% छूट',
    close: 'बंद करें',
    submit: 'जमा करें',
    tabs: { feed: 'न्यूज़फ़ीड', markets: 'बाज़ार', city: 'शहर', explore: 'एक्सप्लोर', exclusives: 'खास खबरें' },
    cats: { India: 'भारत', World: 'विदेश', Sports: 'खेल', Entertainment: 'मनोरंजन', Business: 'व्यापार', Technology: 'तकनीक', Science: 'विज्ञान' },
  },
};

const SECTIONS = ['India', 'World', 'Sports', 'Entertainment', 'Business', 'Technology', 'Science'];
const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad'];

export default function App() {
  const [lang, setLang] = useState('en');
  const t = STRINGS[lang];

  const [activeTab, setActiveTab] = useState('newsfeed');
  const [activeCategory, setActiveCategory] = useState('India');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [aiqModalOpen, setAiqModalOpen] = useState(false);
  const [awardsModalOpen, setAwardsModalOpen] = useState(false);
  const [featureModal, setFeatureModal] = useState({ visible: false, title: '', content: '' });

  // Quiz State for Games
  const [quizScore, setQuizScore] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Bookmarks & Dismissals
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [dismissedIds, setDismissedIds] = useState({});

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      let query = activeCategory;
      if (activeTab === 'markets') query = 'Investing';
      else if (activeTab === 'delhi') query = selectedCity;
      else if (activeTab === 'exclusives') query = 'India';
      else if (activeTab === 'explore') query = activeCategory;

      const data = await getHeadlines(query, lang);
      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, activeCategory, selectedCity, lang]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
  };

  const toggleBookmark = (id, title) => {
    const isNow = !bookmarkedIds[id];
    setBookmarkedIds(prev => ({ ...prev, [id]: isNow }));
    Alert.alert(
      lang === 'hi' ? (isNow ? 'सहेज लिया गया' : 'हटा दिया गया') : (isNow ? 'Bookmarked' : 'Removed'),
      title.slice(0, 45) + '...'
    );
  };

  const dismissArticle = (id) => {
    setDismissedIds(prev => ({ ...prev, [id]: true }));
  };

  const openArticle = async (url) => {
    if (url) {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  const openInfoModal = (title, content) => {
    setMoreModalOpen(false);
    setDrawerOpen(false);
    setFeatureModal({ visible: true, title, content });
  };

  // Interactive Quiz Data
  const QUIZ_QUESTIONS = [
    {
      q: lang === 'hi' ? 'भारत की राजधानी क्या है?' : 'What is the capital of India?',
      options: lang === 'hi' ? ['मुंबई', 'नई दिल्ली', 'कोलकाता', 'चेन्नई'] : ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'],
      correct: 1,
    },
    {
      q: lang === 'hi' ? 'कंप्यूटर में AI का पूर्ण रूप क्या है?' : 'What does AI stand for in tech?',
      options: lang === 'hi' ? ['आर्टिफिशियल इंटेलिजेंस', 'ऑटोमेटेड इंटरनेट', 'एप्पल इनसाइट', 'एक्टिव इंटरफेस'] : ['Artificial Intelligence', 'Automated Internet', 'Apple Insight', 'Active Interface'],
      correct: 0,
    },
  ];

  const handleQuizAnswer = (idx) => {
    if (quizAnswered) return;
    setQuizAnswered(true);
    if (idx === QUIZ_QUESTIONS[quizStep].correct) {
      setQuizScore(s => s + 1);
    }
  };

  const nextQuiz = () => {
    if (quizStep + 1 < QUIZ_QUESTIONS.length) {
      setQuizStep(s => s + 1);
      setQuizAnswered(false);
    } else {
      Alert.alert(lang === 'hi' ? 'क्विज़ पूरा हुआ!' : 'Quiz Completed!', `${lang === 'hi' ? 'आपका स्कोर:' : 'Your Score:'} ${quizScore + 1}/${QUIZ_QUESTIONS.length}`);
      setGameModalOpen(false);
      setQuizStep(0);
      setQuizScore(0);
      setQuizAnswered(false);
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

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Language Switch Button */}
          <TouchableOpacity onPress={toggleLanguage} style={styles.langSwitchBtn}>
            <Text style={styles.langSwitchText}>{lang === 'en' ? 'हिन्दी' : 'ENG'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => openInfoModal(lang === 'hi' ? 'सूचनाएं' : 'Notifications', lang === 'hi' ? 'आप सभी ताज़ा खबरों से अपडेट हैं।' : 'You have no new unread alerts.')}
          >
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN BODY */}
      <View style={styles.container}>
        {activeTab === 'newsfeed' && (
          <>
            {/* Top Shortcut Pill Actions */}
            <View style={styles.quickServicesBar}>
              <TouchableOpacity
                style={styles.quickServiceItem}
                onPress={() => {
                  setActiveTab('exclusives');
                  loadFeed();
                }}
              >
                <View style={styles.quickIconCircle}>
                  <MaterialCommunityIcons name="plus-box-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>OX+</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickServiceItem}
                onPress={() => setGameModalOpen(true)}
              >
                <View style={styles.quickIconCircle}>
                  <MaterialCommunityIcons name="puzzle-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>{lang === 'hi' ? 'खेल' : 'Games'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickServiceItem}
                onPress={() => setAiqModalOpen(true)}
              >
                <View style={styles.quickIconCircle}>
                  <Text style={styles.aiqIconText}>AIQ</Text>
                </View>
                <Text style={styles.quickServiceText}>AIQ Test</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickServiceItem}
                onPress={() => setAwardsModalOpen(true)}
              >
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

            {/* Must Read Breaking Ribbon */}
            <TouchableOpacity
              style={styles.tickerCard}
              onPress={() => openInfoModal(t.mustRead, t.ticker)}
            >
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

        {/* Markets Header */}
        {activeTab === 'markets' && (
          <View style={styles.subScreenHeader}>
            <View style={styles.marketPromoBanner}>
              <Text style={styles.marketPromoText}>{t.marketPromo}</Text>
              <TouchableOpacity
                style={styles.subscribeBtn}
                onPress={() => openInfoModal(t.subscribe, lang === 'hi' ? 'ऑक्स मार्केट प्रो सदस्यता शुरू हो गई है।' : 'Subscribed to OX Markets Pro!')}
              >
                <Text style={styles.subscribeBtnText}>{t.subscribe}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.marketToolsGrid}>
              {[
                { title: 'Stocks', label: lang === 'hi' ? 'शेयर' : 'Stocks', query: 'Nifty Sensex Stocks' },
                { title: 'Gold', label: lang === 'hi' ? 'सोना' : 'Gold', query: 'Gold Silver Commodity' },
                { title: 'Banking', label: lang === 'hi' ? 'बैंक' : 'Banking', query: 'Banking RBI' },
                { title: 'Crypto', label: lang === 'hi' ? 'क्रिप्टो' : 'Crypto', query: 'Bitcoin Crypto' },
              ].map((tool, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.marketToolItem}
                  onPress={async () => {
                    setLoading(true);
                    const res = await getHeadlines(tool.query, lang);
                    setArticles(res);
                    setLoading(false);
                  }}
                >
                  <View style={styles.marketIconBg}>
                    <FontAwesome5 name="chart-line" size={16} color="#DC2626" />
                  </View>
                  <Text style={styles.marketToolLabel}>{tool.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* City Header */}
        {activeTab === 'delhi' && (
          <View style={styles.citySelectorBanner}>
            <Text style={styles.citySelectorText}>{t.isThisCity} <Text style={{ fontWeight: '800' }}>{selectedCity}</Text></Text>
            <TouchableOpacity style={styles.changeCityBtn} onPress={() => setCityModalOpen(true)}>
              <Text style={styles.changeCityBtnText}>{t.changeCity}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Explore Categories Strip (Loads real news on click) */}
        {activeTab === 'explore' && (
          <View style={styles.exploreFilterRow}>
            {['All', 'Parenting', 'Investing', 'Technology', 'Science'].map((item) => (
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

        {/* FEED LIST */}
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

              if (isLargeLead) {
                return (
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
                        <TouchableOpacity onPress={() => dismissArticle(item.id)}>
                          <Ionicons name="close" size={19} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => openArticle(item.url)}>
                      <Text style={styles.leadTitle}>{item.title}</Text>
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.leadImage} />
                      ) : null}
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
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
                      <TouchableOpacity onPress={() => dismissArticle(item.id)}>
                        <Ionicons name="close" size={17} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.compactRow} onPress={() => openArticle(item.url)}>
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
              );
            }}
          />
        )}
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
          <Text style={[styles.tabLabel, activeTab === 'delhi' && styles.tabLabelActive]}>{selectedCity}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('explore')}>
          <Ionicons name="compass-outline" size={21} color={activeTab === 'explore' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'explore' && styles.tabLabelActive]}>{t.tabs.explore}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('exclusives')}>
          <MaterialCommunityIcons name="crown-outline" size={22} color={activeTab === 'exclusives' ? '#EAB308' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'exclusives' && styles.tabLabelExclusive]}>{t.tabs.exclusives}</Text>
        </TouchableOpacity>
      </View>

      {/* GAMES INTERACTIVE QUIZ MODAL */}
      <Modal visible={gameModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🎯 {lang === 'hi' ? 'दैनिक क्विज़' : 'Daily Brain Quiz'}</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
              {lang === 'hi' ? `प्रश्न ${quizStep + 1} / ${QUIZ_QUESTIONS.length}` : `Question ${quizStep + 1} of ${QUIZ_QUESTIONS.length}`}
            </Text>
            <Text style={styles.featureContent}>{QUIZ_QUESTIONS[quizStep].q}</Text>

            {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.quizOptionBtn,
                  quizAnswered && i === QUIZ_QUESTIONS[quizStep].correct && styles.quizOptionCorrect,
                ]}
                onPress={() => handleQuizAnswer(i)}
              >
                <Text style={styles.quizOptionText}>{opt}</Text>
              </TouchableOpacity>
            ))}

            {quizAnswered && (
              <TouchableOpacity style={styles.featureCloseBtn} onPress={nextQuiz}>
                <Text style={styles.featureCloseBtnText}>{lang === 'hi' ? 'अगला प्रश्न →' : 'Next Question →'}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 14 }} onPress={() => setGameModalOpen(false)}>
              <Text style={{ color: '#94A3B8' }}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AIQ TEST MODAL */}
      <Modal visible={aiqModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🧠 AIQ Tech Readiness Test</Text>
            <Text style={styles.featureContent}>
              {lang === 'hi'
                ? 'आपका AI और टेक स्कोर: 85% (अग्रणी पाठक)\n\nआज के मुख्य रुझान:\n1. Generative AI और रोबोटिक्स\n2. भारत में सेमीकंडक्टर निर्माण'
                : 'Your AI & Innovation Index: 85/100 (Advanced)\n\nKey Insights:\n1. GenAI Enterprise Adoption\n2. India Semiconductor Mission updates'}
            </Text>
            <TouchableOpacity style={styles.featureCloseBtn} onPress={() => setAiqModalOpen(false)}>
              <Text style={styles.featureCloseBtnText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AWARDS 2026 MODAL */}
      <Modal visible={awardsModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🏆 OX Awards 2026</Text>
            <Text style={styles.featureContent}>
              {lang === 'hi'
                ? 'वर्ष 2026 के शीर्ष नामांकित व्यक्ति:\n• बेस्ट एआई स्टार्टअप: नेक्सस लैब्स\n• उत्कृष्ट पत्रकारिता: डिजिटल भारत रिपोर्ट\n• यंग इनोवेटर ऑफ द ईयर: टेक सॉल्यूशंस'
                : 'Top Nominees of 2026:\n• Best AI Venture: Nexus Labs\n• Investigative Journalism: Digital Bharat Report\n• Young Innovator of the Year: Tech Solutions'}
            </Text>
            <TouchableOpacity style={styles.featureCloseBtn} onPress={() => setAwardsModalOpen(false)}>
              <Text style={styles.featureCloseBtnText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
                { title: lang === 'hi' ? 'राशिफल' : 'Astrology', icon: 'compass-outline', info: lang === 'hi' ? 'आज का दिन सभी राशियों के लिए लाभकारी और उन्नति वाला रहेगा।' : 'Today is favourable for career growth and major investment decisions.' },
                { title: lang === 'hi' ? 'वीडियो' : 'Videos', icon: 'play-box-outline', info: lang === 'hi' ? '60-सेकंड की देश-विदेश की ताज़ा वीडियो बुलेटिन लोड हो रही हैं।' : 'Streaming 60-second top trending news video reels.' },
                { title: lang === 'hi' ? 'योग क्लास' : 'Yoga', icon: 'human', info: lang === 'hi' ? 'दैनिक प्राणायाम और तनाव मुक्ति सत्र सुबह 6:00 बजे लाइव होगा।' : 'Daily mindfulness and pranayama session streams at 6:00 AM.' },
                { title: lang === 'hi' ? 'क्रेडिट स्कोर' : 'Credit Score', icon: 'speedometer', info: lang === 'hi' ? 'आपका सिबिल स्कोर 780 है (उत्कृष्ट)।' : 'Your estimated credit score is 780 (Excellent).' },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.sheetGridItem}
                  onPress={() => openInfoModal(item.title, item.info)}
                >
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
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={26} color="#FFF" />
                </View>
                <Text style={styles.drawerProfileText}>{lang === 'hi' ? 'अपनी पसंदीदा खबरें सहेजने के लिए साइन इन करें' : 'Sign in to sync your bookmarks'}</Text>
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={() => openInfoModal('Sign In', lang === 'hi' ? 'गूगल या ईमेल से लॉगिन सफल रहा।' : 'Account successfully synced.')}
                >
                  <Text style={styles.signInBtnText}>{lang === 'hi' ? 'लॉगिन करें →' : 'Sign In  →'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.drawerSectionHeading}>{t.sectionsTitle}</Text>
              {SECTIONS.map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={styles.drawerRow}
                  onPress={() => {
                    setActiveCategory(sec);
                    setDrawerOpen(false);
                  }}
                >
                  <Ionicons name="chevron-forward-outline" size={16} color="#64748B" style={{ width: 24 }} />
                  <Text style={styles.drawerRowText}>{t.cats[sec] || sec}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.drawerDivider} />
              <Text style={styles.drawerSectionHeading}>{t.shortcuts}</Text>
              <TouchableOpacity
                style={styles.drawerRow}
                onPress={() => openInfoModal(t.epaper, lang === 'hi' ? 'आज का ई-पेपर संस्करण उपलब्ध है।' : 'Today\'s digital paper edition is ready to read.')}
              >
                <Ionicons name="newspaper-outline" size={18} color="#334155" style={{ width: 26 }} />
                <Text style={styles.drawerRowText}>{t.epaper}</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setDrawerOpen(false)}>
              <Ionicons name="close" size={20} color="#1E293B" />
              <Text style={{ marginLeft: 6, fontWeight: '700' }}>{t.close}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>

      {/* CITY SELECTION MODAL */}
      <Modal visible={cityModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.citySheet}>
            <Text style={styles.sheetTitle}>{lang === 'hi' ? 'अपना शहर चुनें' : 'Select Your City'}</Text>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={styles.cityOptionRow}
                onPress={() => {
                  setSelectedCity(city);
                  setCityModalOpen(false);
                }}
              >
                <Text style={[styles.cityOptionText, selectedCity === city && { color: '#DC2626', fontWeight: '800' }]}>{city}</Text>
                {selectedCity === city && <Ionicons name="checkmark-circle" size={20} color="#DC2626" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* INFO / POPUP MODAL */}
      <Modal visible={featureModal.visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>{featureModal.title}</Text>
            <Text style={styles.featureContent}>{featureModal.content}</Text>
            <TouchableOpacity style={styles.featureCloseBtn} onPress={() => setFeatureModal({ visible: false, title: '', content: '' })}>
              <Text style={styles.featureCloseBtnText}>{t.close}</Text>
            </TouchableOpacity>
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
    marginRight: 8,
  },
  langSwitchText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
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
  subScreenHeader: { backgroundColor: '#FEF3C7', padding: 12 },
  marketPromoBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  marketPromoText: { fontSize: 12, fontWeight: '700', color: '#78350F', flex: 1 },
  subscribeBtn: { backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, marginLeft: 8 },
  subscribeBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  marketToolsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  marketToolItem: { alignItems: 'center' },
  marketIconBg: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  marketToolLabel: { fontSize: 11, marginTop: 4, color: '#475569', fontWeight: '600' },
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
  bottomBar: {
    height: 58,
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
  tabLabelExclusive: { color: '#CA8A04', fontWeight: '800' },
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
  featureCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: width * 0.85 },
  featureTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  featureContent: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 },
  featureCloseBtn: { backgroundColor: '#DC2626', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  featureCloseBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  quizOptionBtn: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginBottom: 8 },
  quizOptionCorrect: { backgroundColor: '#DCFCE7', borderColor: '#16A34A', borderWidth: 1 },
  quizOptionText: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
});
