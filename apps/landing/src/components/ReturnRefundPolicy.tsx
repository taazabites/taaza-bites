import React from 'react';

export const ReturnRefundPolicy: React.FC = () => {
    return (
        <section id="refund" className="pt-24 lg:pt-32 pb-20 bg-[#F5F2ED] min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-[#1A1A1A] tracking-tight mb-4">Return & Refund Policy</h1>
                    <div className="h-1 w-20 bg-[#059669] mx-auto rounded-full mb-8"></div>
                    <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
                        Please read our policy on returns and refunds carefully.
                    </p>
                </div>
                
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 prose prose-stone max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">1. Return Policy</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Perishable goods such as food cannot be returned. If you are unsatisfied with your meal, please contact our support team immediately upon receiving your order, and we will do our best to resolve the issue.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">2. Refund Policy</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Refunds will be processed in cases where the order is cancelled before the cut-off time, or if we fail to deliver the order due to unforeseen circumstances on our end. For subscription plans, cancellations must be made 48 hours prior to the next scheduled delivery cycle to qualify for a prorated refund.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">3. Issue Resolution</h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">If there is an issue with your delivered meal (e.g., incorrect item, missing items, or quality issues):</p>
                    <ul className="list-disc pl-5 text-gray-600 mb-6 space-y-2">
                        <li>Please contact us within 2 hours of delivery.</li>
                        <li>Provide a photo representation of the issue if possible.</li>
                        <li>Our team will assess the situation and may offer a full or partial refund, or a replacement meal at our discretion.</li>
                    </ul>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">4. Processing Time</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Approved refunds will be processed to the original method of payment within 5-7 business days, depending on your bank or credit card issuer.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">5. Contact Information</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        If you have any questions about our return and refund policy, please contact us at support@taazabites.in.
                    </p>
                </div>
            </div>
        </section>
    );
};
