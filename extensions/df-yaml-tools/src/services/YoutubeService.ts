export interface YoutubeVideoDetails {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    duration: string;
    thumbnailUrl: string;
    videoId: string;
}

interface YoutubeApiItem {
    snippet: {
        title: string;
        description: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails?: {
            maxres?: { url: string };
            high?: { url: string };
            default?: { url: string };
        };
    };
    contentDetails: {
        duration: string;
    };
}

export class YoutubeService {
    static async getVideoDetails(url: string, apiKey?: string): Promise<YoutubeVideoDetails> {
        try {
            // 1. Extract Video ID
            let videoId: string | null = null;
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname.includes('youtube.com')) {
                    videoId = urlObj.searchParams.get('v');
                } else if (urlObj.hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.slice(1);
                }
            } catch {
                console.error('Invalid URL:', url);
            }

            if (!videoId) {
                throw new Error('Could not extract video ID from URL');
            }

            // 2. Try YouTube API if key is present
            if (apiKey) {
                try {
                    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const data = await response.json() as { items: YoutubeApiItem[] };
                        if (data.items && data.items.length > 0) {
                            const item = data.items[0];
                            const snippet = item.snippet;
                            const contentDetails = item.contentDetails;
                            return {
                                title: snippet.title,
                                description: snippet.description,
                                channelTitle: snippet.channelTitle,
                                publishedAt: snippet.publishedAt,
                                duration: contentDetails.duration,
                                thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
                                videoId: videoId
                            };
                        }
                    }
                } catch (e) {
                    console.warn('YouTube API failed, falling back to scraping', e);
                }
            }

            // 3. Fallback to scraping
            const pageResponse = await fetch(url);
            if (!pageResponse.ok) {
                throw new Error(`YouTube page fetch error: ${pageResponse.statusText}`);
            }

            const html = await pageResponse.text();
            const titleMatch = html.match(/<title>(.*?)<\/title>/);
            const descMatch = html.match(/<meta name="description" content="(.*?)">/);
            
            const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Title';
            const description = descMatch ? descMatch[1] : '';

            return {
                title,
                description,
                channelTitle: '',
                publishedAt: '',
                duration: '',
                thumbnailUrl: '',
                videoId: videoId
            };

        } catch (error) {
            console.error('Error fetching YouTube data:', error);
            throw error;
        }
    }
}
