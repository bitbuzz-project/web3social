export function trackHashtag(hashtag: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem('hashtag_tracker') || '{}';
    const data = JSON.parse(stored);
    
    const tag = hashtag.toLowerCase().replace('#', '');
    data[tag] = (data[tag] || 0) + 1;
    
    localStorage.setItem('hashtag_tracker', JSON.stringify(data));
  } catch (e) {
    console.error('Error tracking hashtag:', e);
  }
}

export function getHashtagCount(hashtag: string): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem('hashtag_tracker') || '{}';
    const data = JSON.parse(stored);
    const tag = hashtag.toLowerCase().replace('#', '');
    return data[tag] || 0;
  } catch (e) {
    return 0;
  }
}

export function getTrendingHashtags(limit: number = 10): Array<{ tag: string; count: number }> {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('hashtag_tracker') || '{}';
    const data = JSON.parse(stored);
    
    return Object.entries(data)
      .map(([tag, count]) => ({ tag, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (e) {
    return [];
  }
}