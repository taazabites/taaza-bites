import axios from 'axios';

const GUPSHUP_API_KEY = import.meta.env.VITE_GUPSHUP_API_KEY || '';
const GUPSHUP_APP_NAME = import.meta.env.VITE_GUPSHUP_APP_NAME || '';
const GUPSHUP_BASE_URL = import.meta.env.VITE_GUPSHUP_BASE_URL || 'https://api.gupshup.io';

const client = axios.create({
  baseURL: GUPSHUP_BASE_URL,
  headers: {
    'apikey': GUPSHUP_API_KEY,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export const gupshupService = {
  async sendText(phone: string, message: string) {
    const params = new URLSearchParams({
      channel: 'whatsapp',
      source: GUPSHUP_APP_NAME!,
      destination: phone,
      'message': JSON.stringify({ type: 'text', text: message }),
    });
    return client.post('/sm/api/v1/msg', params);
  },

  async sendTemplate(phone: string, templateId: string, params: string[]) {
    const paramsObj = new URLSearchParams({
      channel: 'whatsapp',
      source: GUPSHUP_APP_NAME!,
      destination: phone,
      'message': JSON.stringify({
        type: 'template',
        template: {
          id: templateId,
          params: params
        }
      }),
    });
    return client.post('/sm/api/v1/msg', paramsObj);
  },

  async sendImage(phone: string, imageUrl: string, caption?: string) {
    const params = new URLSearchParams({
      channel: 'whatsapp',
      source: GUPSHUP_APP_NAME!,
      destination: phone,
      'message': JSON.stringify({
        type: 'image',
        image: {
          url: imageUrl,
          caption: caption
        }
      }),
    });
    return client.post('/sm/api/v1/msg', params);
  },

  async sendDocument(phone: string, documentUrl: string, caption?: string) {
    const params = new URLSearchParams({
      channel: 'whatsapp',
      source: GUPSHUP_APP_NAME!,
      destination: phone,
      'message': JSON.stringify({
        type: 'file',
        file: {
          url: documentUrl,
          caption: caption
        }
      }),
    });
    return client.post('/sm/api/v1/msg', params);
  },
    
  async sendOTP(phone: string, otp: string) {
    return this.sendText(phone, `Your OTP is ${otp}`);
  }
};
