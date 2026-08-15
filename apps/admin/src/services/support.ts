import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc, 
  getDoc,
  writeBatch,
  onSnapshot,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SupportTicket, TicketReply, SupportAgent, KnowledgeBaseItem } from '../types';

// Toggle for UI Stabilization phase

// Local state for mock data
let localTickets: SupportTicket[] = [
  {
    id: "tkt-1",
    ticketId: "TKT-761245",
    customerId: "cust-1",
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    customerEmail: "rahul@gmail.com",
    subject: "Urgent: Change evening delivery address",
    category: "Delivery",
    priority: "High",
    status: "In Progress",
    assignedAgentId: "agent-1",
    assignedAgentName: "Rahul Sharma",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastReplyMessage: "I have logged your request.",
    lastReplySender: "Rahul Sharma"
  }
];
let localReplies: TicketReply[] = [];

export const supportService = {
  // Real-time queries can be directly set up in the React components, 
  // but these helpers provide standard static fetching if needed.
  async getRecentTickets(count = 100): Promise<SupportTicket[]> {
        const q = query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
  },

  subscribeToTickets(callback: (tickets: SupportTicket[]) => void): () => void {
    
    const q = query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot: any) => {
      const ticketList = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as SupportTicket));
      callback(ticketList);
    });
  },

  subscribeToAgents(callback: (agents: SupportAgent[]) => void): () => void {
    
    const q = query(collection(db, 'supportAgents'), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot: any) => {
      const agentList = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as SupportAgent));
      callback(agentList);
    });
  },

  subscribeToKB(callback: (kb: KnowledgeBaseItem[]) => void): () => void {
    
    const q = query(collection(db, 'knowledgeBase'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot: any) => {
      const kbList = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as KnowledgeBaseItem));
      callback(kbList);
    });
  },

  subscribeToReplies(ticketId: string, callback: (replies: TicketReply[]) => void): () => void {
    
    const repliesQuery = query(
      collection(db, 'ticketReplies'),
      where('ticketId', '==', ticketId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(repliesQuery, (snapshot: any) => {
      const replyList = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as TicketReply));
      callback(replyList);
    });
  },

  async addTicket(ticket: Omit<SupportTicket, 'id' | 'ticketId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = false ? `tkt-${Date.now()}` : doc(collection(db, 'supportTickets')).id;
    const now = new Date().toISOString();
    
    const newTicket: SupportTicket = {
      id,
      ticketId: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: now,
      updatedAt: now,
      ...ticket
    } as SupportTicket;

     
      await setDoc(doc(db, 'supportTickets', id), newTicket);
    

    // Create automatic initial reply/system note
    await this.addTicketReply(
      id,
      'system',
      'System Automator',
      'system',
      `Ticket created and categorized under "${ticket.category}". Priority set to "${ticket.priority}".`
    );

    return id;
  },
  
  async updateTicketStatus(id: string, status: SupportTicket['status']): Promise<void> {
    const now = new Date().toISOString();
     
      await updateDoc(doc(db, 'supportTickets', id), {
        status,
        updatedAt: now
      });
    

    // Log a system message in the replies timeline
    await this.addTicketReply(
      id,
      'system',
      'System Automator',
      'system',
      `Ticket status changed to "${status}".`
    );
  },

  async addTicketReply(
    ticketId: string, 
    senderId: string, 
    senderName: string, 
    senderRole: TicketReply['senderRole'], 
    message: string,
    attachments?: string[]
  ): Promise<string> {
    const replyId = false ? `rep-${Date.now()}` : doc(collection(db, 'ticketReplies')).id;
    const now = new Date().toISOString();

    const reply: TicketReply = {
      id: replyId,
      replyId,
      ticketId,
      senderId,
      senderName,
      senderRole,
      message,
      createdAt: now,
      attachments: attachments || []
    };

     
      await setDoc(doc(db, 'ticketReplies', replyId), reply);
      // Update parent ticket with last reply details
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        lastReplyMessage: message,
        lastReplySender: senderName,
        updatedAt: now
      });
    

    return replyId;
  },

  async assignTicket(
    ticketId: string, 
    agentId: string, 
    agentName: string, 
    priority: SupportTicket['priority'], 
    dueDate?: string
  ): Promise<void> {
    const now = new Date().toISOString();
     
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        assignedAgentId: agentId,
        assignedAgentName: agentName,
        priority,
        status: 'In Progress',
        dueDate: dueDate || null,
        updatedAt: now
      });

      // Update agent's active ticket count
      if (agentId !== 'unassigned') {
        const agentRef = doc(db, 'supportAgents', agentId);
        const agentDoc = await getDoc(agentRef);
        if (agentDoc.exists()) {
          const currentCount = agentDoc.data().assignedTickets || 0;
          await updateDoc(agentRef, {
            assignedTickets: currentCount + 1
          });
        }
      }
    

    // Add reply message as a log
    await this.addTicketReply(
      ticketId,
      'system',
      'System Automator',
      'system',
      `Ticket assigned to Agent ${agentName}. Priority: "${priority}". Due Date: ${dueDate || 'Not set'}.`
    );
  },

  async addInternalNote(ticketId: string, notes: string): Promise<void> {
    const now = new Date().toISOString();
     
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        notes,
        updatedAt: now
      });
    

    // System event reply log
    await this.addTicketReply(
      ticketId,
      'system',
      'System Automator',
      'system',
      `Internal note updated.`
    );
  },

  async addSatisfactionRating(ticketId: string, rating: number): Promise<void> {
    const now = new Date().toISOString();
     
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        satisfactionRating: rating,
        status: 'Closed',
        updatedAt: now
      });
    

    await this.addTicketReply(
      ticketId,
      'system',
      'System Automator',
      'system',
      `Customer submitted CSAT score: ${rating}/5. Ticket marked as Closed.`
    );
  },

  async getAgents(): Promise<SupportAgent[]> {
        const q = query(collection(db, 'supportAgents'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportAgent));
  },

  async addAgent(agent: Omit<SupportAgent, 'id' | 'assignedTickets' | 'rating'>): Promise<string> {
    const id = false ? `agt-${Date.now()}` : doc(collection(db, 'supportAgents')).id;
    const newAgent: SupportAgent = {
      id,
      assignedTickets: 0,
      rating: 4.8,
      ...agent
    };
     
      await setDoc(doc(db, 'supportAgents', id), newAgent);
    
    return id;
  },

  async getKnowledgeBase(): Promise<KnowledgeBaseItem[]> {
        const q = query(collection(db, 'knowledgeBase'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeBaseItem));
  },

  async addKnowledgeBaseItem(item: Omit<KnowledgeBaseItem, 'id' | 'createdAt'>): Promise<string> {
    const id = false ? `kb-${Date.now()}` : doc(collection(db, 'knowledgeBase')).id;
    const newItem: KnowledgeBaseItem = {
      id,
      createdAt: new Date().toISOString(),
      ...item
    };
     
      await setDoc(doc(db, 'knowledgeBase', id), newItem);
    
    return id;
  },

  async ensureSupportSeeded(): Promise<void> {
    return;
  },
};
