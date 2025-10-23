import React, { useState } from 'react';
import { generateSubscriptionProjection } from '../services/geminiService';

const PlanCard = ({ title, price, period, features, popular, ctaText, ctaLink, secondary = false, staggerDelay }: any) => (
  <div className={`relative p-8 rounded-2xl transition-all duration-300 flex flex-col w-[85%] sm:w-auto flex-shrink-0 snap-center animate-on-scroll ${popular ? 'bg-gradient-to-br from-green-50 to-lime-100/80 border-2 border-[var(--primary)] shadow-2xl' : 'bg-white border border-zinc-200/80 shadow-lg'}`} data-animation="slide-fade-in-up" data-stagger-delay={staggerDelay}>
    {popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-sm font-bold px-4 py-1 rounded-full">Most Popular</div>}
    <h3 className="text-2xl font-bold font-iowan text-[var(--primary-dark)] text-center mb-2">{title}</h3>
    <div className="text-center mb-6">
      <span className="text-4xl font-extrabold text-[var(--primary-dark)]">{price}</span>
      <span className="text-zinc-500"> / {period}</span>
    </div>
    <ul className="space-y-3 text-zinc-700 mb-8 flex-grow">
      {features.map((feature: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <i className="fas fa-check-circle text-[var(--primary)] mt-1"></i> <span>{feature}</span>
        </li>
      ))}
    </ul>
    <a href={ctaLink} target="_blank" rel="noopener noreferrer" className={`w-full text-center py-3 px-6 rounded-lg font-bold transition-all duration-300 ripple-effect ${secondary ? 'bg-white text-[var(--accent-secondary)] border-2 border-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)] hover:text-white' : 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white hover:scale-105 shadow-lg shadow-[var(--primary)]/30'}`}>
      {ctaText}
    </a>
  </div>
);

interface ProjectionResult {
  projectionText: string;
  detailedExplanation: string;
  recommendedPlan: string;
  goal: string;
}

const goalMeta = {
    loss: { icon: 'fas fa-arrow-down', colorClass: 'text-green-600', bgClass: 'bg-green-100', borderClass: 'border-green-600' },
    gain: { icon: 'fas fa-dumbbell', colorClass: 'text-blue-500', bgClass: 'bg-blue-100', borderClass: 'border-blue-500' },
    maintain: { icon: 'fas fa-balance-scale', colorClass: 'text-orange-500', bgClass: 'bg-orange-100', borderClass: 'border-orange-500' },
};


export const Subscriptions: React.FC = () => {
  const [projection, setProjection] = useState<ProjectionResult | null>(null);
  const [isProjecting, setIsProjecting] = useState(false);
  const [error, setError] = useState('');

  const handleProjection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProjecting(true);
    setError('');
    setProjection(null);

    const formData = new FormData(e.currentTarget);
    const data = {
        weight: parseFloat(formData.get('currentWeight') as string),
        height: parseFloat(formData.get('height') as string),
        age: parseInt(formData.get('age') as string, 10),
        gender: formData.get('gender') as string,
        goal: formData.get('fitnessGoal') as string,
    };

    if (isNaN(data.weight) || isNaN(data.height) || isNaN(data.age) || !data.gender || !data.goal) {
        setError('Please fill in all fields with valid numbers.');
        setIsProjecting(false);
        return;
    }

    try {
        const result = await generateSubscriptionProjection(data.weight, data.height, data.age, data.gender, data.goal);
        setProjection({ ...result, goal: data.goal });
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsProjecting(false);
    }
  };
  
  const FormInput = ({ icon, name, placeholder, type = 'number', required = true }: { icon: string; name: string; placeholder: string; type?: string; required?: boolean; }) => (
      <div className="relative">
          <i className={`fas ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400`}></i>
          <input type={type} name={name} placeholder={placeholder} required={required} className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 rounded-lg focus:border-transparent outline-none transition" />
      </div>
  );
  
  const FormSelect = ({ icon, name, children }: { icon: string; name: string; children: React.ReactNode; }) => (
      <div className="relative">
          <i className={`fas ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400`}></i>
          <select name={name} required className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 rounded-lg focus:border-transparent outline-none appearance-none">
              {children}
          </select>
          <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
      </div>
  )

  return (
    <section id="subscriptions" className="py-20 md:py-28 bg-gradient-to-b from-white to-[var(--section-bg-light-green)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-on-scroll" data-animation="slide-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold font-iowan text-[var(--primary-dark)] inline-block relative pb-2">
            Flexible Subscription Plans
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[var(--accent)]"></span>
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-lime-100/50 p-8 md:p-12 rounded-3xl shadow-2xl mb-16 animate-on-scroll" data-animation="scale-up">
            <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold font-iowan text-[var(--primary-dark)] mb-2">Unlock Your 1-Month Potential</h3>
                <p className="text-zinc-600 max-w-xl mx-auto">Get a personalized AI projection of your results with a Taazabites subscription. Just enter your details below!</p>
            </div>
            
            <form onSubmit={handleProjection} className="space-y-4 form-glow">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput icon="fa-weight-hanging" name="currentWeight" placeholder="Current Weight (kg)" />
                    <FormInput icon="fa-ruler-vertical" name="height" placeholder="Height (cm)" />
                    <FormInput icon="fa-birthday-cake" name="age" placeholder="Age" />
                    <FormSelect icon="fa-venus-mars" name="gender">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </FormSelect>
                </div>
                <div>
                     <FormSelect icon="fa-bullseye" name="fitnessGoal">
                        <option value="">What's Your Primary Goal?</option>
                        <option value="loss">Weight Loss</option>
                        <option value="gain">Muscle Gain</option>
                        <option value="maintain">Maintain Weight</option>
                    </FormSelect>
                </div>

                <button type="submit" disabled={isProjecting} className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold py-4 px-6 rounded-lg text-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-zinc-400 disabled:from-zinc-400 disabled:shadow-none disabled:scale-100 ripple-effect">
                    {isProjecting ? <><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Calculating Your Future...</span></> : <><i className="fas fa-magic"></i><span>Project My Results</span></>}
                </button>
            </form>
            
            {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            
            {projection && (
              <div className={`mt-6 bg-white p-6 rounded-2xl border-l-8 ${goalMeta[projection.goal as keyof typeof goalMeta].borderClass} shadow-2xl transition-all duration-500 ease-in-out`}>
                  <div className="flex items-start gap-4">
                     <div className={`w-14 h-14 rounded-full ${goalMeta[projection.goal as keyof typeof goalMeta].bgClass} ${goalMeta[projection.goal as keyof typeof goalMeta].colorClass} text-2xl flex items-center justify-center flex-shrink-0`}>
                        <i className={goalMeta[projection.goal as keyof typeof goalMeta].icon}></i>
                     </div>
                     <div>
                        <h4 className="text-xl font-bold font-iowan text-[var(--primary-dark)]">{projection.projectionText}</h4>
                        <p className="text-zinc-600 mt-1">{projection.detailedExplanation}</p>
                        <div className="mt-3 bg-[var(--accent)]/80 text-yellow-900 text-sm font-bold px-4 py-2 rounded-lg inline-block">
                           AI Recommends: <span className="font-extrabold">{projection.recommendedPlan}</span>
                        </div>
                     </div>
                  </div>
              </div>
            )}
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
             <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory lg:contents pb-4 lg:pb-0 hide-scrollbar">
                <PlanCard title="Weekly Warrior" price="₹1,799" period="week" features={['5 Meals (Lunch or Dinner)', 'Choose from full menu', 'Perfect for trying us out', 'Free Delivery']} ctaText="Choose Plan" ctaLink="https://wa.me/917975771457?text=Hi!%20I'm%20interested%20in%20the%20Weekly%20Warrior%20plan." secondary staggerDelay="0s" />
                <PlanCard title="Monthly Motivator" price="₹6,499" period="month" features={['20 Meals (Lunch or Dinner)', 'Best value & savings', 'Pause or resume anytime', 'Priority Delivery']} ctaText="Subscribe Now" ctaLink="https://wa.me/917975771457?text=Hi!%20I'm%20interested%20in%20the%20Monthly%20Motivator%20plan." popular staggerDelay="0.1s" />
                <PlanCard title="Corporate Fuel" price="Custom" period="person" features={['For teams of 10+', 'Custom Budgeting & Menu', 'Dedicated account manager', 'Special corporate rates']} ctaText="Contact Sales" ctaLink="#corporate-booking" secondary staggerDelay="0.2s" />
            </div>
        </div>
      </div>
    </section>
  );
};