import { useState, useEffect } from 'react';
import { 
  UserService, 
  SubscriptionService, 
  OrderService, 
  MealService, 
  WalletService, 
  NotificationService, 
  AddressService,
  RewardService
} from './services';
import { 
  User, 
  Subscription, 
  Order, 
  Meal, 
  MealSchedule, 
  Wallet, 
  Notification, 
  Address,
  RewardPoints
} from './collections';

export const useUser = (uid: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = UserService.subscribeUser(uid, (userData) => {
      setUser(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { user, loading };
};

export const useSubscription = (userId: string | undefined) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const unsubscribe = SubscriptionService.subscribeToUserSubscription(userId, (subs) => {
      const active = subs.find(s => s.status === 'active');
      setSubscription(active || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { subscription, loading };
};

export const useOrders = (userId: string | undefined) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await OrderService.getOrders(userId);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, loading };
};

export const useWallet = (userId: string | undefined) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setWallet(null);
      setLoading(false);
      return;
    }

    const unsubscribe = WalletService.subscribeToWallet(userId, (data) => {
      setWallet(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { wallet, loading };
};

export const useRewards = (userId: string | undefined) => {
  const [reward, setReward] = useState<RewardPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setReward(null);
      setLoading(false);
      return;
    }

    const unsubscribe = RewardService.subscribeToRewardPoints(userId, (data) => {
      setReward(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { reward, loading };
};

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const unsubscribe = NotificationService.subscribeToNotifications(userId, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading };
};

export const useAddresses = (userId: string | undefined) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    const unsubscribe = AddressService.subscribeToAddresses(userId, (data) => {
      setAddresses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { addresses, loading };
};
