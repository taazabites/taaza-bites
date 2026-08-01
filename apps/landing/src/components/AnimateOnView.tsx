
import React, { useRef, useEffect, ReactNode } from 'react';

const AnimateOnView: React.FC<{children: ReactNode}> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        if (!('IntersectionObserver' in window)) {
            const makeVisible = () => {
                if(!ref.current) return;
                ref.current.querySelectorAll('.animate-on-scroll:not(.is-visible)').forEach(el => {
                    (el as HTMLElement).style.opacity = '1';
                    (el as HTMLElement).style.transform = 'translateY(0)';
                    (el as HTMLElement).style.filter = 'blur(0)';
                    el.classList.add('is-visible');
                });
            };
            makeVisible();
            const fallbackMo = new MutationObserver(makeVisible);
            fallbackMo.observe(ref.current, { childList: true, subtree: true });
            return () => fallbackMo.disconnect();
        }

        const rootMargin = window.innerWidth < 768 ? '0px 0px -50px 0px' : '0px 0px -100px 0px';
        
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    const delay = el.dataset.staggerDelay || '0s';
                    
                    el.style.transitionDelay = delay;
                    el.classList.add('is-visible');
                    
                    setTimeout(() => {
                        el.style.willChange = 'auto';
                    }, 1000);
                    
                    observerInstance.unobserve(el);
                }
            });
        }, { threshold: 0.1, rootMargin });

        const observedElements = new Set<Element>();

        const observeNewElements = () => {
            if (!ref.current) return;
            ref.current.querySelectorAll('.animate-on-scroll:not(.is-visible)').forEach(el => {
                if (!observedElements.has(el)) {
                    (el as HTMLElement).style.willChange = 'transform, opacity';
                    observer.observe(el);
                    observedElements.add(el);
                }
            });
        };

        observeNewElements();

        const mutationObserver = new MutationObserver(() => {
            observeNewElements();
        });

        mutationObserver.observe(ref.current, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
            observedElements.clear();
        };
    }, []);

    return <div ref={ref} className="w-full">{children}</div>;
};

export default AnimateOnView;
