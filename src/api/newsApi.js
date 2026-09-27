export async function getHeadlines(query = 'India', lang = 'hi') {
  try {
    const qLower = query.toLowerCase();
    const hl = lang === 'hi' ? 'hi' : 'en';
    const ceid = lang === 'hi' ? 'IN:hi' : 'IN:en';

    // एक साथ 3 अलग-अलग पावरफुल सर्वर्स से लाइव न्यूज़ मंगाना
    const urls = [
      `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D${encodeURIComponent(query)}%26hl%3D${hl}%26gl%3DIN%26ceid%3D${ceid}`,
      `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fheadlines%2Fsection%2Ftopic%2FNATION%3Fhl%3D${hl}%26gl%3DIN%26ceid%3D${ceid}`,
      `https://freenewsapi.ai/v1/search?q=${encodeURIComponent(query)}&size=50`
    ];

    const responses = await Promise.all(urls.map(u => fetch(u).catch(() => null)));
    const jsons = await Promise.all(responses.map(r => (r ? r.json().catch(() => null) : null)));

    let allItems = [];

    // RSS Feed डेटा जोड़ना
    if (jsons[0] && jsons[0].items) allItems = [...allItems, ...jsons[0].items];
    if (jsons[1] && jsons[1].items) allItems = [...allItems, ...jsons[1].items];

    // FreeNewsAPI डेटा जोड़ना
    if (jsons[2] && jsons[2].results) {
      const freeNews = jsons[2].results.map(item => ({
        title: item.title,
        author: item.source || item.publisher,
        thumbnail: item.image_url,
        link: item.url,
        pubDate: item.published_at || new Date().toISOString()
      }));
      allItems = [...allItems, ...freeNews];
    }

    // डुप्लीकेट खबरें हटाना और फॉर्मेट करना
    const uniqueTitles = new Set();
    const finalNews = [];

    for (let item of allItems) {
      if (!item || !item.title || uniqueTitles.has(item.title)) continue;
      uniqueTitles.add(item.title);

      let img = item.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600';
      const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) img = imgMatch[1];

      finalNews.push({
        id: 'news_' + Math.random().toString(36).substr(2, 9),
        title: item.title,
        source: item.author || 'OX News Live',
        image_url: img,
        url: item.link,
        pubDate: item.pubDate || new Date().toISOString()
      });
    }

    // खबरों को शफल (मिक्स) करना
    finalNews.sort(() => Math.random() - 0.5);

    return finalNews.length > 0 ? finalNews : getFallbackNews();
  } catch (err) {
    console.error('API Error:', err);
    return getFallbackNews();
  }
}

function getFallbackNews() {
  return [
    { id: 'fb_1', title: 'ब्रेकिंग: आपके चुने गए शहर और राज्य में नई परियोजनाओं का ऐलान', source: 'OX Local Desk', image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600', url: 'https://pib.gov.in/', pubDate: new Date().toISOString() },
    { id: 'fb_2', title: 'Global Tech: Artificial Intelligence taking a new leap in the software industry', source: 'OX Global', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600', url: 'https://techcrunch.com/', pubDate: new Date().toISOString() },
    { id: 'fb_3', title: 'बाज़ार अपडेट: सेंसेक्स और निफ्टी में रिकॉर्ड उछाल, निवेशकों को भारी मुनाफा', source: 'OX Markets', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600', url: 'https://www.moneycontrol.com/', pubDate: new Date().toISOString() }
  ];
}
