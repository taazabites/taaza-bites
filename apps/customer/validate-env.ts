export function validateEnv() {
  const requiredVars = [
    // We won't require Razorpay or Gemini for startup, only when hitting routes.
    // Let's just check standard ones or add a log if missing.
  ];
}
