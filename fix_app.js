const fs = require('fs');

try {
  let appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  if (!appJson.expo.plugins) {
    appJson.expo.plugins = [];
  }
  
  let pluginExists = false;
  
  // चेक करना कि क्या प्लगइन पहले से है
  for (let i = 0; i < appJson.expo.plugins.length; i++) {
    let plugin = appJson.expo.plugins[i];
    if (Array.isArray(plugin) && plugin[0] === 'expo-build-properties') {
      if (!plugin[1]) plugin[1] = {};
      if (!plugin[1].android) plugin[1].android = {};
      plugin[1].android.newArchEnabled = true;
      pluginExists = true;
      break;
    }
  }
  
  // अगर नहीं है, तो नया प्लगइन जोड़ना
  if (!pluginExists) {
    appJson.expo.plugins.push([
      "expo-build-properties",
      {
        "android": {
          "newArchEnabled": true
        }
      }
    ]);
  }
  
  fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
  console.log('✅ app.json में New Architecture सफलतापूर्वक Enable कर दिया गया है!');
} catch (error) {
  console.error('❌ Error:', error.message);
}
