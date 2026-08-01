import { motion } from "framer-motion";

export default function Privacy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, subscribe to a meal plan, or contact our support team. This may include your name, email address, phone number, delivery address, and health-related data (BMI, dietary preferences) required for personalizing your meals."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the collected information to: (a) Provide, maintain, and improve our services; (b) Personalize your meal protocols; (c) Process transactions and send related information; (d) Communicate with you about products, services, and events; and (e) Monitor and analyze trends and usage."
    },
    {
      title: "3. Sharing of Information",
      content: "We do not sell your personal data. We may share information with third-party service providers (e.g., delivery partners, payment processors) who perform services on our behalf. These providers are bound by strict confidentiality agreements."
    },
    {
      title: "4. Data Security",
      content: "We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers (Firebase/Google Cloud) and sensitive information is encrypted via SSL technology."
    },
    {
      title: "5. Your Rights",
      content: "You have the right to access, update, or delete your personal information at any time. You can manage your preferences through your account dashboard or by contacting our support team."
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
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-950 mb-6">Privacy Policy</h1>
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

          <div className="mt-20 p-10 rounded-[2.5rem] bg-zinc-50 border border-zinc-100">
            <h3 className="text-xl font-bold text-zinc-950 mb-4">Questions about our policy?</h3>
            <p className="text-zinc-500 mb-6">If you have any questions or concerns about how we handle your data, please reach out to our privacy team.</p>
            <a href="mailto:privacy@taazabites.com" className="text-emerald-600 font-bold hover:underline">privacy@taazabites.com</a>
          </div>
        </div>
      </main>
    </div>
  );
}
