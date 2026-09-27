export async function getHeadlines(query = 'India', lang = 'hi') {
  try {
    const encodedQuery = encodeURIComponent(query);
    
    // Fetching BOTH Hindi and English news simultaneously for thousands of diverse articles
    const urls = [
      `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D${encodedQuery}%26hl%3Dhi%26gl%3DIN%26ceid%3DIN%3Ahi`,
      `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D${encodedQuery}%26hl%3Den%26gl%3DIN%26ceid%3DIN%3Aen`
    ];
    
    const responses = await Promise.all(urls.map(u => fetch(u).catch(() => null)));
    const jsons = await Promise.all(responses.map(r => (r ? r.json().catch(() => null) : null)));
    
    let allItems = [];
    jsons.forEach(data => {
      if (data && data.items) {
        allItems = [...allItems, ...data.items];
      }
    });

    if (allItems.length > 0) {
      // Shuffle array slightly for mixed Hindi/English feel
      allItems.sort(() => Math.random() - 0.5);
      
      return allItems.map((item, index) => ({
        id: 'news_' + index + '_' + Date.now(),
        title: item.title,
        source: item.author || item.source || 'OX News Live',
        image_url: item.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
        url: item.link || 'https://news.google.com'
      }));
    }

    // Heavy Fallback if API rate limit exceeds
    return [
      { id: 'fb_1', title: 'ब्रेकिंग: आपके चुने गए शहर और राज्य में नई परियोजनाओं का ऐलान', source: 'OX Local Desk', image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600', url: 'https://pib.gov.in/' },
      { id: 'fb_2', title: 'Global Tech: Artificial Intelligence taking a new leap in the software industry', source: 'OX Global', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600', url: 'https://techcrunch.com/' },
      { id: 'fb_3', title: 'बाज़ार अपडेट: सेंसेक्स और निफ्टी में रिकॉर्ड उछाल, निवेशकों को भारी मुनाफा', source: 'OX Markets', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600', url: 'https://www.moneycontrol.com/' }
    ];
  } catch (err) {
    console.error('News fetch error:', err);
    return [];
  }
}
