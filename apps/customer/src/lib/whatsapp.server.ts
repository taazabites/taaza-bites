
export const WhatsAppService = {
  sendText: async (phone: string, message: string) => {
    const apiKey = process.env.GUPSHUP_API_KEY;
    const source = process.env.GUPSHUP_SOURCE_NUMBER;
    const appName = process.env.GUPSHUP_APP_NAME;

    if (!apiKey || !source || !appName) {
      console.error("Gupshup configuration missing");
      return false;
    }

    const formattedPhone = phone.replace(/[^0-9]/g, '');

    const url = "https://api.gupshup.io/sm/api/v1/msg";
    const body = new URLSearchParams({
      channel: "whatsapp",
      source: source,
      destination: formattedPhone,
      message: JSON.stringify({ type: "text", text: message }),
      'src.name': appName
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": apiKey,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Gupshup API error:", err);
      return false;
    }

    return true;
  }
};
