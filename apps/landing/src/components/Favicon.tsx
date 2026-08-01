
import React, { useEffect } from 'react';

const LOGO_URL = 'https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg';

export const Favicon: React.FC = () => {
  useEffect(() => {
    // Function to update or create a link tag
    const updateLink = (rel: string, href: string) => {
        let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.rel = rel;
            document.head.appendChild(link);
        }
        link.href = href;
    };

    updateLink('icon', LOGO_URL);
    updateLink('shortcut icon', LOGO_URL);
    updateLink('apple-touch-icon', LOGO_URL);

  }, []);

  return null;
};
