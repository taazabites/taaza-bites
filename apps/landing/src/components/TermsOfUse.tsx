import React from 'react';

export const TermsOfUse: React.FC = () => {
    return (
        <section id="terms" className="pt-24 lg:pt-32 pb-20 bg-[#F5F2ED] min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-[#1A1A1A] tracking-tight mb-4">Terms of Use</h1>
                    <div className="h-1 w-20 bg-[#059669] mx-auto rounded-full mb-8"></div>
                    <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
                        Please read these terms and conditions carefully before using our services.
                    </p>
                </div>
                
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 prose prose-stone max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">1. Agreement to Terms</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        By accessing or using our websites, applications, and services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">2. The Service</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        The Service is provided to you “AS IS” and “AS AVAILABLE” and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, Taazabites expressly disclaims all warranties, whether express, implied, statutory or otherwise.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">3. Subscriptions & Payments</h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">When purchasing a meal plan or subscription:</p>
                    <ul className="list-disc pl-5 text-gray-600 mb-6 space-y-2">
                        <li>You agree to provide current, complete, and accurate purchase and account information for all purchases made via our service.</li>
                        <li>All payments must be successfully verified before we can deliver your orders.</li>
                        <li>Subscription cancellations must be made 48 hours prior to the next scheduled delivery cycle to avoid charges for that cycle.</li>
                    </ul>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">4. Food Safety & Allergies</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        While we take extreme care to prevent cross-contamination, our kitchens handle nuts, gluten, dairy, and other potential allergens. We cannot guarantee that any item is completely free of allergens. You must communicate any severe allergies during checkout, but you consume the meals at your own risk.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">5. Delivery Protocol</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We aim to deliver meals within the specified time windows. However, external factors such as weather, traffic in Bengaluru, and unforeseen circumstances may cause delays. Taazabites is not liable for delayed deliveries out of our reasonable control.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">6. Changes to Terms</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">7. Contact Information</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Questions about the Terms of Use should be sent to us at support@taazabites.in.
                    </p>
                </div>
            </div>
        </section>
    );
};
