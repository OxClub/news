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
import { getHeadlines } from './src/api/newsApi';

const { width, height } = Dimensions.get('window');

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
    back: 'Back',
    admobNotice: 'AdMob Test Banner (ca-app-pub-3940256099942544/6300978111)',
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
    back: 'वापस जाएं',
    admobNotice: 'AdMob Test Banner (ca-app-pub-3940256099942544/6300978111)',
    tabs: { feed: 'न्यूज़फ़ीड', markets: 'बाज़ार', city: 'शहर', explore: 'एक्सप्लोर', exclusives: 'खास खबरें' },
    cats: { India: 'भारत', World: 'विदेश', Sports: 'खेल', Entertainment: 'मनोरंजन', Business: 'व्यापार', Technology: 'तकनीक', Science: 'विज्ञान' },
  },
};

const SECTIONS = ['India', 'World', 'Sports', 'Entertainment', 'Business', 'Technology', 'Science'];
const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad'];

export default function App() {
  const [lang, setLang] = useState('hi');
  const t = STRINGS[lang];

  const [activeTab, setActiveTab] = useState('newsfeed');
  const [activeCategory, setActiveCategory] = useState('India');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // In-App Article Viewer Modal
  const [readerModal, setReaderModal] = useState({ visible: false, article: null });

  // Full Screen Feature Modals
  const [activeFeatureScreen, setActiveFeatureScreen] = useState(null); // 'astrology', 'epaper', 'awards', 'quiz', 'aiq', 'video'

  // Standard Menus
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);

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
      setArticles(data || []);
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

  const openInAppArticle = (article) => {
    setReaderModal({ visible: true, article });
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
            {/* Top Quick Utility Buttons */}
            <View style={styles.quickServicesBar}>
              <TouchableOpacity style={styles.quickServiceItem} onPress={() => { setActiveTab('exclusives'); loadFeed(); }}>
                <View style={styles.quickIconCircle}>
                  <MaterialCommunityIcons name="plus-box-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>OX+</Text>
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
            <TouchableOpacity style={styles.tickerCard} onPress={() => setActiveFeatureScreen('awards')}>
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

        {/* City Header */}
        {activeTab === 'delhi' && (
          <View style={styles.citySelectorBanner}>
            <Text style={styles.citySelectorText}>{t.isThisCity} <Text style={{ fontWeight: '800' }}>{selectedCity}</Text></Text>
            <TouchableOpacity style={styles.changeCityBtn} onPress={() => setCityModalOpen(true)}>
              <Text style={styles.changeCityBtnText}>{t.changeCity}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Explore Categories Strip */}
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
                        <TouchableOpacity onPress={() => setDismissedIds(p => ({ ...p, [item.id]: true }))}>
                          <Ionicons name="close" size={19} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => openInAppArticle(item)}>
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
                      <TouchableOpacity onPress={() => setDismissedIds(p => ({ ...p, [item.id]: true }))}>
                        <Ionicons name="close" size={17} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.compactRow} onPress={() => openInAppArticle(item)}>
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

      {/* ADMOB TEST BANNER BAR */}
      <View style={styles.admobBannerBar}>
        <View style={styles.admobTag}>
          <Text style={styles.admobTagText}>Ad</Text>
        </View>
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

      {/* IN-APP ARTICLE READER MODAL (Browser bahar nahi jayega) */}
      <Modal visible={readerModal.visible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setReaderModal({ visible: false, article: null })} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle} numberOfLines={1}>OX Reader</Text>
            <TouchableOpacity onPress={() => readerModal.article && toggleBookmark(readerModal.article.id, readerModal.article.title)}>
              <Ionicons name="bookmark-outline" size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {readerModal.article && (
            <ScrollView contentContainerStyle={styles.readerBody}>
              <Text style={styles.readerCategoryTag}>{readerModal.article.source}</Text>
              <Text style={styles.readerArticleTitle}>{readerModal.article.title}</Text>
              <Text style={styles.readerDate}>{new Date().toDateString()} • OX Editorial Desk</Text>

              {readerModal.article.image_url ? (
                <Image source={{ uri: readerModal.article.image_url }} style={styles.readerBigImage} />
              ) : null}

              {/* IN-ARTICLE AD BANNER */}
              <View style={styles.inArticleAdBox}>
                <Text style={styles.inArticleAdTitle}>Google AdMob In-Feed Test Ad</Text>
                <Text style={styles.inArticleAdSub}>Slot ID: ca-app-pub-3940256099942544/1033173712</Text>
              </View>

              <Text style={styles.readerParagraph}>
                {readerModal.article.description || 'विस्तृत रिपोर्ट लोड हो रही है...'}
              </Text>
              <Text style={styles.readerParagraph}>
                {lang === 'hi'
                  ? 'इस घटनाक्रम के बाद संबंधित विभागों ने तत्काल समीक्षा बैठक बुलाई है। विशेषज्ञों का मानना है कि आने वाले दिनों में इसके महत्वपूर्ण परिणाम देखने को मिलेंगे। ज़मीनी स्तर पर जनता की प्रतिक्रिया भी काफी सकारात्मक देखी जा रही है।'
                  : 'Officials have convened an urgent high-level strategic review following this development. Analysts indicate this policy will bear significant outcomes across market verticals over the next quarter.'}
              </Text>
              <Text style={styles.readerParagraph}>
                {lang === 'hi'
                  ? 'अधिकारियों के अनुसार, सभी आवश्यक कदम उठा लिए गए हैं और नागरिकों को हर संभव सहायता पहुंचाई जा रही है।'
                  : 'According to authorized spokespersons, adequate measures are in place to ensure seamless facilitation.'}
              </Text>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* FULL FEATURE: RASHIFAL (HOROSCOPE) DETAIL SCREEN */}
      <Modal visible={activeFeatureScreen === 'astrology'} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFDF9' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setActiveFeatureScreen(null)} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle}>{lang === 'hi' ? 'दैनिक राशिफल' : 'Daily Horoscope'}</Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {[
              { rashi: 'मेष (Aries)', desc: 'आज कार्यक्षेत्र में नए अवसर मिलेंगे। आर्थिक स्थिति मजबूत होगी।', color: '#EF4444' },
              { rashi: 'वृषभ (Taurus)', desc: 'परिवार का सहयोग मिलेगा। लंबी यात्रा के योग बन रहे हैं।', color: '#F59E0B' },
              { rashi: 'मिथुन (Gemini)', desc: 'व्यापार में लाभ होगा। स्वास्थ्य पर थोड़ा ध्यान दें।', color: '#10B981' },
              { rashi: 'कर्क (Cancer)', desc: 'आत्मविश्वास में वृद्धि होगी। अटके हुए काम पूरे होंगे।', color: '#3B82F6' },
              { rashi: 'सिंह (Leo)', desc: 'मान-सम्मान में वृद्धि होगी। पदोन्नति की संभावना है।', color: '#8B5CF6' },
              { rashi: 'कन्या (Virgo)', desc: 'धन निवेश में समझदारी बरतें। मित्रों से सुखद भेंट होगी।', color: '#EC4899' },
            ].map((item, idx) => (
              <View key={idx} style={styles.horoscopeCard}>
                <View style={[styles.rashiBadge, { backgroundColor: item.color }]}>
                  <Text style={styles.rashiBadgeText}>{item.rashi}</Text>
                </View>
                <Text style={styles.horoscopeText}>{item.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* FULL FEATURE: E-PAPER SCREEN */}
      <Modal visible={activeFeatureScreen === 'epaper'} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setActiveFeatureScreen(null)} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle}>{lang === 'hi' ? 'ई-पेपर डिजिटल संस्करण' : 'OX ePaper Edition'}</Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
            <View style={styles.epaperFrontPage}>
              <Text style={styles.epaperMasthead}>THE OX NEWS</Text>
              <Text style={styles.epaperSub}>{new Date().toDateString()} • National Edition • Page 1</Text>
              <View style={styles.epaperDivider} />
              <Text style={styles.epaperHeadline}>
                {lang === 'hi' ? 'देशभर में डिजिटल क्रांति की नई उड़ान, नीतियों में बदलाव' : 'NATION LEAPS INTO NEW AI ERA WITH MULTI-BILLION MISSION'}
              </Text>
              <View style={styles.epaperMockImage}>
                <Ionicons name="image-outline" size={48} color="#94A3B8" />
              </View>
              <Text style={styles.epaperBodyText}>
                {lang === 'hi'
                  ? 'आज के मुख्य संस्करण में पढ़ें: बजट 2026 के मुख्य प्रस्ताव, रक्षा क्षेत्र में आत्मनिर्भरता और शिक्षा नीति के नए आयाम...'
                  : 'Inside this edition: 2026 budget proposals, semiconductor manufacturing expansion, and green energy investments...'}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* FULL FEATURE: AWARDS 2026 */}
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
            {[
              { cat: 'Best Tech Creator', name: 'Tech Insights India', votes: '14,290' },
              { cat: 'Young Entrepreneur', name: 'Nexus Solar Energy', votes: '11,840' },
              { cat: 'Investigative Journalism', name: 'Bharat Special Report', votes: '23,190' },
            ].map((nom, i) => (
              <View key={i} style={styles.awardCard}>
                <Text style={styles.awardCat}>{nom.cat}</Text>
                <Text style={styles.awardName}>{nom.name}</Text>
                <View style={styles.awardVoteRow}>
                  <Text style={styles.awardVotes}>Votes: {nom.votes}</Text>
                  <TouchableOpacity style={styles.voteBtn} onPress={() => Alert.alert('Vote Counted', `Voted for ${nom.name}!`)}>
                    <Text style={styles.voteBtnText}>Vote Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* FULL FEATURE: BRAIN QUIZ */}
      <Modal visible={activeFeatureScreen === 'quiz'} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setActiveFeatureScreen(null)} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle}>Daily Quiz Challenge</Text>
            <View style={{ width: 30 }} />
          </View>
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 12 }}>
              {lang === 'hi' ? 'प्रश्न: भारत का राष्ट्रीय खेल कौन सा माना जाता है?' : 'Question: What is traditionally celebrated as India national sport?'}
            </Text>
            {['Hockey / हॉकी', 'Cricket / क्रिकेट', 'Kabaddi / कबड्डी', 'Football / फुटबॉल'].map((ans, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quizFullBtn}
                onPress={() => Alert.alert(i === 0 ? 'Correct Answer! 🎉' : 'Incorrect!', i === 0 ? 'Hockey is historically celebrated.' : 'Try again tomorrow!')}
              >
                <Text style={styles.quizFullBtnText}>{ans}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* FULL FEATURE: AIQ TEST */}
      <Modal visible={activeFeatureScreen === 'aiq'} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setActiveFeatureScreen(null)} style={styles.readerBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
              <Text style={styles.readerBackText}>{t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.readerHeaderTitle}>AIQ Readiness Score</Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View style={styles.aiqScoreBadge}>
              <Text style={styles.aiqScoreNumber}>88/100</Text>
              <Text style={styles.aiqScoreLabel}>Advanced Digital Quotient</Text>
            </View>
            <Text style={{ fontSize: 16, lineHeight: 24, color: '#334155' }}>
              Your tech assessment is in the top 10 percentile for reader analytics this week. You demonstrate high literacy in prompt architecture, neural systems, and financial tech.
            </Text>
          </ScrollView>
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
                { title: lang === 'hi' ? 'क्विज़ गेम' : 'Quiz', icon: 'puzzle-outline', action: () => { setMoreModalOpen(false); setActiveFeatureScreen('quiz'); } },
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
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={26} color="#FFF" />
                </View>
                <Text style={styles.drawerProfileText}>
                  {lang === 'hi' ? 'अपनी पसंदीदा खबरें सहेजने के लिए साइन इन करें' : 'Sign in to sync your bookmarks'}
                </Text>
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={() => Alert.alert('OX Account', 'You are signed in as Guest Reader.')}
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
                onPress={() => {
                  setDrawerOpen(false);
                  setActiveFeatureScreen('epaper');
                }}
              >
                <Ionicons name="newspaper-outline" size={18} color="#334155" style={{ width: 26 }} />
                <Text style={styles.drawerRowText}>{t.epaper}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.drawerRow}
                onPress={() => {
                  setDrawerOpen(false);
                  setActiveFeatureScreen('astrology');
                }}
              >
                <Ionicons name="compass-outline" size={18} color="#334155" style={{ width: 26 }} />
                <Text style={styles.drawerRowText}>{lang === 'hi' ? 'राशिफल' : 'Horoscope'}</Text>
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
  admobBannerBar: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  admobTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  admobTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  admobBannerText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    fontFamily: 'monospace',
  },
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
  readerHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  readerBody: { padding: 18 },
  readerCategoryTag: { fontSize: 12, fontWeight: '800', color: '#DC2626', textTransform: 'uppercase', marginBottom: 6 },
  readerArticleTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', lineHeight: 30, marginBottom: 8 },
  readerDate: { fontSize: 12, color: '#94A3B8', marginBottom: 16 },
  readerBigImage: { width: '100%', height: 220, borderRadius: 12, marginBottom: 18, backgroundColor: '#F1F5F9' },
  inArticleAdBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    alignItems: 'center',
  },
  inArticleAdTitle: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  inArticleAdSub: { fontSize: 10, color: '#B45309', marginTop: 2, fontFamily: 'monospace' },
  readerParagraph: { fontSize: 16, lineHeight: 26, color: '#334155', marginBottom: 16 },
  horoscopeCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  rashiBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
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
  awardVoteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  awardVotes: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  voteBtn: { backgroundColor: '#0F172A', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  voteBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  quizFullBtn: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 10, marginBottom: 12 },
  quizFullBtnText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  aiqScoreBadge: { backgroundColor: '#EFF6FF', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  aiqScoreNumber: { fontSize: 44, fontWeight: '900', color: '#2563EB' },
  aiqScoreLabel: { fontSize: 14, fontWeight: '700', color: '#1D4ED8', marginTop: 4 },
});
