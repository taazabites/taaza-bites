/**
 * Image Optimizer utility for Taazabites
 * Satisfies Lighthouse performance and SEO criteria for modern format (WebP) and proper sizing
 */

export function getOptimizedImageUrl(url: string, width = 800, quality = 80): string {
    if (!url) return '';
    
    // 1. Optimize Unsplash URLs
    if (url.includes('images.unsplash.com')) {
        try {
            const baseUrl = url.split('?')[0];
            return `${baseUrl}?auto=format&fit=crop&q=${quality}&w=${width}&fm=webp`;
        } catch (e) {
            console.warn("Unsplash URL optimization failed:", e);
            return url;
        }
    }
    
    // 2. Optimize Urbanpiper URLs if possible (they often support w and q or fm in query params)
    if (url.includes('cdn.urbanpiper.com')) {
        try {
            // Append or replace query parameters
            const separator = url.includes('?') ? '&' : '?';
            if (!url.includes('fm=') && !url.includes('format=')) {
                return `${url}${separator}fm=webp&w=${width}&q=${quality}`;
            }
        } catch (e) {
            return url;
        }
    }
    
    return url;
}
