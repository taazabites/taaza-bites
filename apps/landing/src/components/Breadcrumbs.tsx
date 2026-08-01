import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { seoConfig } from '../seoConfig';

interface BreadcrumbsProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPage, onNavigate }) => {
    const cleanPath = currentPage.split("#")[0];
    
    const isEmbedMode = typeof window !== 'undefined' && window.location.search.includes('embed=true');
    
    // Do not render breadcrumbs on home page or in iframe embed
    if (cleanPath === '/' || cleanPath === '' || isEmbedMode) {
        return null;
    }

    const currentMetadata = seoConfig[cleanPath];
    const breadcrumbName = currentMetadata?.breadcrumbName || 'Page';

    return (
        <nav 
            aria-label="Breadcrumb" 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-transparent relative z-10 font-sans"
        >
            <ol 
                itemScope 
                itemType="https://schema.org/BreadcrumbList" 
                className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-medium text-zinc-500"
            >
                <li 
                    itemProp="itemListElement" 
                    itemScope 
                    itemType="https://schema.org/ListItem" 
                    className="flex items-center"
                >
                    <a
                        href="/"
                        itemProp="item"
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate('/');
                        }}
                        className="flex items-center gap-1.5 hover:text-[#FF7A00] transition-colors cursor-pointer text-zinc-400 group"
                    >
                        <Home className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                        <span itemProp="name">Home</span>
                    </a>
                    <meta itemProp="position" content="1" />
                </li>
                
                <li className="flex items-center text-zinc-300">
                    <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-zinc-400" />
                </li>

                <li 
                    itemProp="itemListElement" 
                    itemScope 
                    itemType="https://schema.org/ListItem" 
                    className="flex items-center text-[#FF7A00] font-semibold" 
                    aria-current="page"
                >
                    <a
                        href={cleanPath}
                        itemProp="item"
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate(cleanPath);
                        }}
                        className="hover:text-[#FF7A00] transition-colors cursor-pointer"
                    >
                        <span itemProp="name">{breadcrumbName}</span>
                    </a>
                    <meta itemProp="position" content="2" />
                </li>
            </ol>
        </nav>
    );
};
