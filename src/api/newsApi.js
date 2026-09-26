export async function getHeadlines(query = 'India', lang = 'en') {
  try {
    let rssUrl = '';
    if (lang === 'hi') {
      // High quality Indian Hindi News RSS Feeds
      const topicMapHi = {
        'India': 'https://feeds.bbci.co.uk/hindi/rss.xml',
        'World': 'https://feeds.bbci.co.uk/hindi/international/rss.xml',
        'Sports': 'https://feeds.bbci.co.uk/hindi/sport/rss.xml',
        'Entertainment': 'https://feeds.bbci.co.uk/hindi/entertainment/rss.xml',
        'Business': 'https://feeds.bbci.co.uk/hindi/business/rss.xml',
        'Technology': 'https://feeds.bbci.co.uk/hindi/science/rss.xml',
        'Science': 'https://feeds.bbci.co.uk/hindi/science/rss.xml',
        'Delhi': 'https://feeds.bbci.co.uk/hindi/india/rss.xml',
        'Parenting': 'https://feeds.bbci.co.uk/hindi/lifestyle/rss.xml',
        'Investing': 'https://feeds.bbci.co.uk/hindi/business/rss.xml',
      };
      rssUrl = topicMapHi[query] || `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=hi&gl=IN&ceid=IN:hi`;
    } else {
      // English News Feeds
      const topicMapEn = {
        'India': 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
        'World': 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
        'Sports': 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms',
        'Entertainment': 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms',
        'Business': 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms',
        'Technology': 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms',
        'Science': 'https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms',
        'Delhi': 'https://timesofindia.indiatimes.com/rssfeeds/-2128838597.cms',
        'Parenting': 'https://timesofindia.indiatimes.com/rssfeeds/2886704.cms',
        'Investing': 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms',
      };
      rssUrl = topicMapEn[query] || `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' India')}&hl=en-IN&gl=IN&ceid=IN:en`;
    }

    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      return data.items.map((item, index) => {
        // Extract embedded image if available
        let imageUrl = item.enclosure?.link || item.thumbnail || null;
        if (!imageUrl && item.content) {
          const match = item.content.match(/src=["'](.*?)["']/);
          if (match) imageUrl = match[1];
        }

        return {
          id: item.guid || item.link || index.toString(),
          title: item.title?.replace(/&quot;/g, '"')?.replace(/&#39;/g, "'") || '',
          description: item.description?.replace(/<[^>]*>?/gm, '')?.slice(0, 140) + '...' || '',
          image_url: imageUrl,
          url: item.link,
          source: item.author || (lang === 'hi' ? 'बीबीसी हिंदी / समाचार' : 'OX News Network'),
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
