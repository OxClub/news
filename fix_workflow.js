const fs = require('fs');
const path = require('path');
const dir = '.github/workflows';

if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if(file.endsWith('.yml') || file.endsWith('.yaml')) {
      let content = fs.readFileSync(path.join(dir, file), 'utf8');
      
      // 1. परमिशन देना ताकि GitHub APK को रिलीज़ पेज पर डाल सके
      if (!content.includes('permissions:')) {
        content = content.replace('jobs:', 'permissions:\n  contents: write\n\njobs:');
      }
      
      // 2. ज़िप के बजाय डायरेक्ट APK अपलोड करने का कमांड जोड़ना
      if(!content.includes('gh release create')) {
        content += '\n      - name: Upload Direct APK\n        env:\n          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n        run: |\n          gh release create "v1.0.${{ github.run_number }}" android/app/build/outputs/apk/release/app-release.apk --title "OX News App - Latest" --notes "Download the APK file directly from below (No ZIP extraction needed)."\n';
        fs.writeFileSync(path.join(dir, file), content);
      }
    }
  });
  console.log('Workflow fixed successfully!');
}
