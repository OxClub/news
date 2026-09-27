export async function getHeadlines(query = 'India', lang = 'hi') {
  try {
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D${encodedQuery}%26hl%3D${lang === 'hi' ? 'hi' : 'en'}%26gl%3DIN%26ceid%3DIN%3A${lang === 'hi' ? 'hi' : 'en'}`;
    
    const response = await fetch(rssUrl);
    const data = await response.json();

    if (data && data.items && data.items.length > 0) {
      return data.items.map((item, index) => ({
        id: 'news_' + index + '_' + Date.now(),
        title: item.title || 'OX News Live Update',
        source: item.author || data.feed?.title || 'OX News Wire',
        image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
        url: item.link || 'https://news.google.com'
      }));
    }

    return [
      { id: 'fb_1', title: lang === 'hi' ? 'वैश्विक और राष्ट्रीय बाजार में बड़ी हलचल, निवेशकों की नज़र' : 'Major shifts in global and national markets, investors on watch', source: 'OX Global Desk', image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600', url: 'https://www.moneycontrol.com/' },
      { id: 'fb_2', title: lang === 'hi' ? 'टेक्नोलॉजी और एआई सेक्टर में नए विकास और सुरक्षा मानक तय' : 'New developments and safety standards set in tech and AI sectors', source: 'OX Tech Wire', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600', url: 'https://meity.gov.in/' }
    ];
  } catch (err) {
    console.error('News fetch error:', err);
    return [];
  }
}
