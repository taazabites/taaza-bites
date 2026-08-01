import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Campaign, CommunicationLog, AutomationTrigger } from '../types';
import { MessageTemplate } from '../types/communication';

export const communicationService = {
  subscribeToTemplates(callback: (items: MessageTemplate[]) => void) {
    
    return onSnapshot(query(collection(db, "messageTemplates"), orderBy("createdAt", "desc")), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageTemplate)));
    });
  },

  subscribeToCampaigns(callback: (items: Campaign[]) => void) {
    
    return onSnapshot(query(collection(db, "campaigns"), orderBy("createdAt", "desc")), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign)));
    });
  },

  subscribeToAutomations(callback: (items: AutomationTrigger[]) => void) {
    
    return onSnapshot(collection(db, "automations"), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as AutomationTrigger)));
    });
  },

  async createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const newTemplate = { id, ...template, createdAt: now, updatedAt: now } as MessageTemplate;
    
    
    await addDoc(collection(db, "messageTemplates"), newTemplate);
    return id;
  },

  async updateTemplate(id: string, template: Partial<MessageTemplate>) {
    const now = new Date().toISOString();
    
    await updateDoc(doc(db, "messageTemplates", id), { ...template, updatedAt: now });
  },

  async deleteTemplate(id: string) {
    
    await deleteDoc(doc(db, "messageTemplates", id));
  },

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'failedCount'>) {
    const id = `camp-${Date.now()}`;
    const now = new Date().toISOString();
    const newCampaign: Campaign = {
      id,
      ...campaign,
      sentCount: campaign.status === "Completed" ? 450 : 0,
      deliveredCount: campaign.status === "Completed" ? 445 : 0,
      openedCount: campaign.status === "Completed" ? 420 : 0,
      clickedCount: campaign.status === "Completed" ? 180 : 0,
      failedCount: campaign.status === "Completed" ? 5 : 0,
      createdAt: now
    };

    
    await addDoc(collection(db, "campaigns"), newCampaign);
    return id;
  },

  async updateAutomation(id: string, updates: Partial<AutomationTrigger>) {
    const now = new Date().toISOString();
    
    await updateDoc(doc(db, "automations", id), { ...updates, updatedAt: now });
  },

  async seedCommunications() {
    

    const batch = writeBatch(db);
    // ... actual seeding logic for Firestore ...
    await batch.commit();
  }
};

export const conversationService = {
  subscribeToConversations(callback: (conversations: any[]) => void) {
    return onSnapshot(query(collection(db, "conversations"), orderBy("updatedAt", "desc")), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },
  subscribeToMessages(conversationId: string, callback: (messages: any[]) => void) {
    return onSnapshot(query(collection(db, "conversations", conversationId, "messages"), orderBy("createdAt", "asc")), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },
  async sendMessage(conversationId: string, phone: string, text: string) {
    // 1. Save message to Firestore first as sending
    const now = new Date().toISOString();
    const msgRef = await addDoc(collection(db, "conversations", conversationId, "messages"), {
      text,
      sender: 'agent',
      status: 'sending',
      createdAt: now
    });

    // 2. Update conversation last message
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: text,
      updatedAt: now,
      unreadCount: 0
    });

    try {
      // 3. Send via Gupshup
      await (await import('./gupshup')).gupshupService.sendText(phone, text);
      await updateDoc(msgRef, { status: 'sent' });
    } catch (error) {
      await updateDoc(msgRef, { status: 'failed' });
      throw error;
    }
  },
  async markAsRead(conversationId: string) {
    await updateDoc(doc(db, "conversations", conversationId), {
      unreadCount: 0
    });
  }
};
