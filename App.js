import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaStorage } from 'react-native';
import CountrySelector from './CountrySelector';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState('in');
  const [showCountries, setShowCountries] = useState(false);

  return (
    <View style={styles.container}>
      {showCountries ? (
        <View style={{ flex: 1 }}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => setShowCountries(false)}
          >
            <Text style={styles.backText}>← Back to News</Text>
          </TouchableOpacity>
          <CountrySelector onSelectCountry={(code) => {
            setSelectedCountry(code);
            setShowCountries(false);
          }} />
        </View>
      ) : (
        <View style={styles.homeContainer}>
          <Text style={styles.title}>OX NEWS</Text>
          <Text style={styles.subtitle}>Selected Country Code: {selectedCountry.toUpperCase()}</Text>
          
          <TouchableOpacity 
            style={styles.btn} 
            onPress={() => setShowCountries(true)}
          >
            <Text style={styles.btnText}>🌍 Select Country (212+)</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  homeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#B71C1C', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#333', marginBottom: 20 },
  btn: { backgroundColor: '#B71C1C', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backBtn: { padding: 16, backgroundColor: '#eee' },
  backText: { fontSize: 16, fontWeight: 'bold', color: '#B71C1C' }
});
