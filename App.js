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

const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad'];

const SECTIONS = [
  { id: 'India', icon: 'flag-outline' },
  { id: 'World', icon: 'earth-outline' },
  { id: 'Sports', icon: 'football-outline' },
  { id: 'Entertainment', icon: 'film-outline' },
  { id: 'Business', icon: 'cash-outline' },
  { id: 'Technology', icon: 'hardware-chip-outline' },
  { id: 'Science', icon: 'flask-outline' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('newsfeed');
  const [activeCategory, setActiveCategory] = useState('India');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals & Drawers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [featureModal, setFeatureModal] = useState({ visible: false, title: '', content: '' });
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Article state tracking
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [dismissedIds, setDismissedIds] = useState({});

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      let query = activeCategory;
      if (activeTab === 'markets') query = 'sensex nifty stock market';
      else if (activeTab === 'delhi') query = selectedCity;
      else if (activeTab === 'exclusives') query = 'investigative analysis';
      else if (activeTab === 'explore') query = 'trends innovation';

      const data = await getHeadlines(query);
      setArticles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, activeCategory, selectedCity]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const toggleBookmark = (id, title) => {
    const isNow = !bookmarkedIds[id];
    setBookmarkedIds(prev => ({ ...prev, [id]: isNow }));
    Alert.alert(isNow ? 'Saved to Bookmarks' : 'Removed from Bookmarks', `"${title.slice(0, 45)}..."`);
  };

  const dismissArticle = (id) => {
    setDismissedIds(prev => ({ ...prev, [id]: true }));
  };

  const openArticle = async (url) => {
    if (url) {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  const openFeatureModal = (title, content) => {
    setMoreModalOpen(false);
    setDrawerOpen(false);
    setFeatureModal({ visible: true, title, content });
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    setSearchModalOpen(false);
    setLoading(true);
    try {
      const data = await getHeadlines(searchQuery);
      setArticles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
          <Text style={styles.mastheadTitle}>THE OX NEWS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => openFeatureModal('Notifications', 'You are caught up with all live breaking updates.')}
        >
          <Ionicons name="notifications-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* BODY CONTENT */}
      <View style={styles.container}>
        {activeTab === 'newsfeed' && (
          <>
            {/* Quick Service Action Buttons */}
            <View style={styles.quickServicesBar}>
              <TouchableOpacity
                style={styles.quickServiceItem}
                onPress={() => openFeatureModal('OX+ Premium', 'Unlock ad-free investigative reports, global editorials, and private newsletters.')}
              >
                <View style={styles.quickIconCircle}>
                  <MaterialCommunityIcons name="plus-box-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>OX+</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickServiceItem}
                onPress={() => openFeatureModal('OX Games & Puzzles', 'Daily Crossword #481\nMini Sudoku\nWord Scramble\n\nDaily leaderboard resets in 4 hours.')}
              >
                <View style={styles.quickIconCircle}>
                  <MaterialCommunityIcons name="puzzle-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>Games</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickServiceItem}
                onPress={() => openFeatureModal('AIQ Knowledge Test', 'Test your Tech & AI IQ:\nQ1: What does LLM stand for?\nScore: 8/10 (Top 15% of readers this week).')}
              >
                <View style={styles.quickIconCircle}>
                  <Text style={styles.aiqIconText}>AIQ</Text>
                </View>
                <Text style={styles.quickServiceText}>AIQ Test</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickServiceItem}
                onPress={() => openFeatureModal('Home & Decor Awards 2026', 'Voting open for the 2026 Urban Architecture and Eco Living nominations.')}
              >
                <View style={styles.quickIconCircle}>
                  <Ionicons name="people-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>Awards</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickServiceItem} onPress={() => setMoreModalOpen(true)}>
                <View style={styles.quickIconCircle}>
                  <Ionicons name="apps-outline" size={20} color="#9A3412" />
                </View>
                <Text style={styles.quickServiceText}>More</Text>
              </TouchableOpacity>
            </View>

            {/* Must Read Ticker Button */}
            <TouchableOpacity
              style={styles.tickerCard}
              onPress={() => openFeatureModal('Must Read Analysis', 'Asian Games Medal Tally: India crosses double digits with historic kabaddi & badminton sweeps.')}
            >
              <View style={styles.tickerBadge}>
                <Text style={styles.tickerBadgeText}>Must Read</Text>
              </View>
              <Text style={styles.tickerTitle} numberOfLines={2}>
                Asian Games Medal Tally: How two kabaddi golds helped India break back into top 10
              </Text>
            </TouchableOpacity>

            {/* Category Scroll Strip */}
            <View style={styles.categoryScrollWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {SECTIONS.map((sec) => {
                  const isCurrent = activeCategory === sec.id;
                  return (
                    <TouchableOpacity
                      key={sec.id}
                      style={[styles.categoryTab, isCurrent && styles.categoryTabActive]}
                      onPress={() => setActiveCategory(sec.id)}
                    >
                      <Text style={[styles.categoryTabText, isCurrent && styles.categoryTabTextActive]}>
                        {sec.id}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        )}

        {/* Markets Screen Layout */}
        {activeTab === 'markets' && (
          <View style={styles.subScreenHeader}>
            <View style={styles.marketPromoBanner}>
              <Text style={styles.marketPromoText}>Month End Offer: Flat 45% Off!</Text>
              <TouchableOpacity
                style={styles.subscribeBtn}
                onPress={() => openFeatureModal('Subscribe to Markets Pro', 'Get real-time algorithmic trades, screener alerts, and portfolio tracking for ₹2,599/yr.')}
              >
                <Text style={styles.subscribeBtnText}>SUBSCRIBE</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.marketToolsGrid}>
              {[
                { title: 'Stocks', icon: 'chart-line' },
                { title: 'News', icon: 'newspaper' },
                { title: 'Recos', icon: 'thumbs-up' },
                { title: 'Screener', icon: 'filter' },
                { title: 'Masterclass', icon: 'graduation-cap' },
              ].map((tool, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.marketToolItem}
                  onPress={() => openFeatureModal(tool.title, `Loading real-time ${tool.title} insights and analytics feed...`)}
                >
                  <View style={styles.marketIconBg}>
                    <FontAwesome5 name={tool.icon} size={16} color="#0F172A" />
                  </View>
                  <Text style={styles.marketToolLabel}>{tool.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Delhi / City Screen Layout */}
        {activeTab === 'delhi' && (
          <View style={styles.citySelectorBanner}>
            <Text style={styles.citySelectorText}>Is this your city? <Text style={{ fontWeight: '800' }}>{selectedCity}</Text></Text>
            <TouchableOpacity style={styles.changeCityBtn} onPress={() => setCityModalOpen(true)}>
              <Text style={styles.changeCityBtnText}>No, Change City</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Explore Screen Layout */}
        {activeTab === 'explore' && (
          <View style={styles.exploreFilterRow}>
            {['All', 'Free', 'Parenting', 'News', 'Investing'].map((cat, i) => (
              <TouchableOpacity
                key={cat}
                style={[styles.explorePill, i === 0 && styles.explorePillActive]}
                onPress={() => openFeatureModal(cat, `Browsing trending curation for "${cat}".`)}
              >
                <Text style={[styles.explorePillText, i === 0 && styles.explorePillTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STORIES FLATLIST */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#DC2626" />
          </View>
        ) : (
          <FlatList
            data={visibleArticles}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#DC2626']} />}
            renderItem={({ item, index }) => {
              const isLargeLead = index === 0;
              const isBookmarked = !!bookmarkedIds[item.id];

              if (isLargeLead) {
                return (
                  <View style={styles.leadCard}>
                    <View style={styles.metaRow}>
                      <Text style={styles.sectionLabel}>{item.source || activeCategory}</Text>
                      <View style={styles.actionIconRow}>
                        <TouchableOpacity style={{ marginRight: 12 }} onPress={() => toggleBookmark(item.id, item.title)}>
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
          <Text style={[styles.tabLabel, activeTab === 'newsfeed' && styles.tabLabelActive]}>Newsfeed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('markets')}>
          <Ionicons name="trending-up-outline" size={21} color={activeTab === 'markets' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'markets' && styles.tabLabelActive]}>Markets</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('delhi')}>
          <Ionicons name="location-outline" size={21} color={activeTab === 'delhi' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'delhi' && styles.tabLabelActive]}>{selectedCity}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('explore')}>
          <Ionicons name="compass-outline" size={21} color={activeTab === 'explore' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'explore' && styles.tabLabelActive]}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('exclusives')}>
          <MaterialCommunityIcons name="crown-outline" size={22} color={activeTab === 'exclusives' ? '#EAB308' : '#64748B'} />
          <Text style={[styles.tabLabel, activeTab === 'exclusives' && styles.tabLabelExclusive]}>Exclusives</Text>
        </TouchableOpacity>
      </View>

      {/* MORE ON OX BOTTOM SHEET */}
      <Modal visible={moreModalOpen} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setMoreModalOpen(false)}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>More on OX News</Text>
              <TouchableOpacity onPress={() => setMoreModalOpen(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetGrid}>
              {[
                { title: 'OX+', icon: 'plus-box-outline', desc: 'Subscriber benefits & premium stories' },
                { title: 'Games', icon: 'puzzle-outline', desc: 'Daily word & math games' },
                { title: 'AIQ Test', icon: 'brain', desc: 'AI readiness quiz' },
                { title: 'Awards 2026', icon: 'trophy-outline', desc: 'Tech & design awards' },
                { title: 'Astrology', icon: 'compass-outline', desc: 'Horoscopes & birth charts' },
                { title: 'Retirement', icon: 'chart-pie', desc: 'Financial planning calculators' },
                { title: 'Videos', icon: 'play-box-outline', desc: 'Curated 60-second video stories' },
                { title: 'Credit Score', icon: 'speedometer', desc: 'Free credit health monitor' },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.sheetGridItem}
                  onPress={() => openFeatureModal(item.title, item.desc)}
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
              {/* Profile Box */}
              <View style={styles.drawerProfileBox}>
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={26} color="#FFF" />
                </View>
                <Text style={styles.drawerProfileText}>Sign in to save your reading history</Text>
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={() => openFeatureModal('Sign In', 'Enter your email or Google Account to sync bookmarks and subscriptions across devices.')}
                >
                  <Text style={styles.signInBtnText}>Sign In  →</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.drawerSectionHeading}>Sections</Text>
              {SECTIONS.map((sec) => (
                <TouchableOpacity
                  key={sec.id}
                  style={styles.drawerRow}
                  onPress={() => {
                    setActiveCategory(sec.id);
                    setDrawerOpen(false);
                  }}
                >
                  <Ionicons name={sec.icon} size={20} color="#334155" style={{ width: 30 }} />
                  <Text style={styles.drawerRowText}>{sec.id}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.drawerDivider} />
              <Text style={styles.drawerSectionHeading}>Your Shortcuts</Text>
              <TouchableOpacity
                style={styles.drawerRow}
                onPress={() => openFeatureModal('OX ePaper', 'Digital replica edition of today\'s daily newspaper.')}
              >
                <Ionicons name="newspaper-outline" size={20} color="#334155" style={{ width: 30 }} />
                <Text style={styles.drawerRowText}>ePaper</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.drawerRow}
                onPress={() => {
                  setDrawerOpen(false);
                  Alert.alert('Saved Bookmarks', `You have ${Object.values(bookmarkedIds).filter(Boolean).length} article(s) saved.`);
                }}
              >
                <Ionicons name="bookmark-outline" size={20} color="#334155" style={{ width: 30 }} />
                <Text style={styles.drawerRowText}>Bookmarks ({Object.values(bookmarkedIds).filter(Boolean).length})</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Bottom Drawer Actions */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity
                style={styles.footerActionItem}
                onPress={() => openFeatureModal('Talk to Us', 'Send questions or news tips to editorial@oxnews.app')}
              >
                <Ionicons name="mail-outline" size={18} color="#334155" />
                <Text style={styles.footerActionText}>Talk to us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.footerActionItem} onPress={() => { setDrawerOpen(false); setSearchModalOpen(true); }}>
                <Ionicons name="search-outline" size={18} color="#334155" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.footerActionItem} onPress={() => openFeatureModal('Settings', 'App Version: 1.0.5\nTheme: Light\nPush Notifications: Active')}>
                <Ionicons name="settings-outline" size={18} color="#334155" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>

      {/* CITY PICKER MODAL */}
      <Modal visible={cityModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.citySheet}>
            <Text style={styles.sheetTitle}>Select Your City</Text>
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

      {/* SEARCH MODAL */}
      <Modal visible={searchModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.searchSheet}>
            <View style={styles.searchBarRow}>
              <TextInput
                placeholder="Search topics, news, stocks..."
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSubmit}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Search</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 12 }} onPress={() => setSearchModalOpen(false)}>
              <Text style={{ color: '#64748B', fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* GENERIC FEATURE DETAIL MODAL */}
      <Modal visible={featureModal.visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>{featureModal.title}</Text>
            <Text style={styles.featureContent}>{featureModal.content}</Text>
            <TouchableOpacity style={styles.featureCloseBtn} onPress={() => setFeatureModal({ visible: false, title: '', content: '' })}>
              <Text style={styles.featureCloseBtnText}>Done</Text>
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
    height: 52,
    backgroundColor: '#FFF8F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  mastheadTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'serif',
    color: '#000000',
  },
  iconBtn: { padding: 4 },
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
  leadTitle: { fontSize: 19, fontWeight: '800', lineHeight: 25, color: '#0F172A', marginBottom: 10 },
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheetCard: { backgroundColor: '#FFF8F5', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
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
  drawerSectionHeading: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 10, marginTop: 6 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  drawerRowText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  drawerDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  drawerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerActionItem: { flexDirection: 'row', alignItems: 'center' },
  footerActionText: { marginLeft: 4, fontSize: 12, fontWeight: '700', color: '#334155' },
  citySheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  cityOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cityOptionText: { fontSize: 16, color: '#1E293B', fontWeight: '600' },
  searchSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  searchBarRow: { flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: 44, backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 14, fontSize: 15 },
  searchBtn: { backgroundColor: '#0F172A', paddingHorizontal: 16, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 8 },
  featureCard: { backgroundColor: '#FFFFFF', margin: 24, borderRadius: 16, padding: 24, alignSelf: 'center', width: width * 0.85 },
  featureTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  featureContent: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 20 },
  featureCloseBtn: { backgroundColor: '#DC2626', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  featureCloseBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
