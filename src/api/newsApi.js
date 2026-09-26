export async function getHeadlines(category = 'top') {
  try {
    const query = category === 'top' ? 'world' : category;
    const url = `https://freenewsapi.ai/v1/search?q=${encodeURIComponent(query)}&language=en&size=20`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const json = await response.json();

    return (json.results || []).map((item, index) => ({
      id: item.url || index.toString(),
      title: item.title || 'No Title Available',
      description: item.summary || item.snippet || (item.body ? item.body.slice(0, 120) + '...' : ''),
      image_url: item.image || item.thumbnail || null,
      url: item.url,
      source: item.publisher || item.domain || 'News',
      published_date: item.published_at || item.date || null,
    }));
  } catch (error) {
    console.error('Error fetching headlines:', error);
    throw error;
  }
}
