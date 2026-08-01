import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-black text-zinc-900 mb-8">Refund Policy</h1>
      <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600 font-medium">
          <p className="text-sm text-zinc-400">Last updated: July 09, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">1. Subscription Refunds</h2>
            <p>
              We want you to be completely satisfied with your TaazaBites experience. However, since we provide 
              freshly prepared meals tailored to individual metabolic profiles, our refund policy is as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Before Protocol Starts:</strong> You can cancel your subscription for a full refund (to your original payment method) up to 48 hours before your first scheduled delivery.</li>
              <li><strong>After Protocol Starts:</strong> Once a protocol has started, we do not offer cash refunds. However, if you are unsatisfied, we can convert your remaining balance to Wallet Credits for future use.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">2. Wallet Credits</h2>
            <p>
              Credits added to your TaazaBites Wallet are non-refundable and non-transferable. They do not 
              expire and can be used for any future protocol or meal purchase.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">3. Quality Issues</h2>
            <p>
              If there is an issue with the quality of a delivered meal (e.g., packaging damage, missing items), 
              please report it via the Support section in your dashboard within 4 hours of delivery. We will 
              issue a full credit for that meal to your wallet immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">4. Processing Refunds</h2>
            <p>
              Approved refunds to original payment methods may take 5-7 business days to reflect in your 
              account, depending on your bank or card issuer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">5. Contact Support</h2>
            <p>
              For all refund-related queries, please reach out to our billing team at: 
              <strong>billing@taazabites.com</strong>
            </p>
          </section>
        </div>
      </div>
    
  );
};

export default RefundPolicy;
