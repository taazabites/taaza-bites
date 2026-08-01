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
    // Check if tickets are already seeded
    const q = query(collection(db, 'supportTickets'), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return; // Already seeded
    }

    console.log('Seeding initial Support Agents, Tickets, Replies, and Knowledge Base items...');
    
    // 1. Seed Support Agents
    const agentsToSeed = [
      { name: 'Rahul Sharma', email: 'rahul.s@taazabites.in', role: 'Support Specialist', status: 'Active' as const, assignedTickets: 2, rating: 4.9 },
      { name: 'Priya Iyer', email: 'priya.i@taazabites.in', role: 'Billing Support', status: 'Active' as const, assignedTickets: 3, rating: 4.7 },
      { name: 'Anil Mehta', email: 'anil.m@taazabites.in', role: 'Delivery Lead', status: 'Busy' as const, assignedTickets: 5, rating: 4.5 },
      { name: 'Sneha Rao', email: 'sneha.r@taazabites.in', role: 'Nutrition Liaison', status: 'Offline' as const, assignedTickets: 0, rating: 4.8 }
    ];

    const agentIds: string[] = [];
    for (const agent of agentsToSeed) {
      const agentRef = doc(collection(db, 'supportAgents'));
      await setDoc(agentRef, {
        id: agentRef.id,
        agentId: `AGT-${Math.floor(100 + Math.random() * 900)}`,
        ...agent
      });
      agentIds.push(agentRef.id);
    }

    // 2. Seed Knowledge Base Items (FAQs, Policies, Standard Replies)
    const kbItemsToSeed: Omit<KnowledgeBaseItem, 'id'>[] = [
      {
        itemId: 'KB-FAQ-101',
        category: 'Subscription',
        title: 'How do I temporarily pause my meals?',
        content: 'You can pause your subscription at any time via the customer dashboard or support line. Go to your active subscription panel, select "Pause Subscription", and choose your start and end dates. Pauses must be submitted by 6 PM for the next day\'s meal delivery.',
        type: 'FAQ',
        createdAt: new Date().toISOString()
      },
      {
        itemId: 'KB-FAQ-102',
        category: 'Delivery',
        title: 'What are the delivery slots available?',
        content: 'Taaza Bites offers three convenient delivery slots in serviced areas:\n- morning: 7:00 AM - 9:00 AM (Breakfast & Lunch)\n- Afternoon: 12:00 PM - 2:00 PM (Lunch Only)\n- Evening: 6:00 PM - 8:30 PM (Dinner Only)\nYou can update your slot inside your active subscription menu.',
        type: 'FAQ',
        createdAt: new Date().toISOString()
      },
      {
        itemId: 'KB-POL-201',
        category: 'Refund',
        title: 'Refund & Credit Policy',
        content: 'Refunds for cancelled meal subscriptions are computed pro-rata. Unused days are credited back into the Customer Wallet immediately as Wallet Balance. Direct bank account refunds take 5-7 business days via Razorpay.',
        type: 'Policy',
        createdAt: new Date().toISOString()
      },
      {
        itemId: 'KB-REP-301',
        category: 'General Inquiry',
        title: 'Standard Greeting & Account Lookup',
        content: 'Hello, thank you for contacting Taaza Bites Support! My name is {agent_name}. I would be glad to assist you today. May I please have your registered email address or phone number to retrieve your active plan?',
        type: 'Standard Reply',
        createdAt: new Date().toISOString()
      },
      {
        itemId: 'KB-REP-302',
        category: 'Meal Quality',
        title: 'Standard Apology for Spillage or Quality issues',
        content: 'We are incredibly sorry that your lunch packaging did not meet our high-standard fresh delivery guidelines. We strive to deliver pristine, piping-hot meals. I have processed a full meal credit back to your Wallet immediately so you can order a replacement, and flagged this to our dispatch team.',
        type: 'Standard Reply',
        createdAt: new Date().toISOString()
      }
    ];

    for (const kbItem of kbItemsToSeed) {
      const kbRef = doc(collection(db, 'knowledgeBase'));
      await setDoc(kbRef, {
        id: kbRef.id,
        ...kbItem
      });
    }

    // 3. Seed Support Tickets & Replies
    const ticketsToSeed = [
      {
        ticketId: 'TKT-761245',
        customerId: 'cust_sub_101',
        customerName: 'Karan Malhotra',
        customerPhone: '+91 98765 43210',
        customerEmail: 'karan@gmail.com',
        subject: 'Urgent: Change evening delivery address',
        category: 'Delivery' as const,
        priority: 'High' as const,
        status: 'In Progress' as const,
        assignedAgentId: agentIds[0],
        assignedAgentName: 'Rahul Sharma',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        lastReplyMessage: 'I have logged your request. I am contacting the dispatch lead to coordinate the location adjustment for today\'s evening route.',
        lastReplySender: 'Rahul Sharma',
        notes: 'Customer lives near Tech Park and wants delivery switched to office lobby.'
      },
      {
        ticketId: 'TKT-192837',
        customerId: 'cust_sub_102',
        customerName: 'Aishwarya Sen',
        customerPhone: '+91 87654 32109',
        customerEmail: 'aishwarya@yahoo.com',
        subject: 'Double charge detected in credit card statement',
        category: 'Payment' as const,
        priority: 'Critical' as const,
        status: 'Open' as const,
        lastReplyMessage: 'Help, I see two debit receipts from Razorpay on July 9th but only one active subscription registered in my menu!',
        lastReplySender: 'Aishwarya Sen',
        notes: 'Verify transaction ledger in Razorpay dashboard. Might need a quick refund processing.'
      },
      {
        ticketId: 'TKT-948201',
        customerId: 'cust_sub_103',
        customerName: 'Vikram Grover',
        customerPhone: '+91 76543 21098',
        customerEmail: 'vikram.g@outlook.com',
        subject: 'Request nutritionist callback to swap allergens',
        category: 'Meal Quality' as const,
        priority: 'Medium' as const,
        status: 'Pending' as const,
        assignedAgentId: agentIds[2],
        assignedAgentName: 'Anil Mehta',
        lastReplyMessage: 'Hi Vikram, I have shared your allergic list with Sneha Rao. She will call you shortly today.',
        lastReplySender: 'Anil Mehta'
      },
      {
        ticketId: 'TKT-441209',
        customerId: 'cust_sub_104',
        customerName: 'Meera Nair',
        customerPhone: '+91 95432 10987',
        customerEmail: 'meera.nair@gmail.com',
        subject: 'Inquiry on high-protein vegetarian keto plans',
        category: 'General Inquiry' as const,
        priority: 'Low' as const,
        status: 'Resolved' as const,
        lastReplyMessage: 'Awesome, the high-protein veg menu looks incredibly diverse! Thanks for sharing the detailed nutrition list.',
        lastReplySender: 'Meera Nair',
        satisfactionRating: 5
      }
    ];

    for (const t of ticketsToSeed) {
      const ticketRef = doc(collection(db, 'supportTickets'));
      const id = ticketRef.id;
      const now = new Date(Date.now() - Math.random() * 5 * 86400000).toISOString();
      
      const newTicket = {
        id,
        createdAt: now,
        updatedAt: now,
        ...t
      };

      await setDoc(ticketRef, newTicket);

      // Seed Conversation Replies for each ticket
      if (t.ticketId === 'TKT-192837') {
        // Double charge ticket replies
        await this.addTicketReply(id, 'customer', 'Aishwarya Sen', 'customer', 'Help, I see two debit receipts from Razorpay on July 9th but only one active subscription registered in my menu!');
      } else if (t.ticketId === 'TKT-761245') {
        // Change address replies
        await this.addTicketReply(id, 'customer', 'Karan Malhotra', 'customer', 'Hi, I need to swap my delivery address for dinner today. Can I deliver it to my office address instead?');
        await this.addTicketReply(id, agentIds[0], 'Rahul Sharma', 'agent', 'Hello Karan, sure! I would be glad to help. Please share your office pincode and lobby address details.');
        await this.addTicketReply(id, 'customer', 'Karan Malhotra', 'customer', 'Great, it is Sector 5, Block C, Outer Ring Road, Bengaluru (Pincode: 560103). Deliver to reception.');
        await this.addTicketReply(id, agentIds[0], 'Rahul Sharma', 'agent', 'I have logged your request. I am contacting the dispatch lead to coordinate the location adjustment for today\'s evening route.');
      } else if (t.ticketId === 'TKT-948201') {
        // Swap allergens replies
        await this.addTicketReply(id, 'customer', 'Vikram Grover', 'customer', 'Can I swap peanuts with almonds in my keto plan? I developed mild allergies.');
        await this.addTicketReply(id, agentIds[2], 'Anil Mehta', 'agent', 'Hi Vikram, I have shared your allergic list with Sneha Rao. She will call you shortly today.');
      } else if (t.ticketId === 'TKT-441209') {
        // Inquiries replies
        await this.addTicketReply(id, 'customer', 'Meera Nair', 'customer', 'Hi, do you have customized meals for vegetarian keto diets with high protein requirement?');
        await this.addTicketReply(id, 'system', 'System Automator', 'system', 'Standard Plan guide sent automatically.');
        await this.addTicketReply(id, 'customer', 'Meera Nair', 'customer', 'Awesome, the high-protein veg menu looks incredibly diverse! Thanks for sharing the detailed nutrition list.');
      }
    }

    console.log('Successfully completed support ticketing databases seeding!');
  }
};
