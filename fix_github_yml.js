const fs = require('fs');
const path = require('path');

const workflowDir = '.github/workflows';
if (fs.existsSync(workflowDir)) {
  const files = fs.readdirSync(workflowDir);
  files.forEach(file => {
    if(file.endsWith('.yml') || file.endsWith('.yaml')) {
      let ymlContent = fs.readFileSync(path.join(workflowDir, file), 'utf8');
      
      // 1. Saari APK files upload karne ki setting
      ymlContent = ymlContent.replace(/app-release\.apk/g, '*.apk');
      
      // 2. Server par build hote time Split APK ON karne ka command
      if (!ymlContent.includes('enableSeparateBuildPerCPUArchitecture = true')) {
        const oldBuildCmd = './gradlew assembleRelease';
        const newBuildCmd = 'sed -i "s/def enableSeparateBuildPerCPUArchitecture = false/def enableSeparateBuildPerCPUArchitecture = true/g" app/build.gradle\n          ./gradlew assembleRelease';
        ymlContent = ymlContent.replace(oldBuildCmd, newBuildCmd);
      }
      
      fs.writeFileSync(path.join(workflowDir, file), ymlContent);
    }
  });
  console.log('✅ GitHub Workflow perfectly updated!');
}
