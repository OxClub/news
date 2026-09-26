export async function getHeadlines(query = 'India', lang = 'en') {
  try {
    const cleanQuery = encodeURIComponent(query === 'CyberSec' ? 'cyber security hacking scam' : query);
    const url = `https://freenewsapi.ai/v1/search?q=${cleanQuery}&language=${lang === 'hi' ? 'hi' : 'en'}&size=20`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const json = await response.json();
      if (json.results && json.results.length > 0) {
        return json.results.map((item, index) => ({
          id: item.url || index.toString(),
          title: item.title || 'Untitled Story',
          description: item.summary || item.snippet || (item.body ? item.body.slice(0, 140) + '...' : ''),
          image_url: item.image || item.thumbnail || null,
          url: item.url,
          source: item.publisher || item.domain || (lang === 'hi' ? 'ऑक्स न्यूज़ ब्यूरो' : 'OX News Network'),
          published_date: item.published_at || item.date || null,
        }));
      }
    }
    throw new Error('Fallback to backup feed');
  } catch (err) {
    // Ultra-reliable fallback news feed
    const backupUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://news.google.com/rss/search?q=' + query + '&hl=' + (lang === 'hi' ? 'hi-IN' : 'en-IN') + '&gl=IN&ceid=IN:' + (lang === 'hi' ? 'hi' : 'en'))}`;
    const res = await fetch(backupUrl);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      return data.items.map((item, index) => ({
        id: item.guid || item.link || index.toString(),
        title: item.title?.replace(/&quot;/g, '"')?.replace(/&#39;/g, "'") || '',
        description: item.description?.replace(/<[^>]*>?/gm, '')?.slice(0, 140) + '...' || '',
        image_url: item.enclosure?.link || item.thumbnail || null,
        url: item.link,
        source: item.author || 'OX News',
        published_date: item.pubDate,
      }));
    }
    return [];
  }
}
