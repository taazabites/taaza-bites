import React from 'react';

export const ShippingPolicy: React.FC = () => {
    return (
        <section id="shipping" className="pt-24 lg:pt-32 pb-20 bg-[#F5F2ED] min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-[#1A1A1A] tracking-tight mb-4">Shipping Policy</h1>
                    <div className="h-1 w-20 bg-[#059669] mx-auto rounded-full mb-8"></div>
                    <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
                        Information regarding our delivery times, areas, and guidelines.
                    </p>
                </div>
                
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 prose prose-stone max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">1. Delivery Zones</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We currently deliver across select areas in Bengaluru. You can check if we deliver to your location by entering your pin code during the checkout process. We are actively expanding our delivery network to cover more zones.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">2. Delivery Timings</h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">Our scheduled delivery slots are designed to bring fresh meals directly to your doorstep:</p>
                    <ul className="list-disc pl-5 text-gray-600 mb-6 space-y-2">
                        <li><strong>Lunch:</strong> Delivery typically happens between 11:30 AM and 1:30 PM.</li>
                        <li><strong>Dinner:</strong> Delivery typically happens between 7:00 PM and 9:00 PM.</li>
                    </ul>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Please note that exact delivery times might slightly vary depending on traffic conditions and weather.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">3. Delivery Protocols</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Our delivery partners follow strict hygiene and safety guidelines. You can opt for "Leave at Door" if you prefer zero-contact delivery. It is the customer's responsibility to ensure that someone is available to receive the order or that instructions are provided to leave it in a safe place.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">4. Shipping Charges</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Shipping charges are calculated based on your delivery distance and will be displayed transparently at checkout. Some subscription tiers may include free delivery as part of the plan benefits.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">5. Missed Deliveries</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Due to the perishable nature of our meals, we cannot re-attempt deliveries if our partner is unable to hand over the meal or leave it securely at the specified address after multiple contact attempts. Such missed deliveries will not be eligible for a refund.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">6. Contact Information</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        If you have queries about your delivery, please contact our support team at support@taazabites.in.
                    </p>
                </div>
            </div>
        </section>
    );
};
