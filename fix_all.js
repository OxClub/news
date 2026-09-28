const fs = require('fs');
const path = require('path');

// फिक्स A: app.json से New Architecture हटाना (ताकि बिल्ड क्रैश न हो)
let app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
if (app.expo && app.expo.plugins) {
  app.expo.plugins = app.expo.plugins.filter(p => {
    if (Array.isArray(p)) return p[0] !== 'expo-build-properties';
    return p !== 'expo-build-properties';
  });
}
fs.writeFileSync('app.json', JSON.stringify(app, null, 2));

// फिक्स B: Amazon के लिए APK का साइज़ 50MB से कम करना (APK Splitting)
const dir = '.github/workflows';
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if(file.endsWith('.yml') || file.endsWith('.yaml')) {
      let content = fs.readFileSync(path.join(dir, file), 'utf8');
      
      if (content.includes('./gradlew assembleRelease') && !content.includes('enableSeparateBuildPerCPUArchitecture = true')) {
        const sedCommands = `sed -i "s/def enableSeparateBuildPerCPUArchitecture = false/def enableSeparateBuildPerCPUArchitecture = true/g" app/build.gradle\n          sed -i "s/def enableProguardInReleaseBuilds = false/def enableProguardInReleaseBuilds = true/g" app/build.gradle\n          ./gradlew assembleRelease`;
        content = content.replace('./gradlew assembleRelease', sedCommands);
      }
      
      // GitHub Releases में सारी छोटी APK फाइल्स को अपलोड करना
      if (content.includes('app-release.apk')) {
        content = content.replace(/app-release\.apk/g, '*.apk');
      }
      fs.writeFileSync(path.join(dir, file), content);
    }
  });
}
console.log('✅ Firebase Error और APK Size (50MB) दोनों फिक्स सफलतापूर्वक लागू हो गए हैं!');
