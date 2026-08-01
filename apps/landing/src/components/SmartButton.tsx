import React from 'react';

interface SmartButtonProps {
    id?: string;
    label: string;
    hoverLabel?: string;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
    href?: string;
    className?: string;
    icon?: React.ReactNode;
    target?: string;
    variant?: 'primary' | 'secondary' | 'dark' | 'light' | 'accent' | 'danger' | 'ghost' | 'subtle' | string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export const SmartButton: React.FC<SmartButtonProps> = ({ 
    id,
    label, 
    hoverLabel,
    onClick, 
    href, 
    className = '',
    target,
    variant = 'primary',
    type = 'button',
    disabled = false,
    icon
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        try {
            if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
                if (variant === 'accent' || variant === 'primary') {
                    navigator.vibrate([12, 40, 12]);
                } else {
                    navigator.vibrate(10);
                }
            }
        } catch (err) {
            console.warn('Vibration failed:', err);
        }
        
        if (href && href.startsWith('/') && !target) {
            e.preventDefault();
            window.history.pushState(null, '', href);
            window.dispatchEvent(new Event('popstate'));
        }
        
        onClick?.(e);
    };

    const baseClasses = "relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium tracking-wide transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden group";
    
    let variantClasses = "";
    switch (variant) {
        case 'primary':
            variantClasses = "bg-[#059669] text-white shadow-[0_8px_30px_rgba(5,150,105,0.2)] hover:shadow-[0_8px_30px_rgba(5,150,105,0.4)] hover:-translate-y-1";
            break;
        case 'secondary':
            variantClasses = "bg-white text-gray-900 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-gray-300 hover:-translate-y-1";
            break;
        case 'accent':
            variantClasses = "bg-[#F59E0B] text-white shadow-[0_8px_30px_rgb(245,158,11,0.2)] hover:shadow-[0_8px_30px_rgb(245,158,11,0.4)] hover:-translate-y-1";
            break;
        case 'dark':
            variantClasses = "bg-gray-900 text-white shadow-[0_8px_30px_rgb(17,24,39,0.2)] hover:shadow-[0_8px_30px_rgb(17,24,39,0.4)] hover:-translate-y-1";
            break;
        case 'subtle':
            variantClasses = "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200";
            break;
        case 'ghost':
            variantClasses = "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50";
            break;
        case 'danger':
            variantClasses = "bg-red-600 text-white shadow-[0_8px_30px_rgb(220,38,38,0.2)] hover:shadow-[0_8px_30px_rgb(220,38,38,0.4)] hover:-translate-y-1";
            break;
        default:
            variantClasses = "bg-[#059669] text-white shadow-[0_8px_30px_rgba(5,150,105,0.2)] hover:shadow-[0_8px_30px_rgba(5,150,105,0.4)] hover:-translate-y-1";
    }

    const combinedClassName = `${baseClasses} ${variantClasses} ${className} ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''}`;

    const content = (
        <>
            {/* Subtle shine effect on hover for primary/accent/dark */}
            {(variant === 'primary' || variant === 'accent' || variant === 'dark') && (
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black/20"></span>
            )}
            
            {/* Hover ripple effect */}
            <span className="absolute inset-0 w-full h-full bg-white/20 scale-0 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out origin-center"></span>

            <span className="relative z-10 flex items-center gap-2">
                <span className={`block transition-all duration-300 ${hoverLabel ? 'group-hover:-translate-y-full opacity-100 group-hover:opacity-0' : ''}`}>
                    {label}
                </span>
                {hoverLabel && (
                    <span className="absolute inset-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 font-bold flex items-center justify-center">
                        {hoverLabel}
                    </span>
                )}
                {icon && <span className="transition-transform duration-500 group-hover:translate-x-1.5 flex items-center">{icon}</span>}
            </span>
        </>
    );

    if (href) {
        const isExternal = href.startsWith('http') || href.startsWith('//') || href.startsWith('tel:') || href.startsWith('mailto:');
        const resolvedTarget = target || (isExternal ? '_blank' : undefined);
        return (
            <a 
                id={id}
                href={href} 
                onClick={handleClick} 
                target={resolvedTarget} 
                rel={resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined} 
                className={combinedClassName}
            >
                {content}
            </a>
        );
    }

    return (
        <button 
            id={id}
            type={type} 
            disabled={disabled} 
            onClick={handleClick} 
            className={combinedClassName}
        >
            {content}
        </button>
    );
};