export async function getHeadlines(query = 'India', lang = 'en') {
  try {
    let rssUrl = '';
    const cleanQuery = encodeURIComponent(query);
    
    if (lang === 'hi') {
      rssUrl = `https://news.google.com/rss/search?q=${cleanQuery}+news+hindi&hl=hi&gl=IN&ceid=IN:hi`;
    } else {
      rssUrl = `https://news.google.com/rss/search?q=${cleanQuery}+news&hl=en-IN&gl=IN&ceid=IN:en`;
    }

    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      return data.items.map((item, index) => {
        let imageUrl = item.enclosure?.link || item.thumbnail || null;
        if (!imageUrl && item.content) {
          const match = item.content.match(/src=["'](.*?)["']/);
          if (match) imageUrl = match[1];
        }

        return {
          id: item.guid || item.link || index.toString(),
          title: item.title?.replace(/&quot;/g, '"')?.replace(/&#39;/g, "'") || '',
          description: item.description?.replace(/<[^>]*>?/gm, '')?.slice(0, 160) + '...' || '',
          image_url: imageUrl,
          url: item.link,
          source: item.author || (lang === 'hi' ? 'ऑक्स न्यूज़ नेटवर्क' : 'OX News Bureau'),
          published_date: item.pubDate,
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}
