const fs = require('fs');

// 1. App.js me real error dikhane ke liye update karna
let appJs = fs.readFileSync('App.js', 'utf8');
appJs = appJs.replace(
  "Alert.alert('Login Error', 'Unable to login with Google.');",
  "Alert.alert('Google Sign-In Error', `Code: ${error.code}\\nMessage: ${error.message}`);"
);
fs.writeFileSync('App.js', appJs);

// 2. app.json me Google Sign-In plugin add karna
let appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
if (!appJson.expo.plugins) appJson.expo.plugins = [];
if (!appJson.expo.plugins.includes('@react-native-google-signin/google-signin')) {
  appJson.expo.plugins.push('@react-native-google-signin/google-signin');
}
fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));

console.log('Fixes applied successfully!');
