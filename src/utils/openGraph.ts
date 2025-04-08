
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
    // Normalize the URL to ensure it includes protocol
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    // Use a CORS proxy for cross-origin requests
    const corsProxy = 'https://corsproxy.io/?';
    const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      console.error('Failed to fetch URL for Open Graph parsing:', url);
      return null;
    }
    
    const html = await response.text();
    
    // Extract og:image using regex
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
    
    // Fallback to looking for Twitter image
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    if (twitterImageMatch && twitterImageMatch[1]) {
      return twitterImageMatch[1];
    }
    
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
  
  // Regular expression to match URLs
  const urlPattern = /(https?:\/\/[^\s,]+)/g;
  const matches = text.match(urlPattern);
  
  return matches && matches.length > 0 ? matches[0] : null;
}
