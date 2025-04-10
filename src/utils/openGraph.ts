
/**
 * Utility functions for extracting Open Graph images from URLs
 */

/**
 * Extracts Open Graph image URL from a given URL by making a request and parsing the HTML
 * @param url The URL to extract Open Graph image from
 * @returns Promise resolving to the image URL or null if not found
 */
export async function extractOpenGraphImage(url: string): Promise<string | null> {
  try {
    // If the URL is empty or invalid, return null
    if (!url || url.trim() === '') {
      console.log('Empty URL provided to extractOpenGraphImage');
      return null;
    }

    // Normalize the URL to ensure it includes protocol
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    console.log('Fetching Open Graph image from:', url);
    
    // Try multiple CORS proxies in case one fails
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/'
    ];
    
    // Try each proxy until one works
    let html = '';
    let success = false;
    
    for (const proxy of corsProxies) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (compatible; FontGardenBot/1.0)'
          },
          // Set a reasonable timeout to avoid hanging requests
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          html = await response.text();
          console.log(`Received HTML response (${html.length} bytes) from proxy: ${proxy}`);
          success = true;
          break;
        } else {
          console.warn(`Proxy ${proxy} failed with status: ${response.status}`);
        }
      } catch (error) {
        console.warn(`Error with proxy ${proxy}:`, error);
        // Continue to next proxy
      }
    }
    
    if (!success || !html) {
      console.error('All proxies failed to fetch URL:', url);
      
      // Fallback: try a social media image service
      // Many services provide preview images for websites
      const imageServiceUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=128`;
      console.log('Trying favicon service fallback:', imageServiceUrl);
      return imageServiceUrl;
    }
    
    // Extract og:image using regex - more reliable approach with proper attribute handling
    const ogImageMatch = html.match(/<meta[^>]*(?:property|name)=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                         html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']og:image["'][^>]*>/i);
    
    if (ogImageMatch && ogImageMatch[1]) {
      console.log('Found og:image:', ogImageMatch[1]);
      return ogImageMatch[1];
    }
    
    // Fallback to looking for Twitter image
    const twitterImageMatch = html.match(/<meta[^>]*(?:name|property)=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                             html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']twitter:image["'][^>]*>/i);
    
    if (twitterImageMatch && twitterImageMatch[1]) {
      console.log('Found twitter:image:', twitterImageMatch[1]);
      return twitterImageMatch[1];
    }
    
    // Look for the first image in the HTML
    const imgMatch = html.match(/<img[^>]*src=["']([^"']*\.(?:jpg|jpeg|png|gif|webp))["'][^>]*>/i);
    if (imgMatch && imgMatch[1]) {
      // Handle relative URLs
      let imgUrl = imgMatch[1];
      if (imgUrl.startsWith('/')) {
        // Convert relative URL to absolute
        const urlObj = new URL(url);
        imgUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
      } else if (!imgUrl.startsWith('http')) {
        // Handle other relative formats
        imgUrl = new URL(imgUrl, url).href;
      }
      console.log('Found fallback image:', imgUrl);
      return imgUrl;
    }
    
    // Final fallback: Use a website preview service
    const fallbackImageUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=128`;
    console.log('Using favicon fallback:', fallbackImageUrl);
    return fallbackImageUrl;
    
  } catch (error) {
    console.error('Error extracting Open Graph image:', error);
    // Last resort fallback - use the Google favicon service
    const fallbackImageUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=128`;
    console.log('Using favicon fallback after error:', fallbackImageUrl);
    return fallbackImageUrl;
  }
}

/**
 * Extracts the first valid URL from a text containing multiple URLs
 * @param text Text potentially containing URLs
 * @returns The first URL found or null
 */
export function extractFirstUrl(text: string): string | null {
  if (!text) return null;
  
  // Regular expression to match URLs - improved version
  const urlPattern = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
  const matches = text.match(urlPattern);
  
  return matches && matches.length > 0 ? matches[0] : null;
}
