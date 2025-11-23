export function parseHashtags(text: string): { text: string; hashtags: string[] } {
  const hashtagRegex = /#[\w\u0600-\u06FF]+/g;
  const hashtags = text.match(hashtagRegex) || [];
  return {
    text,
    hashtags: hashtags.map(tag => tag.toLowerCase())
  };
}

export function highlightHashtags(text: string): string {
  return text;
}