export type VideoProvider = 'youtube' | 'loom' | null;

export interface VideoEmbed {
  provider: VideoProvider;
  embedId: string;
}

export function parseVideoUrl(url: string): VideoEmbed | null {
  if (!url || url.trim() === '') return null;

  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      provider: 'youtube',
      embedId: youtubeMatch[1],
    };
  }

  const loomRegex = /loom\.com\/share\/([a-zA-Z0-9]+)/;
  const loomMatch = url.match(loomRegex);
  if (loomMatch) {
    return {
      provider: 'loom',
      embedId: loomMatch[1],
    };
  }

  return null;
}

export function getEmbedUrl(embed: VideoEmbed): string {
  switch (embed.provider) {
    case 'youtube':
      return `https://www.youtube.com/embed/${embed.embedId}`;
    case 'loom':
      return `https://www.loom.com/embed/${embed.embedId}`;
    default:
      return '';
  }
}

export function isValidVideoUrl(url: string): boolean {
  if (!url || url.trim() === '') return true;
  return parseVideoUrl(url) !== null;
}
