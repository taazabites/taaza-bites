import React from 'react';

const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-black text-zinc-900 mb-8">Terms and Conditions</h1>
      <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600 font-medium">
          <p className="text-sm text-zinc-400">Last updated: July 09, 2026</p>
          
          <p>
            Please read these terms and conditions carefully before using Our Service.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">1. Acknowledgment</h2>
            <p>
              These are the Terms and Conditions governing the use of this Service and the agreement that 
              operates between You and TaazaBites. These Terms and Conditions set out the rights and 
              obligations of all users regarding the use of the Service.
            </p>
            <p>
              Your access to and use of the Service is conditioned on Your acceptance of and compliance with 
              these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others 
              who access or use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">2. User Accounts</h2>
            <p>
              When You create an account with Us, You must provide Us information that is accurate, complete, 
              and current at all times. Failure to do so constitutes a breach of the Terms, which may result 
              in immediate termination of Your account on Our Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">3. Subscription Protocols</h2>
            <p>
              By subscribing to a TaazaBites metabolic protocol, you agree to follow the dietary guidelines 
              provided. Our meals are designed for metabolic health, but results may vary based on individual 
              health conditions and adherence.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Protocols are valid for the duration specified (e.g., 30 days).</li>
              <li>Unused meals may or may not carry over based on the specific plan terms.</li>
              <li>Subscriptions can be paused up to 3 times per 30-day cycle.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">4. Wallet and Payments</h2>
            <p>
              Wallet balances are non-refundable and can only be used for purchases within the TaazaBites 
              platform. Payments are processed through Razorpay, and you agree to their terms of service 
              during the checkout process.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">5. Limitation of Liability</h2>
            <p>
              TaazaBites provides nutritional information and meals based on general metabolic health 
              principles. We are not medical professionals. Consult with a doctor before starting any 
              significant dietary change, especially if you have pre-existing conditions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">6. Governing Law</h2>
            <p>
              The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and 
              Your use of the Service. Your use of the Application may also be subject to other local, 
              state, national, or international laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">7. Changes to These Terms</h2>
            <p>
              We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. 
              By continuing to access or use Our Service after those revisions become effective, You agree 
              to be bound by the revised terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, You can contact us at: 
              <strong>legal@taazabites.com</strong>
            </p>
          </section>
        </div>
      </div>
    
  );
};

export default TermsConditions;
