const fs = require('fs');
const path = require('path');

// 1. Android build.gradle mein 'Split APK' setting ko forcefully ON karna
const buildGradlePath = 'android/app/build.gradle';
if (fs.existsSync(buildGradlePath)) {
  let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  gradleContent = gradleContent.replace(/def enableSeparateBuildPerCPUArchitecture = false/g, 'def enableSeparateBuildPerCPUArchitecture = true');
  fs.writeFileSync(buildGradlePath, gradleContent);
  console.log('✅ build.gradle mein Split APK successfully ON ho gaya hai!');
}

// 2. GitHub Actions YAML ko fix karna taaki wo saari chhoti .apk files ko upload kare
const workflowDir = '.github/workflows';
if (fs.existsSync(workflowDir)) {
  const files = fs.readdirSync(workflowDir);
  files.forEach(file => {
    if(file.endsWith('.yml') || file.endsWith('.yaml')) {
      let ymlContent = fs.readFileSync(path.join(workflowDir, file), 'utf8');
      // Jaha bhi hardcoded 'app-release.apk' likha hai, use '*.apk' (all apks) se badalna
      ymlContent = ymlContent.replace(/app-release\.apk/g, '*.apk');
      fs.writeFileSync(path.join(workflowDir, file), ymlContent);
    }
  });
  console.log('✅ GitHub Workflow file update ho gayi hai!');
}
