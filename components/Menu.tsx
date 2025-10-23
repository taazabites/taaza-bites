import React, { useState, useMemo, useRef } from 'react';

interface MenuItemProps {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  tags: string[];
  badge?: string;
  nutritionInfo: string;
}

const menuItemsData: MenuItemProps[] = [
    { name: "High Protein Egg Chicken Meal", description: "Grilled chicken with boiled eggs and seasonal vegetables.", price: "349", imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/HYC3ipj-ea1cb459-9f06-4842-9f10-c36beef7395f.jpg?format=webp&w=400&q=75", tags: ["high-protein", "keto"], badge: "Chef's Pick", nutritionInfo: "Calories: 450, Protein: 40g, Carbs: 10g, Fat: 28g" },
    { name: "Dry Fruit Chia Pudding", description: "Chia seeds, assorted dry fruits and natural sweeteners.", price: "319", imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/s9ZRSy5-f46b9d1a-8aca-471a-ae55-11652376cce1.jpg?format=webp&w=400&q=75", tags: ["vegetarian"], badge: "Healthy Start", nutritionInfo: "Calories: 350, Protein: 10g, Carbs: 45g, Fat: 15g" },
    { name: "Premium Chicken Pink Pasta", description: "Creamy pink sauce with tender chicken and fresh herbs.", price: "459", imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/VruXdfjp-e6ccb5c5-fa1f-4e5d-90bc-12161af1fa18.jpg?format=webp&w=400&q=75", tags: ["high-protein"], badge: "Indulgent", nutritionInfo: "Calories: 550, Protein: 35g, Carbs: 50g, Fat: 25g" },
    { name: "Chickpea Feta Avocado Bowl", description: "A refreshing Mediterranean-inspired bowl.", price: "369", imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/10/15/oBHL0FN-741c31e4-e9a1-4625-ac38-7b1434401eb0.jpg?format=webp&w=400&q=75", tags: ["vegetarian", "new-item"], badge: "New Item", nutritionInfo: "Calories: 420, Protein: 15g, Carbs: 40g, Fat: 22g" },
    { name: "Protein Scramble Rice Bowl", description: "Scrambled eggs, veggie rice, and juicy chicken breast.", price: "349", imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/09/5x3bE-3c79d21a-07b6-498b-81fa-649a1c953380.jpg?format=webp&w=400&q=75", tags: ["high-protein"], nutritionInfo: "Calories: 480, Protein: 38g, Carbs: 30g, Fat: 24g" },
    { name: "Dry Fruit Whey Protein Shake", description: "A powerhouse shake with whey protein, almonds, and more.", price: "269", imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/10/15/bCSV8-f1b53677-3e7a-42ac-8e0f-46ed6af19bb6.jpg?format=webp&w=400&q=75", tags: ["high-protein", "keto"], badge: "Healthy Boost", nutritionInfo: "Calories: 380, Protein: 25g, Carbs: 30g, Fat: 18g" },
];

const MenuItem: React.FC<MenuItemProps & { onNutritionClick: () => void; staggerDelay: string; }> = ({ name, description, price, imageUrl, badge, nutritionInfo, onNutritionClick, staggerDelay }) => {
    const orderLink = `https://wa.me/917975771457?text=Hi%20Taazabites!%20I'd%20like%20to%20order:%20${encodeURIComponent(name)}.`;
    const baseUrl = imageUrl.split('?')[0];

    return (
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-[85%] sm:w-80 flex-shrink-0 snap-center animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay={staggerDelay}>
            <div className="relative image-container h-56">
                {badge && <span className="absolute top-4 left-4 bg-[var(--accent-secondary)] text-white text-xs font-bold px-3 py-1 rounded-full z-10">{badge}</span>}
                <img 
                    src={imageUrl} 
                    srcSet={`${baseUrl}?format=webp&w=320&q=75 320w, ${baseUrl}?format=webp&w=480&q=75 480w, ${baseUrl}?format=webp&w=640&q=75 640w`}
                    sizes="(max-width: 640px) 85vw, 320px"
                    alt={name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    loading="lazy" 
                    onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold font-iowan text-[var(--primary-dark)]">{name}</h3>
                <p className="text-zinc-600 text-sm mt-1 flex-grow">{description}</p>
                <div className="mt-3">
                    <p className="text-xl font-bold text-[var(--accent-secondary)]">₹{price}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                        <span className="font-semibold text-zinc-600">Nutrition:</span> {nutritionInfo}
                    </p>
                </div>
            </div>
            <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                 <button onClick={onNutritionClick} className="w-full text-center py-2 px-4 rounded-lg font-semibold border-2 border-zinc-200 text-zinc-600 hover:bg-zinc-100/80 transition-colors ripple-effect">
                    <i className="fas fa-info-circle mr-2"></i>Nutrition
                </button>
                <a href={orderLink} target="_blank" rel="noopener noreferrer" className="w-full text-center py-2 px-4 rounded-lg font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors flex items-center justify-center ripple-effect">
                    Order Now
                </a>
            </div>
        </article>
    );
};


const Modal: React.FC<{ isVisible: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isVisible, onClose, title, children }) => {
    if (!isVisible) return null;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-on-scroll" data-animation="scale-up" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h3 className="text-xl font-bold font-iowan text-[var(--primary-dark)]">{title}</h3>
            <button onClick={onClose} className="text-2xl text-zinc-400 hover:text-zinc-600">&times;</button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    );
};

export const Menu: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => {
        if (filter === 'all') return menuItemsData;
        return menuItemsData.filter(item => item.tags.includes(filter));
    }, [filter]);

    const handleNutritionClick = (item: MenuItemProps) => {
        const nutritionParts = item.nutritionInfo.split(', ').map(part => {
            const [key, value] = part.split(': ');
            return { key, value };
        });

        setModalContent({
            title: item.name,
            content: (
                <div className="space-y-2">
                    {nutritionParts.map(({ key, value }) => (
                        <div key={key} className="flex justify-between items-baseline text-sm border-b border-zinc-100 py-1">
                            <span className="font-semibold text-zinc-600">{key}</span>
                            <span className="text-zinc-800 font-medium">{value}</span>
                        </div>
                    ))}
                </div>
            )
        });
    };
    
    const handleScroll = (direction: 'prev' | 'next') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            const newScrollLeft = direction === 'prev'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;
            
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth',
            });
        }
    };
    
    const filters = [
        { key: 'all', label: 'All Dishes' },
        { key: 'keto', label: 'Keto' },
        { key: 'vegetarian', label: 'Vegetarian' },
        { key: 'high-protein', label: 'High Protein' },
        { key: 'new-item', label: 'New' },
    ];

    return (
        <section id="menu" className="py-20 md:py-28 bg-[var(--off-white)] relative">
            {/* Top Shape Divider */}
            <div className="section-divider top">
              <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
              </svg>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 animate-on-scroll" data-animation="slide-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold font-iowan text-[var(--primary-dark)] inline-block relative pb-2">
                        Our Signature Dishes
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[var(--accent)]"></span>
                    </h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 mb-8 justify-center hide-scrollbar animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay="0.1s">
                    {filters.map(({ key, label }) => (
                         <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 whitespace-nowrap ripple-effect transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] ${
                                filter === key
                                ? 'bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary)] text-white shadow-lg scale-105'
                                : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 hover:shadow-md hover:border-[var(--primary)]/50 hover:scale-105'
                            }`}
                            >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 hide-scrollbar">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item, index) => (
                               <MenuItem 
                                 key={`${filter}-${item.name}`}
                                 {...item} 
                                 onNutritionClick={() => handleNutritionClick(item)}
                                 staggerDelay={`${index * 0.05}s`}
                               />
                            ))
                        ) : (
                            <div className="w-full text-center py-12 px-6 bg-zinc-50 rounded-2xl flex flex-col items-center justify-center">
                                <i className="fas fa-search text-4xl text-zinc-300 mb-4"></i>
                                <p className="text-zinc-600 font-semibold">No dishes match your filter.</p>
                                <p className="text-zinc-500 text-sm">Try selecting another category.</p>
                            </div>
                        )}
                    </div>
                     {/* Navigation Buttons for larger screens */}
                    <div className="hidden lg:flex justify-between items-center absolute top-1/2 -translate-y-1/2 w-full pointer-events-none">
                         <button
                            onClick={() => handleScroll('prev')}
                            className="pointer-events-auto -ml-6 bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 ripple-effect"
                            aria-label="Previous Item"
                          >
                            <i className="fas fa-chevron-left text-[var(--primary-dark)]"></i>
                          </button>
                           <button
                            onClick={() => handleScroll('next')}
                            className="pointer-events-auto -mr-6 bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 ripple-effect"
                            aria-label="Next Item"
                          >
                            <i className="fas fa-chevron-right text-[var(--primary-dark)]"></i>
                          </button>
                    </div>
                </div>

                <div className="text-center mt-12 animate-on-scroll" data-animation="slide-fade-in-up">
                    <a href="https://taazabites.in/menu" className="inline-block bg-white text-[var(--accent-secondary)] border-2 border-[var(--accent-secondary)] font-bold px-8 py-3 rounded-full hover:bg-[var(--accent-secondary)] hover:text-white transition-colors duration-300 ripple-effect">
                        View Full Menu
                    </a>
                </div>
            </div>
            <Modal isVisible={modalContent !== null} onClose={() => setModalContent(null)} title={modalContent?.title || ''}>
                {modalContent?.content}
            </Modal>
        </section>
    );
};