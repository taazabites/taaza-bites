import React from 'react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <section id="privacy" className="pt-24 lg:pt-32 pb-20 bg-[#F5F2ED] min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-[#1A1A1A] tracking-tight mb-4">Privacy Policy</h1>
                    <div className="h-1 w-20 bg-[#059669] mx-auto rounded-full mb-8"></div>
                    <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
                        Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
                    </p>
                </div>
                
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 prose prose-stone max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">1. Information We Collect</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">2. How We Use Information</h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">We may use the information we collect about you to:</p>
                    <ul className="list-disc pl-5 text-gray-600 mb-6 space-y-2">
                        <li>Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages;</li>
                        <li>Perform internal operations, including, for example, to prevent fraud and abuse of our Services; to troubleshoot software bugs and operational problems; to conduct data analysis, testing, and research; and to monitor and analyze usage and activity trends;</li>
                        <li>Send you communications we think will be of interest to you, including information about products, services, promotions, news, and events of Taazabites and other companies.</li>
                    </ul>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">3. Sharing of Information</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 mb-6 space-y-2">
                        <li>With third parties to provide you a service you requested through a partnership or promotional offering made by a third party or us;</li>
                        <li>With the general public if you submit content in a public forum, such as blog comments, social media posts, or other features of our Services;</li>
                        <li>With our subsidiaries and affiliated entities that provide services or conduct data processing on our behalf.</li>
                    </ul>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">4. Security</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </p>

                    <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mt-8 mb-4">5. Contact Us</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        If you have any questions about this Privacy Statement, please contact us at support@taazabites.in.
                    </p>
                </div>
            </div>
        </section>
    );
};
