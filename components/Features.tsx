import React from 'react';

const FeatureCard = ({ icon, title, text, staggerDelay }: { icon: string; title: string; text: string; staggerDelay: string; }) => (
  <div className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex-shrink-0 w-full h-full animate-on-scroll border border-zinc-200/60`} data-animation="slide-fade-in-up" data-stagger-delay={staggerDelay}>
    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-light)] via-white to-green-50 text-[var(--primary-dark)] text-3xl flex items-center justify-center border border-zinc-200/80 shadow-inner">
      <i className={icon}></i>
    </div>
    <h3 className="text-xl font-bold font-iowan text-[var(--primary-dark)] mb-2">{title}</h3>
    <p className="text-zinc-600">{text}</p>
  </div>
);

const RatingCard = ({ platform, rating, reviews, logo, color, staggerDelay }: { platform: string; rating: string; reviews: string; logo: React.ReactNode; color: string; staggerDelay: string; }) => {
    const renderStars = () => {
        const fullStars = Math.floor(parseFloat(rating));
        const halfStar = parseFloat(rating) % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return (
            <>
                {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="fas fa-star"></i>)}
                {halfStar && <i className="fas fa-star-half-alt"></i>}
                {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="far fa-star"></i>)}
            </>
        )
    };
    
    return (
        <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex flex-col items-center justify-start text-center gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-on-scroll`} data-animation="slide-fade-in-up" data-stagger-delay={staggerDelay}>
            <div className={`text-4xl ${color} h-10 flex items-center justify-center`}>
                {logo}
            </div>
            <div className="flex-grow">
                <div className="flex items-center justify-center gap-2">
                     <div className="text-yellow-400 flex items-center" aria-label={`${platform} Rating: ${rating} out of 5 stars`}>
                       {renderStars()}
                    </div>
                    <span className="font-bold text-zinc-700 text-sm bg-zinc-100 px-2 py-1 rounded-md">{rating}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">{reviews}</p>
            </div>
        </div>
    );
};


export const Features: React.FC = () => {
  const features = [
    { icon: "fas fa-leaf", title: "Fresh Ingredients", text: "We source locally and seasonally for optimal flavor and nutritional value." },
    { icon: "fas fa-truck", title: "Fast Delivery", text: "Timely delivery across Bangalore — always fresh and on schedule." },
    { icon: "fas fa-heart", title: "Nutrition-First", text: "Meals designed by nutritionists to meet your specific health goals." },
    { icon: "fas fa-medal", title: "Chef-Crafted", text: "Gourmet meals created by expert chefs who care about taste and health." },
  ];

  const ratingsData = [
    { 
        platform: 'Google', 
        rating: '4.8', 
        reviews: '500+ Reviews', 
        logo: <i className="fab fa-google"></i>, 
        color: 'text-[#4285F4]'
    },
    { 
        platform: 'Zomato', 
        rating: '4.6', 
        reviews: '800+ Ratings', 
        logo: <svg role="img" aria-label="Zomato Logo" viewBox="0 0 125 30" className="h-8 w-auto" fill="currentColor"><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fontWeight="bold">zomato</text></svg>,
        color: 'text-[#EF4F5F]'
    },
    { 
        platform: 'Swiggy', 
        rating: '4.5', 
        reviews: '1200+ Ratings', 
        logo: <svg role="img" aria-label="Swiggy Logo" viewBox="0 0 120 30" className="h-7 w-auto" fill="currentColor"><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fontWeight="bold">swiggy</text></svg>,
        color: 'text-[#FC8019]'
    },
    {
        platform: 'Justdial',
        rating: '4.7',
        reviews: '750+ Ratings',
        logo: <svg role="img" aria-label="Justdial Logo" viewBox="0 0 140 30" className="h-7 w-auto" fill="currentColor"><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="26" fontWeight="bold">Justdial</text></svg>,
        color: 'text-yellow-500'
    }
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-[var(--section-bg-light-green)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-on-scroll" data-animation="slide-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold font-iowan text-[var(--primary-dark)] inline-block relative pb-2">
            Why Choose Taazabites
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[var(--accent)]"></span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} staggerDelay={`${index * 0.1}s`} />
            ))}
        </div>

        {/* Ratings Section */}
        <div className="mt-16 md:mt-20">
          <div className="text-center mb-10 animate-on-scroll" data-animation="slide-fade-in-up">
            <h3 className="text-2xl font-semibold text-zinc-700">Trusted by thousands of foodies across Bangalore</h3>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
            {ratingsData.map((rating, index) => <RatingCard key={rating.platform} {...rating} staggerDelay={`${index * 0.1}s`} />)}
          </div>
        </div>
      </div>
    </section>
  );
};