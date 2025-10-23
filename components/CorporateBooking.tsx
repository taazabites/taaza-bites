import React from 'react';

export const CorporateBooking: React.FC = () => {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const message = `*CORPORATE ENQUIRY - Taazabites*%0A---%0A*Company:* ${data.corpName}%0A*Contact:* ${data.corpContact}%0A*Employees:* ${data.numEmployees}%0A*Meal Type:* ${data.mealType}%0A*Start Date:* ${data.startDate}%0A---%0APlease contact me to discuss a corporate meal partnership!`;
    
    window.open(`https://wa.me/917975771457?text=${message}`, '_blank');
  };

  return (
    <section id="corporate-booking" className="py-20 md:py-28 bg-zinc-800 text-white relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-black">
      <img 
        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&fm=webp&w=1280&q=80" 
        srcSet="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&fm=webp&w=640&q=80 640w, https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&fm=webp&w=1280&q=80 1280w, https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&fm=webp&w=1920&q=80 1920w"
        sizes="100vw"
        loading="lazy"
        alt="Modern office colleagues enjoying a healthy meal" 
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-on-scroll" data-animation="slide-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold font-iowan text-white inline-block relative pb-2">
            Fuel Your Team: Corporate Meals
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[var(--accent)]"></span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Info */}
          <div className="animate-on-scroll" data-animation="slide-in-left" data-stagger-delay="0.2s">
            <h3 className="text-2xl md:text-3xl font-bold font-iowan text-white mb-4">Customized Meal Plans for Your Team</h3>
            <p className="text-white/80 mb-6 text-lg">Elevate productivity with fresh, healthy, and customized meal solutions delivered daily to your Bangalore office.</p>
            <ul className="space-y-3 text-white/90">
              {['Flexible Daily/Weekly Delivery', 'Dedicated Account Manager', 'Custom Budgeting & Menu Cycles', 'Catering for Meetings & Events'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <i className="fas fa-check-circle text-[var(--primary)]"></i> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Form */}
          <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 animate-on-scroll" data-animation="slide-in-right" data-stagger-delay="0.2s">
            <h4 className="text-2xl font-bold text-center text-white mb-6 font-iowan">Get a Quote</h4>
            <form onSubmit={handleFormSubmit} className="space-y-4 form-glow">
              <div>
                <label htmlFor="corpName" className="block text-sm font-semibold text-white/80 mb-1">Company Name</label>
                <input type="text" id="corpName" name="corpName" required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg outline-none transition-shadow" placeholder="Your Company Name" />
              </div>
               <div>
                <label htmlFor="corpContact" className="block text-sm font-semibold text-white/80 mb-1">Your Name / Contact</label>
                <input type="text" id="corpContact" name="corpContact" required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg outline-none transition-shadow" placeholder="Name and Phone Number" />
              </div>
               <div>
                <label htmlFor="numEmployees" className="block text-sm font-semibold text-white/80 mb-1">Number of Employees</label>
                <input type="number" id="numEmployees" name="numEmployees" min="10" required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg outline-none transition-shadow" placeholder="e.g., 50" />
              </div>
              <div>
                <label htmlFor="mealType" className="block text-sm font-semibold text-white/80 mb-1">Preferred Meal Type</label>
                <select id="mealType" name="mealType" required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg outline-none transition-shadow">
                  <option className="bg-zinc-800">Daily Lunch/Dinner</option>
                  <option className="bg-zinc-800">Weekly Subscription</option>
                  <option className="bg-zinc-800">Catering for Events</option>
                  <option className="bg-zinc-800">Custom Plan</option>
                </select>
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-white/80 mb-1">Estimated Start Date</label>
                <input type="date" id="startDate" name="startDate" required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg outline-none transition-shadow" />
              </div>
              <button type="submit" className="w-full bg-[var(--accent-secondary)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#F84D15] shadow-lg shadow-[var(--accent-secondary)]/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ripple-effect">
                <i className="fab fa-whatsapp"></i> Send Enquiry via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};