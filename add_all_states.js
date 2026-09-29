const fs = require('fs');

let appJs = fs.readFileSync('App.js', 'utf8');

// Bharat ke saare 28 States aur 8 Union Territories ki complete list
const newStates = `const STATES = [
  { id: 'andhra', hi: 'आंध्र प्रदेश', en: 'Andhra', qHi: 'आंध्र प्रदेश न्यूज़', qEn: 'Andhra Pradesh News' },
  { id: 'arunachal', hi: 'अरुणाचल', en: 'Arunachal', qHi: 'अरुणाचल प्रदेश न्यूज़', qEn: 'Arunachal Pradesh News' },
  { id: 'assam', hi: 'असम', en: 'Assam', qHi: 'असम न्यूज़', qEn: 'Assam News' },
  { id: 'bihar', hi: 'बिहार', en: 'Bihar', qHi: 'बिहार न्यूज़', qEn: 'Bihar News' },
  { id: 'chhattisgarh', hi: 'छत्तीसगढ़', en: 'Chhattisgarh', qHi: 'छत्तीसगढ़ न्यूज़', qEn: 'Chhattisgarh News' },
  { id: 'goa', hi: 'गोवा', en: 'Goa', qHi: 'गोवा न्यूज़', qEn: 'Goa News' },
  { id: 'gujarat', hi: 'गुजरात', en: 'Gujarat', qHi: 'गुजरात न्यूज़', qEn: 'Gujarat News' },
  { id: 'haryana', hi: 'हरियाणा', en: 'Haryana', qHi: 'हरियाणा न्यूज़', qEn: 'Haryana News' },
  { id: 'hp', hi: 'हिमाचल', en: 'Himachal', qHi: 'हिमाचल न्यूज़', qEn: 'Himachal Pradesh News' },
  { id: 'jharkhand', hi: 'झारखंड', en: 'Jharkhand', qHi: 'झारखंड न्यूज़', qEn: 'Jharkhand News' },
  { id: 'karnataka', hi: 'कर्नाटक', en: 'Karnataka', qHi: 'कर्नाटक न्यूज़', qEn: 'Karnataka News' },
  { id: 'kerala', hi: 'केरल', en: 'Kerala', qHi: 'केरल न्यूज़', qEn: 'Kerala News' },
  { id: 'mp', hi: 'मध्य प्रदेश', en: 'MP', qHi: 'मध्य प्रदेश न्यूज़', qEn: 'Madhya Pradesh News' },
  { id: 'maharashtra', hi: 'महाराष्ट्र', en: 'Maharashtra', qHi: 'महाराष्ट्र न्यूज़', qEn: 'Maharashtra News' },
  { id: 'manipur', hi: 'मणिपुर', en: 'Manipur', qHi: 'मणिपुर न्यूज़', qEn: 'Manipur News' },
  { id: 'meghalaya', hi: 'मेघालय', en: 'Meghalaya', qHi: 'मेघालय न्यूज़', qEn: 'Meghalaya News' },
  { id: 'mizoram', hi: 'मिज़ोरम', en: 'Mizoram', qHi: 'मिज़ोरम न्यूज़', qEn: 'Mizoram News' },
  { id: 'nagaland', hi: 'नागालैंड', en: 'Nagaland', qHi: 'नागालैंड न्यूज़', qEn: 'Nagaland News' },
  { id: 'odisha', hi: 'ओडिशा', en: 'Odisha', qHi: 'ओडिशा न्यूज़', qEn: 'Odisha News' },
  { id: 'punjab', hi: 'पंजाब', en: 'Punjab', qHi: 'पंजाब न्यूज़', qEn: 'Punjab News' },
  { id: 'rajasthan', hi: 'राजस्थान', en: 'Rajasthan', qHi: 'राजस्थान न्यूज़', qEn: 'Rajasthan News' },
  { id: 'sikkim', hi: 'सिक्किम', en: 'Sikkim', qHi: 'सिक्किम न्यूज़', qEn: 'Sikkim News' },
  { id: 'tamilnadu', hi: 'तमिलनाडु', en: 'Tamil Nadu', qHi: 'तमिलनाडु न्यूज़', qEn: 'Tamil Nadu News' },
  { id: 'telangana', hi: 'तेलंगाना', en: 'Telangana', qHi: 'तेलंगाना न्यूज़', qEn: 'Telangana News' },
  { id: 'tripura', hi: 'त्रिपुरा', en: 'Tripura', qHi: 'त्रिपुरा न्यूज़', qEn: 'Tripura News' },
  { id: 'up', hi: 'उत्तर प्रदेश', en: 'UP', qHi: 'उत्तर प्रदेश न्यूज़', qEn: 'UP News' },
  { id: 'uttarakhand', hi: 'उत्तराखंड', en: 'Uttarakhand', qHi: 'उत्तराखंड न्यूज़', qEn: 'Uttarakhand News' },
  { id: 'wb', hi: 'पश्चिम बंगाल', en: 'WB', qHi: 'पश्चिम बंगाल न्यूज़', qEn: 'West Bengal News' },
  { id: 'delhi', hi: 'दिल्ली', en: 'Delhi', qHi: 'दिल्ली न्यूज़', qEn: 'Delhi News' },
  { id: 'jk', hi: 'जम्मू-कश्मीर', en: 'J&K', qHi: 'जम्मू कश्मीर न्यूज़', qEn: 'Jammu Kashmir News' },
  { id: 'ladakh', hi: 'लद्दाख', en: 'Ladakh', qHi: 'लद्दाख न्यूज़', qEn: 'Ladakh News' },
  { id: 'chandigarh', hi: 'चंडीगढ़', en: 'Chandigarh', qHi: 'चंडीगढ़ न्यूज़', qEn: 'Chandigarh News' },
  { id: 'puducherry', hi: 'पुडुचेरी', en: 'Puducherry', qHi: 'पुडुचेरी न्यूज़', qEn: 'Puducherry News' },
  { id: 'andaman', hi: 'अंडमान', en: 'Andaman', qHi: 'अंडमान न्यूज़', qEn: 'Andaman News' },
  { id: 'lakshadweep', hi: 'लक्षद्वीप', en: 'Lakshadweep', qHi: 'लक्षद्वीप न्यूज़', qEn: 'Lakshadweep News' },
  { id: 'dadra', hi: 'दमन-दीव', en: 'Daman-Diu', qHi: 'दमन दीव न्यूज़', qEn: 'Daman Diu News' }
];`;

// Code ko automatically update karna
appJs = appJs.replace(/const STATES = \[\s*\{[\s\S]*?\}\s*\];/, newStates);

fs.writeFileSync('App.js', appJs);
console.log('✅ Sabhi 36 States aur UTs app mein add ho gaye hain!');
