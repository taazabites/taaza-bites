export interface GupshupConfig {
  appName: string;
  apiKey: string;
  baseUrl: string;
  webhookUrl: string;
  webhookStatus: 'connected' | 'warning' | 'failed';
  apiStatus: 'connected' | 'warning' | 'failed';
  templateSyncStatus: 'synced' | 'pending' | 'failed';
  lastSyncTime: string;
}

export interface FirebaseGatewayConfig {
  projectId: string;
  authStatus: 'connected' | 'warning' | 'failed';
  firestoreStatus: 'connected' | 'warning' | 'failed';
  storageStatus: 'connected' | 'warning' | 'failed';
  functionsStatus: 'connected' | 'warning' | 'failed';
  realtimeConnection: 'connected' | 'warning' | 'failed';
}

export interface RazorpayConfig {
  keyId: string;
  webhookSecret: string;
  webhookStatus: 'connected' | 'warning' | 'failed';
  paymentApiStatus: 'connected' | 'warning' | 'failed';
  refundApiStatus: 'connected' | 'warning' | 'failed';
  lastWebhookReceived: string;
}

export interface EmailConfig {
  brevoSmtpKey: string;
  senderEmail: string;
  smtpStatus: 'connected' | 'warning' | 'failed';
}

export interface PushNotificationConfig {
  fcmServerKey: string;
  fcmProject: string;
  status: 'connected' | 'warning' | 'failed';
}

export interface SystemHealth {
  envVars: 'valid' | 'invalid';
  connectedServices: number;
  webhookHealth: 'healthy' | 'degraded' | 'critical';
  cronJobs: 'running' | 'stopped';
  backgroundWorkers: 'active' | 'idle';
  realtimeListeners: number;
}

export interface GatewayConfiguration {
  gupshup: GupshupConfig;
  firebase: FirebaseGatewayConfig;
  razorpay: RazorpayConfig;
  email: EmailConfig;
  notifications: PushNotificationConfig;
  updatedBy: {
    id: string;
    email: string;
    name: string;
  } | null;
  updatedAt: any;
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'push' | 'sms';
  templateId: string;
  segmentId: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled' | 'archived';
  scheduledAt: any;
  createdAt: any;
  updatedAt: any;
  stats: {
    total: number;
    delivered: number;
    read: number;
    failed: number;
    clicked: number;
  };
  audiencePreview: number;
  deliveryEstimate: string;
  costEstimate: number;
}

export interface MessageTemplate {
  id: string;
  externalId: string;
  name: string;
  category: 'Marketing' | 'Utility' | 'Authentication' | 'Transactional' | 'Reminder' | 'Support';
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT';
  language: string;
  // Backward compatibility fields
  channel?: 'WhatsApp' | 'Push' | 'Email' | 'SMS';
  subject?: string;
  bannerUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  // End backward compatibility
  header?: {
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    content: string;
  };
  body: string;
  footer?: string;
  buttons?: {
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    value: string;
  }[];
  updatedAt: any;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  filters: any;
  customerCount: number;
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'payment' | 'order' | 'subscription' | 'kitchen' | 'delivery' | 'inventory' | 'marketing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'failed' | 'scheduled' | 'delivered';
  targetUserId?: string;
  metadata?: any;
  createdAt: any;
  readAt?: any;
}

export interface CommunicationLog {
  id: string;
  channel: 'whatsapp' | 'email' | 'push' | 'sms';
  direction: 'outbound' | 'inbound';
  recipient: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'clicked';
  campaignId?: string;
  templateId?: string;
  error?: string;
  timestamp: any;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastTimestamp: any;
  unreadCount: number;
  status: 'active' | 'archived' | 'pending';
}
