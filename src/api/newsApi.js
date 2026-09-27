export async function getHeadlines(query = 'India', lang = 'hi') {
  try {
    const encodedQuery = encodeURIComponent(query);
    // Directly querying freenewsapi.ai endpoint with no API key required
    const url = `https://freenewsapi.ai/v1/search?q=${encodedQuery}&size=20`;
    
    const response = await fetch(url);
    const json = await response.json();

    if (json && json.results && json.results.length > 0) {
      return json.results.map((item, index) => ({
        id: item.uuid || 'fn_' + index + '_' + Date.now(),
        title: item.title || 'OX News Live Update',
        source: item.publisher || item.source || 'FreeNewsApi Live',
        image_url: item.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
        url: item.url || 'https://freenewsapi.ai'
      }));
    }

    return [];
  } catch (err) {
    console.error('FreeNewsApi fetch error:', err);
    return [];
  }
}
