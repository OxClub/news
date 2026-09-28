import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, FlatList, ScrollView, TouchableOpacity, Image, Modal,
  ActivityIndicator, RefreshControl, StyleSheet, StatusBar, Dimensions, Alert, TextInput, KeyboardAvoidingView, Platform, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { getHeadlines } from './src/api/newsApi';

const { width } = Dimensions.get('window');
const AD_UNIT = __DEV__ ? TestIds.BANNER : 'ca-app-pub-6509298197152386/1259197573';

const STRINGS = {
  hi: {
    appName: 'द ऑक्स न्यूज़', liveLabel: 'LIVE', tickerText: 'दुनिया भर की ताज़ा और ब्रेकिंग खबरें, सीधे आपके फोन पर।',
    home: 'होम', state: 'राज्य', search: 'खोजें', searchHint: 'कोई भी विषय या खबर खोजें...', guest: 'गेस्ट यूज़र', 
    loginText: 'लॉगिन / रजिस्टर करें', logout: 'लॉगआउट करें', close: 'बंद करें', back: 'वापस', allCats: 'सभी कैटेगरीज', 
    langToggle: 'ENG', authTitle: 'एक टैप। सब कुछ अनलॉक करें।', emailLogin: 'ईमेल से जारी रखें', phoneLogin: 'मोबाइल नंबर से जारी रखें',
    googleLogin: 'गूगल से लॉगिन करें', or: 'या', emailLabel: 'अपना ईमेल दर्ज करें', phoneLabel: 'अपना 10 अंकों का मोबाइल नंबर डालें',
    passLabel: 'पासवर्ड', submit: 'सबमिट करें', createAcc: 'नया अकाउंट बनाएं', shareText: 'द ऑक्स न्यूज़ ऐप डाउनलोड करें: दुनिया की ताज़ा खबरें सीधे आपके फोन पर! अभी इंस्टॉल करें।'
  },
  en: {
    appName: 'THE OX NEWS', liveLabel: 'LIVE', tickerText: 'Latest breaking news from around the world, right on your phone.',
    home: 'Home', state: 'State', search: 'Search', searchHint: 'Search topics or news...', guest: 'Guest User', 
    loginText: 'Login / Register', logout: 'Logout', close: 'Close', back: 'Back', allCats: 'All Categories', 
    langToggle: 'हिंदी', authTitle: 'One tap. Unlock it all.', emailLogin: 'Continue with Email', phoneLogin: 'Continue with Mobile',
    googleLogin: 'Login with Google', or: 'Or', emailLabel: 'Enter your Email', phoneLabel: 'Enter 10-digit Mobile Number',
    passLabel: 'Password', submit: 'Submit', createAcc: 'Create New Account', shareText: 'Download OX News app: Latest news right on your phone! Install now.'
  }
};

