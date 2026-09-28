const fs = require('fs');
let app = JSON.parse(fs.readFileSync('app.json', 'utf8'));

if (app.expo.plugins === undefined) {
  app.expo.plugins = [];
}

// पुराने प्लगइन को हटाकर नया New Architecture वाला प्लगइन जोड़ना
app.expo.plugins = app.expo.plugins.filter(p => {
  if (Array.isArray(p)) return p[0] !== 'expo-build-properties';
  return p !== 'expo-build-properties';
});

app.expo.plugins.push([
  'expo-build-properties',
  { android: { newArchEnabled: true } }
]);

fs.writeFileSync('app.json', JSON.stringify(app, null, 2));
console.log('✅ New Architecture Enabled!');
