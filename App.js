import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, FlatList, ScrollView, TouchableOpacity, Image, Modal,
  ActivityIndicator, RefreshControl, StyleSheet, StatusBar, Dimensions, Alert, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getHeadlines } from './src/api/newsApi';

const { width, height } = Dimensions.get('window');
const AD_UNIT = __DEV__ ? TestIds.BANNER : 'ca-app-pub-6509298197152386/1259197573';

const STRINGS = {
  hi: {
    appName: 'द ऑक्स न्यूज़', liveLabel: 'LIVE', tickerText: 'दुनिया भर की ताज़ा और ब्रेकिंग खबरें, सीधे आपके फोन पर।',
    home: 'होम', state: 'राज्य', explore: 'एक्सप्लोर', guest: 'गेस्ट यूज़र', loginText: 'लॉगिन / रजिस्टर करें', 
    logout: 'लॉगआउट करें', close: 'बंद करें', back: 'वापस', allCats: 'सभी कैटेगरीज', langToggle: 'ENG',
    authTitle: 'एक टैप। सब कुछ अनलॉक करें।', emailLogin: 'ईमेल से जारी रखें', phoneLogin: 'मोबाइल नंबर से जारी रखें',
    googleLogin: 'गूगल से लॉगिन करें', or: 'या', emailLabel: 'अपना ईमेल दर्ज करें', phoneLabel: 'अपना 10 अंकों का मोबाइल नंबर डालें',
    passLabel: 'पासवर्ड', submit: 'सबमिट करें', createAcc: 'नया अकाउंट बनाएं'
  },
  en: {
    appName: 'THE OX NEWS', liveLabel: 'LIVE', tickerText: 'Latest breaking news from around the world, right on your phone.',
    home: 'Home', state: 'State', explore: 'Explore', guest: 'Guest User', loginText: 'Login / Register', 
    logout: 'Logout', close: 'Close', back: 'Back', allCats: 'All Categories', langToggle: 'हिंदी',
    authTitle: 'One tap. Unlock it all.', emailLogin: 'Continue with Email', phoneLogin: 'Continue with Mobile',
    googleLogin: 'Login with Google', or: 'Or', emailLabel: 'Enter your Email', phoneLabel: 'Enter 10-digit Mobile Number',
    passLabel: 'Password', submit: 'Submit', createAcc: 'Create New Account'
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

const STATES = ['Delhi', 'Bihar', 'Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Jharkhand', 'Madhya Pradesh', 'Gujarat', 'West Bengal'];

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('main'); // main, email, phone
  const [webViewModal, setWebViewModal] = useState({ visible: false, url: '', title: '' });

  const [inputVal, setInputVal] = useState('');
  const [passVal, setPassVal] = useState('');

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

  const toggleLanguage = () => { setLang(prev => prev === 'hi' ? 'en' : 'hi'); };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      await AsyncStorage.setItem('@ox_user', JSON.stringify(userInfo.user));
      setCurrentUser(userInfo.user);
      setAuthModalOpen(false);
    } catch (error) {
      Alert.alert('Login Error', 'Unable to login with Google.');
    }
  };

  const handleManualLogin = async () => {
    if (!inputVal) return Alert.alert('Error', 'Please enter valid details.');
    const mockUser = { name: inputVal.split('@')[0], email: authType === 'email' ? inputVal : `${inputVal}@phone.ox` };
    await AsyncStorage.setItem('@ox_user', JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    setAuthModalOpen(false);
    setInputVal(''); setPassVal(''); setAuthType('main');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@ox_user');
    setCurrentUser(null);
    try { await GoogleSignin.signOut(); } catch(e) {}
  };

  const renderAuthModal = () => (
    <Modal visible={authModalOpen} transparent animationType="slide" onRequestClose={() => setAuthModalOpen(false)}>
      <View style={styles.authBackdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.authContainer}>
          <View style={styles.authHeader}>
            <Text style={styles.authTitle}>{authType === 'main' ? t.authTitle : (authType === 'email' ? t.emailLogin : t.phoneLogin)}</Text>
            <TouchableOpacity onPress={() => {setAuthModalOpen(false); setAuthType('main');}}><Ionicons name="close" size={26} color="#000" /></TouchableOpacity>
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
          ) : (
            <View>
              <TextInput 
                style={styles.inputField} 
                placeholder={authType === 'email' ? t.emailLabel : t.phoneLabel}
                keyboardType={authType === 'email' ? "email-address" : "phone-pad"}
                value={inputVal} onChangeText={setInputVal}
              />
              <TextInput style={styles.inputField} placeholder={t.passLabel} secureTextEntry value={passVal} onChangeText={setPassVal} />
              
              <TouchableOpacity style={styles.submitBtn} onPress={handleManualLogin}><Text style={styles.submitBtnText}>{t.submit} / {t.createAcc}</Text></TouchableOpacity>
              <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={() => setAuthType('main')}><Text style={{color: '#64748B', fontWeight: 'bold'}}>{t.back}</Text></TouchableOpacity>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Header with Menu & 3-Dots */}
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
          <TouchableOpacity onPress={() => setDrawerOpen(true)} style={{marginLeft: 4}}>
            <Ionicons name="ellipsis-vertical" size={26} color="#FFF" />
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

      {/* Advanced Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomTab} onPress={() => {setActiveTab('home'); setActiveCatId('breaking');}}>
          <Ionicons name="home" size={24} color={activeTab === 'home' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.bottomTabText, activeTab === 'home' && {color: '#DC2626', fontWeight: 'bold'}]}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setActiveTab('state')}>
          <Ionicons name="map" size={24} color={activeTab === 'state' ? '#DC2626' : '#64748B'} />
          <Text style={[styles.bottomTabText, activeTab === 'state' && {color: '#DC2626', fontWeight: 'bold'}]}>{t.state}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setDrawerOpen(true)}>
          <Ionicons name="grid" size={24} color="#64748B" />
          <Text style={styles.bottomTabText}>{t.explore}</Text>
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
  stateSelector: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 8, elevation: 3, marginBottom: 6 },
  stateBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 24, backgroundColor: '#F1F5F9', marginHorizontal: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  stateBtnActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  stateBtnText: { color: '#475569', fontWeight: '700', fontSize: 14 },
  stateBtnTextActive: { color: '#FFF', fontWeight: 'bold' },
  leadCard: { backgroundColor: '#FFF', marginBottom: 10, elevation: 2 },
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
  
  // Drawer Styles
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
  
  // Auth Modal Styles
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