const CATEGORIES = {
  hi: [
    { id: 'breaking', name: 'ब्रेकिंग न्यूज़', query: 'ताज़ा खबर' },
    { id: 'india', name: 'भारत', query: 'भारत समाचार' },
    { id: 'world', name: 'दुनिया संसार', query: 'अंतरराष्ट्रीय न्यूज़' },
    { id: 'entertainment', name: 'मनोरंजन', query: 'बॉलीवुड न्यूज़' },
    { id: 'movies', name: 'मूवीज', query: 'सिनेमा रिव्यू' },
    { id: 'webseries', name: 'वेब सीरीज', query: 'वेब सीरीज' },
    { id: 'tech', name: 'तकनीक', query: 'टेक्नोलॉजी न्यूज़' },
    { id: 'cyber', name: 'साइबर सिक्योरिटी', query: 'साइबर सुरक्षा हैकिंग' },
    { id: 'gaming', name: 'गेमिंग', query: 'वीडियो गेम' },
    { id: 'sports', name: 'खेल', query: 'क्रिकेट समाचार' },
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

const STATES = [
  { id: 'delhi', hi: 'दिल्ली', en: 'Delhi', qHi: 'दिल्ली न्यूज़', qEn: 'Delhi News' },
  { id: 'bihar', hi: 'बिहार', en: 'Bihar', qHi: 'बिहार न्यूज़', qEn: 'Bihar News' },
  { id: 'up', hi: 'उत्तर प्रदेश', en: 'UP', qHi: 'उत्तर प्रदेश न्यूज़', qEn: 'UP News' },
  { id: 'maharashtra', hi: 'महाराष्ट्र', en: 'Maharashtra', qHi: 'महाराष्ट्र न्यूज़', qEn: 'Maharashtra News' },
  { id: 'rajasthan', hi: 'राजस्थान', en: 'Rajasthan', qHi: 'राजस्थान न्यूज़', qEn: 'Rajasthan News' },
  { id: 'jharkhand', hi: 'झारखंड', en: 'Jharkhand', qHi: 'झारखंड न्यूज़', qEn: 'Jharkhand News' },
  { id: 'mp', hi: 'मध्य प्रदेश', en: 'MP', qHi: 'मध्य प्रदेश न्यूज़', qEn: 'MP News' },
  { id: 'gujarat', hi: 'गुजरात', en: 'Gujarat', qHi: 'गुजरात न्यूज़', qEn: 'Gujarat News' }
];

export default function App() {
  const [lang, setLang] = useState('hi');
  const t = STRINGS[lang];
  
  const [activeTab, setActiveTab] = useState('home');
  const [activeCatId, setActiveCatId] = useState('breaking');
  const [selectedStateId, setSelectedStateId] = useState('bihar');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('main');
  const [webViewModal, setWebViewModal] = useState({ visible: false, url: '', title: '' });

  // Auth States
  const [inputVal, setInputVal] = useState('');
  const [passVal, setPassVal] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [otpVal, setOtpVal] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

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
    let query = '';
    
    if (activeTab === 'search') {
      query = searchQuery || (lang === 'hi' ? 'ताज़ा खबर' : 'Latest News');
    } else if (activeTab === 'state') {
      const stateObj = STATES.find(s => s.id === selectedStateId);
      query = lang === 'hi' ? stateObj.qHi : stateObj.qEn;
    } else {
      const currentCategory = CATEGORIES[lang].find(c => c.id === activeCatId);
      query = currentCategory.query;
    }
    
    const data = await getHeadlines(query, lang);
    setArticles(data || []);
    setLoading(false); setRefreshing(false);
  }, [activeTab, activeCatId, selectedStateId, lang, searchQuery]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const toggleLanguage = () => { setLang(prev => prev === 'hi' ? 'en' : 'hi'); };
  
  const resetAuth = () => {
    setConfirm(null); setOtpVal(''); setInputVal(''); setAuthType('main'); setPassVal('');
  };

  const handleShareApp = async () => {
    try {
      await Share.share({ message: t.shareText });
    } catch (error) { console.log(error); }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const user = userInfo.user || userInfo;
      await AsyncStorage.setItem('@ox_user', JSON.stringify(user));
      setCurrentUser(user);
      setAuthModalOpen(false);
    } catch (error) {
      Alert.alert('Google Sign-In Error', `Code: ${error.code}\nMessage: ${error.message}`);
    }
  };

  const handleManualLogin = async () => {
    if (!inputVal) return Alert.alert('Error', 'Please enter valid details.');
    const mockUser = { name: inputVal.split('@')[0], email: inputVal };
    await AsyncStorage.setItem('@ox_user', JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    setAuthModalOpen(false);
    resetAuth();
  };

  const handlePhoneAuth = async () => {
    if (!inputVal || inputVal.length !== 10) return Alert.alert('Error', 'सही 10 डिजिट का मोबाइल नंबर डालें।');
    try {
      const confirmation = await auth().signInWithPhoneNumber('+91' + inputVal);
      setConfirm(confirmation);
    } catch (error) {
      Alert.alert('OTP Error', error.message);
    }
  };

  const confirmCode = async () => {
    if (!otpVal || otpVal.length !== 6) return Alert.alert('Error', 'सही 6-डिजिट का OTP डालें।');
    try {
      const res = await confirm.confirm(otpVal);
      const user = { name: res.user.phoneNumber || 'User', email: res.user.phoneNumber + '@phone.ox' };
      await AsyncStorage.setItem('@ox_user', JSON.stringify(user));
      setCurrentUser(user);
      setAuthModalOpen(false);
      resetAuth();
    } catch (error) {
      Alert.alert('Error', 'गलत OTP! कृपया दोबारा चेक करें।');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@ox_user');
    setCurrentUser(null);
    try { await GoogleSignin.signOut(); } catch(e) {}
    try { await auth().signOut(); } catch(e) {}
  };

  const renderAuthModal = () => (
    <Modal visible={authModalOpen} transparent animationType="slide" onRequestClose={() => {setAuthModalOpen(false); resetAuth();}}>
      <View style={styles.authBackdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.authContainer}>
          <View style={styles.authHeader}>
            <Text style={styles.authTitle}>{authType === 'main' ? t.authTitle : (authType === 'email' ? t.emailLogin : t.phoneLogin)}</Text>
            <TouchableOpacity onPress={() => {setAuthModalOpen(false); resetAuth();}}><Ionicons name="close" size={26} color="#000" /></TouchableOpacity>
          </View>
          
          {authType === 'main' ? (
            <View>
              <TouchableOpacity style={styles.socialBtn} onPress={() => setAuthType('phone')}>
                <Ionicons name="call" size={20} color="#0F172A" style={{marginRight: 10}} />
                <Text style={styles.socialBtnText}>{t.phoneLogin}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => setAuthType('email')}>
                <Ionicons name="mail" size={20} color="#0F172A" style={{marginRight: 10}} />
                <Text style={styles.socialBtnText}>{t.emailLogin}</Text>
              </TouchableOpacity>
              
              <View style={styles.divider}><View style={styles.line}/><Text style={styles.orText}>{t.or}</Text><View style={styles.line}/></View>
              
              <TouchableOpacity style={[styles.socialBtn, {backgroundColor: '#EA4335', borderColor: '#EA4335'}]} onPress={handleGoogleLogin}>
                <Ionicons name="logo-google" size={20} color="#FFF" style={{marginRight: 10}} />
                <Text style={[styles.socialBtnText, {color: '#FFF'}]}>{t.googleLogin}</Text>
              </TouchableOpacity>
            </View>
          ) : authType === 'email' ? (
            <View>
              <TextInput style={styles.inputField} placeholder={t.emailLabel} keyboardType="email-address" value={inputVal} onChangeText={setInputVal} />
              <TextInput style={styles.inputField} placeholder={t.passLabel} secureTextEntry value={passVal} onChangeText={setPassVal} />
              <TouchableOpacity style={styles.submitBtn} onPress={handleManualLogin}><Text style={styles.submitBtnText}>{t.submit} / {t.createAcc}</Text></TouchableOpacity>
              <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={resetAuth}><Text style={{color: '#64748B', fontWeight: 'bold'}}>{t.back}</Text></TouchableOpacity>
            </View>
          ) : (
            <View>
              {!confirm ? (
                <>
                  <TextInput style={styles.inputField} placeholder={t.phoneLabel} keyboardType="phone-pad" value={inputVal} onChangeText={setInputVal} maxLength={10} />
                  <TouchableOpacity style={styles.submitBtn} onPress={handlePhoneAuth}><Text style={styles.submitBtnText}>OTP भेजें</Text></TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput style={styles.inputField} placeholder="6-digit OTP डालें" keyboardType="number-pad" value={otpVal} onChangeText={setOtpVal} maxLength={6} />
                  <TouchableOpacity style={styles.submitBtn} onPress={confirmCode}><Text style={styles.submitBtnText}>OTP Verify करें</Text></TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={resetAuth}><Text style={{color: '#64748B', fontWeight: 'bold'}}>{t.back}</Text></TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  const renderDrawer = () => (
    <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
      <View style={styles.drawerBackdrop}>
        <View style={styles.drawerContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profileBox}>
              <Ionicons name="person-circle" size={54} color="#DC2626" />
              {currentUser ? (
                <View style={{marginLeft: 12}}>
                  <Text style={styles.profileName} numberOfLines={1}>{currentUser.name}</Text>
                  <Text style={styles.profileEmail} numberOfLines={1}>{currentUser.email}</Text>
                  <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>{t.logout}</Text></TouchableOpacity>
                </View>
              ) : (
                <View style={{marginLeft: 12}}>
                  <Text style={styles.profileName}>{t.guest}</Text>
                  <TouchableOpacity style={styles.loginActionBtn} onPress={() => {setDrawerOpen(false); setAuthModalOpen(true);}}>
                    <Text style={styles.loginActionText}>{t.loginText}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.drawerHeader}>{t.allCats}</Text>
            {CATEGORIES[lang].map(cat => (
              <TouchableOpacity key={cat.id} style={[styles.drawerItem, activeCatId === cat.id && styles.drawerItemActive]} onPress={() => { setActiveCatId(cat.id); setActiveTab('home'); setDrawerOpen(false); }}>
                <Ionicons name={activeCatId === cat.id ? "ellipse" : "ellipse-outline"} size={12} color={activeCatId === cat.id ? "#DC2626" : "#64748B"} style={{marginRight: 12}}/>
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
  const currentStateName = STATES.find(s => s.id === selectedStateId)?.[lang];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.iconBtn}>
            <Ionicons name="menu" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.mastheadTitle}>{t.appName}</Text>
        </View>
        <View style={styles.rightHeaderBox}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langSwitchBtn}>
            <Text style={styles.langSwitchText}>{t.langToggle}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShareApp} style={{marginLeft: 4, padding: 4}}>
            <Ionicons name="share-social" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tickerBar}>
        <Text style={styles.tickerLabel}>{t.liveLabel}</Text>
        <Text style={styles.tickerText} numberOfLines={1}>{t.tickerText}</Text>
      </View>

      <View style={{flex: 1, backgroundColor: '#F8FAFC'}}>
        
        {activeTab === 'search' && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t.searchHint}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={loadFeed}
              returnKeyType="search"
            />
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
                      <Text style={styles.tagText}>{activeTab === 'state' ? currentStateName : (activeTab === 'search' ? t.search : currentCategoryName)}</Text>
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
          <Ionicons name="home" size={24} color={activeTab === 'home' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.bottomTabText, activeTab === 'home' && {color: '#DC2626', fontWeight: 'bold'}]}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setActiveTab('state')}>
          <Ionicons name="map" size={24} color={activeTab === 'state' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.bottomTabText, activeTab === 'state' && {color: '#DC2626', fontWeight: 'bold'}]}>{t.state}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setActiveTab('search')}>
          <Ionicons name="search" size={24} color={activeTab === 'search' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.bottomTabText, activeTab === 'search' && {color: '#DC2626', fontWeight: 'bold'}]}>{t.search}</Text>
        </TouchableOpacity>
      </View>

      {renderDrawer()}
      {renderAuthModal()}

      <Modal visible={webViewModal.visible} animationType="slide" onRequestClose={() => setWebViewModal({ visible: false, url: '', title: '' })}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={() => setWebViewModal({ visible: false, url: '', title: '' })} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="arrow-back" size={26} color="#000" />
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
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#DC2626', elevation: 4 },
  iconBtn: { padding: 4, marginRight: 8 },
  mastheadTitle: { fontSize: 21, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  rightHeaderBox: { flexDirection: 'row', alignItems: 'center' },
  langSwitchBtn: { backgroundColor: '#B91C1C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#F87171' },
  langSwitchText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  tickerBar: { backgroundColor: '#1E293B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  tickerLabel: { backgroundColor: '#DC2626', color: '#FFF', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 10 },
  tickerText: { color: '#F8FAFC', fontSize: 13, flex: 1 },
  
  // Search UI Styles
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 12, marginTop: 12, marginBottom: 4, paddingHorizontal: 16, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: '#0F172A', fontWeight: '500' },
  
  stateSelector: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 8, elevation: 3, marginBottom: 6 },
  stateBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 24, backgroundColor: '#F1F5F9', marginHorizontal: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  stateBtnActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  stateBtnText: { color: '#475569', fontWeight: '700', fontSize: 14 },
  stateBtnTextActive: { color: '#FFF', fontWeight: 'bold' },
  leadCard: { backgroundColor: '#FFF', marginBottom: 10, elevation: 2, marginTop: 8 },
  leadImage: { width: '100%', height: 240 },
  leadContent: { padding: 18 },
  tagText: { color: '#DC2626', fontSize: 13, fontWeight: '900', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  leadTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', lineHeight: 30 },
  compactCard: { backgroundColor: '#FFF', flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  compactContent: { flex: 1, paddingRight: 14, justifyContent: 'center' },
  compactTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', lineHeight: 24 },
  sourceText: { fontSize: 12, color: '#94A3B8', marginTop: 8, fontWeight: '700', textTransform: 'uppercase' },
  compactThumb: { width: 100, height: 80, borderRadius: 10 },
  bottomBar: { flexDirection: 'row', backgroundColor: '#FFF', height: 65, borderTopWidth: 1, borderTopColor: '#E2E8F0', justifyContent: 'space-around', alignItems: 'center' },
  bottomTab: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  bottomTabText: { fontSize: 12, color: '#64748B', marginTop: 6, fontWeight: '700' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' },
  drawerContent: { width: width * 0.78, backgroundColor: '#FFF', height: '100%' },
  profileBox: { backgroundColor: '#F8FAFC', padding: 24, paddingTop: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', maxWidth: 190 },
  profileEmail: { fontSize: 13, color: '#64748B', maxWidth: 190, marginTop: 2 },
  loginActionBtn: { marginTop: 10, backgroundColor: '#DC2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, elevation: 2 },
  loginActionText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  logoutText: { color: '#DC2626', fontSize: 13, marginTop: 8, fontWeight: 'bold' },
  drawerHeader: { padding: 18, fontSize: 15, fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 22 },
  drawerItemActive: { backgroundColor: '#FEF2F2', borderRightWidth: 3, borderRightColor: '#DC2626' },
  drawerItemText: { fontSize: 16, color: '#334155', fontWeight: '700' },
  drawerItemTextActive: { color: '#DC2626', fontWeight: '900' },
  drawerCloseBtn: { padding: 20, backgroundColor: '#F1F5F9', alignItems: 'center' },
  drawerCloseText: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
  authBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  authContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  authHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  authTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, marginBottom: 12, backgroundColor: '#F8FAFC' },
  socialBtnText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { marginHorizontal: 10, color: '#94A3B8', fontWeight: 'bold' },
  inputField: { backgroundColor: '#F1F5F9', padding: 14, borderRadius: 10, fontSize: 16, marginBottom: 14, color: '#0F172A' },
  submitBtn: { backgroundColor: '#DC2626', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 2 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  readerHeader: { height: 60, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', elevation: 2 },
  readerBackText: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
