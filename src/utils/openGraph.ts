
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
    
    // Use a CORS proxy for cross-origin requests
    const corsProxy = 'https://corsproxy.io/?';
    const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; FontGardenBot/1.0)'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch URL for Open Graph parsing: ${url}, status: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    console.log(`Received HTML response (${html.length} bytes)`);
    
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
    
    // Second fallback: look for the first image in the HTML
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
    
    console.log('No images found in the HTML');
    return null;
  } catch (error) {
    console.error('Error extracting Open Graph image:', error);
    return null;
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
