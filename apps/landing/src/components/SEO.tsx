import React, { useEffect, useState } from 'react';
import { FAQ_DATA } from './FaqData';

interface BreadcrumbItem {
    name: string;
    item?: string;
}

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    breadcrumbs?: BreadcrumbItem[];
    schemas?: object[];
}

const DEFAULT_OG_IMAGE = 'https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg';

export const SEO: React.FC<SEOProps> = ({ 
    title, 
    description, 
    canonical = 'https://www.taazabites.in',
    ogImage = DEFAULT_OG_IMAGE,
    breadcrumbs,
    schemas
}) => {
    const [faqPresent, setFaqPresent] = useState<boolean>(false);
    const breadcrumbsStr = JSON.stringify(breadcrumbs);
    const schemasStr = JSON.stringify(schemas);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const checkFaq = () => {
            const faqEl = document.getElementById('faq');
            setFaqPresent(!!faqEl);
        };

        checkFaq();

        const observer = new MutationObserver(() => {
            checkFaq();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        // Safe document operations
        if (typeof document === 'undefined') return;

        const parsedBreadcrumbs = breadcrumbsStr ? JSON.parse(breadcrumbsStr) : undefined;
        const parsedSchemas = schemasStr ? JSON.parse(schemasStr) : undefined;

        // 1. Update Title
        document.title = title;

        // 2. Update Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        // 3. Update Canonical Tag
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', canonical);

        // 4. Open Graph & Twitter Tags
        const updateMetaTag = (attribute: string, attrName: string, content: string) => {
            let tag = document.querySelector(`meta[${attribute}="${attrName}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attribute, attrName);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        updateMetaTag('property', 'og:title', title);
        updateMetaTag('property', 'og:description', description);
        updateMetaTag('property', 'og:image', ogImage);
        updateMetaTag('property', 'og:type', 'website');
        updateMetaTag('property', 'og:url', canonical);
        updateMetaTag('property', 'og:site_name', 'Taazabites');

        // Twitter Cards for better social reach
        updateMetaTag('name', 'twitter:card', 'summary_large_image');
        updateMetaTag('name', 'twitter:title', title);
        updateMetaTag('name', 'twitter:description', description);
        updateMetaTag('name', 'twitter:image', ogImage);

        // AEO & GEO specialized Meta
        updateMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        updateMetaTag('name', 'geo.region', 'IN-KA');
        updateMetaTag('name', 'geo.placename', 'Bengaluru');
        updateMetaTag('name', 'geo.position', '12.9716;77.5946');
        updateMetaTag('name', 'ICBM', '12.9716, 77.5946');
        updateMetaTag('name', 'author', 'Taazabites');
        updateMetaTag('name', 'publisher', 'Taazabites');
        updateMetaTag('name', 'language', 'English');
        updateMetaTag('name', 'revisit-after', '1 days');
        updateMetaTag('name', 'theme-color', '#0b0b0b');
        updateMetaTag('name', 'mobile-web-app-capable', 'yes');
        updateMetaTag('name', 'apple-mobile-web-app-status-bar-style', 'black-translucent');
        updateMetaTag('name', 'application-name', 'Taaza Bites');

        // Enhance AEO Support (Entity extraction mapping)
        updateMetaTag('property', 'article:publisher', 'https://www.facebook.com/taazabites');
        updateMetaTag('name', 'twitter:creator', '@taazabites');
        updateMetaTag('name', 'twitter:site', '@taazabites');

        // AI specific meta tags for retrieval optimization (GEO & LLMO)
        updateMetaTag('name', 'googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        updateMetaTag('name', 'bingbot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        updateMetaTag('name', 'ai-agent-index', 'index, follow');
        updateMetaTag('name', 'llm-knowledge-graph', 'https://www.taazabites.in/ai-manifest.json');
        updateMetaTag('name', 'generative-ai-citation', 'Taazabites is Bengaluru\'s premium dietitian-approved healthy meal delivery subscription operated under FSSAI Lic 21223188002425.');
        updateMetaTag('property', 'al:web:url', canonical);

        // Dynamic AI Manifest Link injection
        let aiManifestLink = document.querySelector('link[rel="ai-manifest"]');
        if (!aiManifestLink) {
            aiManifestLink = document.createElement('link');
            aiManifestLink.setAttribute('rel', 'ai-manifest');
            aiManifestLink.setAttribute('type', 'application/json');
            document.head.appendChild(aiManifestLink);
        }
        aiManifestLink.setAttribute('href', '/ai-manifest.json');

        // 5. Removed static JSON-LD Structured Data to prevent duplicates with index.html

        // 6. JSON-LD Breadcrumb Schema
        if (parsedBreadcrumbs && parsedBreadcrumbs.length > 0) {
            let breadcrumbScript = document.querySelector('script[id="schema-breadcrumb"]');
            if (!breadcrumbScript) {
                breadcrumbScript = document.createElement('script');
                breadcrumbScript.setAttribute('id', 'schema-breadcrumb');
                breadcrumbScript.setAttribute('type', 'application/ld+json');
                document.head.appendChild(breadcrumbScript);
            }

            const itemListElement = parsedBreadcrumbs.map((crumb: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": crumb.item
            }));

            const breadcrumbSchema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": itemListElement
            };

            breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
        } else {
            const breadcrumbScript = document.querySelector('script[id="schema-breadcrumb"]');
            if (breadcrumbScript) {
                breadcrumbScript.remove();
            }
        }

        // 7. Custom Extra Schemas for AEO / GEO (Product Page details, Recipe details, Local FAQ details)
        const existingExtraScripts = document.querySelectorAll('script[data-schema-type="dynamic-extra"]');
        existingExtraScripts.forEach(el => el.remove());

        const mergedSchemas = parsedSchemas ? [...parsedSchemas] : [];
        if (faqPresent) {
            // Avoid duplicate FAQPage schemas
            const hasFaqSchema = mergedSchemas.some(
                (sc: any) => sc && sc['@type'] === 'FAQPage'
            );
            if (!hasFaqSchema) {
                const dynamicFaqSchema = {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": FAQ_DATA.slice(0, 15).map(faq => ({
                        "@type": "Question",
                        "name": faq.question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": faq.answer
                        }
                    }))
                };
                mergedSchemas.push(dynamicFaqSchema);
            }
        }

        if (mergedSchemas.length > 0) {
            mergedSchemas.forEach((sc, idx) => {
                const sTag = document.createElement('script');
                sTag.setAttribute('type', 'application/ld+json');
                sTag.setAttribute('data-schema-type', 'dynamic-extra');
                sTag.setAttribute('id', `schema-extra-${idx}`);
                sTag.textContent = JSON.stringify(sc);
                document.head.appendChild(sTag);
            });
        }

    }, [title, description, canonical, ogImage, breadcrumbsStr, schemasStr, faqPresent]);

    return null;
};
