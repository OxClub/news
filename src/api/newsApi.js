export async function getHeadlines(query = 'India', lang = 'hi') {
  try {
    const qLower = query.toLowerCase();
    const hl = lang === 'hi' ? 'hi' : 'en';
    const ceid = lang === 'hi' ? 'IN:hi' : 'IN:en';

    const urls = [
      `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D${encodeURIComponent(query)}%26hl%3D${hl}%26gl%3DIN%26ceid%3D${ceid}`,
      `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fheadlines%2Fsection%2Ftopic%2FNATION%3Fhl%3D${hl}%26gl%3DIN%26ceid%3D${ceid}`,
      `https://freenewsapi.ai/v1/search?q=${encodeURIComponent(query)}&size=50`
    ];

    const responses = await Promise.all(urls.map(u => fetch(u).catch(() => null)));
    const jsons = await Promise.all(responses.map(r => (r ? r.json().catch(() => null) : null)));

    let allItems = [];
    if (jsons[0] && jsons[0].items) allItems = [...allItems, ...jsons[0].items];
    if (jsons[1] && jsons[1].items) allItems = [...allItems, ...jsons[1].items];
    
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

    const uniqueTitles = new Set();
    const finalNews = [];
    
    const fallbacks = [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600',
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
      'https://images.unsplash.com/photo-1557992260-ec58e38d363c?w=600',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600'
    ];

    for (let item of allItems) {
      if (!item || !item.title || uniqueTitles.has(item.title)) continue;
      uniqueTitles.add(item.title);

      let img = item.thumbnail || item.image_url || null;
      if (!img && item.description) {
        const match = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (match) img = match[1];
      }
      if (!img && item.content) {
        const match = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (match) img = match[1];
      }
      
      if (!img) img = fallbacks[Math.floor(Math.random() * fallbacks.length)];

      finalNews.push({
        id: 'news_' + Math.random().toString(36).substr(2, 9),
        title: item.title,
        source: item.author || 'OX News',
        image_url: img,
        url: item.link,
        pubDate: item.pubDate || new Date().toISOString()
      });
    }

    finalNews.sort(() => Math.random() - 0.5);
    return finalNews.length > 0 ? finalNews : getFallbackNews();
  } catch (err) {
    return getFallbackNews();
  }
}

function getFallbackNews() {
  return [
    { id: 'fb_1', title: 'ब्रेकिंग: आपके चुने गए शहर और राज्य में नई परियोजनाओं का ऐलान', source: 'OX Local Desk', image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600', url: 'https://pib.gov.in/', pubDate: new Date().toISOString() }
  ];
}
