import { motion } from "framer-motion";

export default function Terms() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using the Taaza Bites website and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services."
    },
    {
      title: "2. Subscription and Billing",
      content: "Taaza Bites is a membership-based service. By subscribing, you authorize us to charge your provided payment method on a recurring basis. You can pause or cancel your subscription at any time through your dashboard. Cancellations must be made at least 48 hours before the next billing cycle."
    },
    {
      title: "3. Delivery Policy",
      content: "We aim to deliver all meals by 7:00 AM. While we strive for precision, delivery times may vary based on weather or traffic conditions. It is the customer's responsibility to ensure a safe drop-off location is available."
    },
    {
      title: "4. Health Disclaimer",
      content: "Taaza Bites provides healthy meals but is not a medical provider. Our nutritional advice and meal plans are for informational purposes. Consult with a physician before starting any new dietary program, especially if you have pre-existing health conditions."
    },
    {
      title: "5. Refunds and Cancellations",
      content: "Due to the perishable nature of our products, we do not offer refunds once a meal has been prepared or delivered. If there is an issue with the quality of your meal, please contact support within 4 hours of delivery for a wallet credit."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-24 sm:pt-28 pb-40 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-950 mb-6">Terms & Conditions</h1>
            <p className="text-zinc-500 font-medium">Last updated: July 22, 2026</p>
          </motion.div>

          <div className="space-y-12">
            {sections.map((section, i) => (
              <div key={i} className="prose prose-zinc max-w-none">
                <h2 className="text-2xl font-bold text-zinc-950 mb-4">{section.title}</h2>
                <p className="text-zinc-600 leading-relaxed text-lg">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 p-10 rounded-[2.5rem] bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20">
            <h3 className="text-2xl font-black mb-4">Agreement</h3>
            <p className="text-emerald-100 leading-relaxed">
              By using Taaza Bites, you acknowledge that you have read, understood, and agree to be bound by these terms. We reserve the right to update these terms at any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
