import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-black text-zinc-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600 font-medium">
          <p className="text-sm text-zinc-400">Last updated: July 09, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">1. Introduction</h2>
            <p>
              Welcome to TaazaBites. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our 
              website (regardless of where you visit it from) and tell you about your privacy rights and how 
              the law protects you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">2. The Data We Collect About You</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have 
              grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Health Data:</strong> includes dietary preferences, metabolic goals, and assessment results provided during signup.</li>
              <li><strong>Financial Data:</strong> includes payment card details (processed by Razorpay).</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">3. How We Use Your Personal Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your 
              personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To register you as a new customer.</li>
              <li>To process and deliver your order.</li>
              <li>To manage our relationship with you.</li>
              <li>To improve our website, products/services, marketing, customer relationships and experiences.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being 
              accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, 
              we limit access to your personal data to those employees, agents, contractors and other third 
              parties who have a business need to know.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">5. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your 
              personal data, including the right to request access, correction, erasure, restriction, 
              transfer, or to object to processing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact 
              us at: <strong>support@taazabites.com</strong>
            </p>
          </section>
        </div>
      </div>
    
  );
};

export default PrivacyPolicy;
