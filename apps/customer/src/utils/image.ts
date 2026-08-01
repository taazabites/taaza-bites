/**
 * Helper to dynamically inject optimization parameters into Unsplash image URLs.
 * This ensures they are delivered in high-performance WebP format, properly sized,
 * and appropriately compressed instead of downloading full raw high-resolution images.
 */
export function getOptimizedImageUrl(url: string, width: number = 600): string {
  if (!url) return '';
  
  if (url.includes('unsplash.com')) {
    try {
      // Split off any existing query parameters to build a pristine optimized URL
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?auto=format&fit=crop&w=${width}&q=70&fm=webp`;
    } catch {
      return `${url}&fm=webp&q=70&w=${width}`;
    }
  }
  
  return url;
}
