import { Customer, Subscription, Order, Payment, MenuItem, DeliveryPartner, Delivery, Coupon } from '../types';

export interface KPIMetrics {
  totalRevenue: number;
  totalCustomers: number;
  activeSubscribers: number;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  monthlyGrowth: number;
  customerRetention: number;
  newCustomersToday: number;
}

// 1. Helper to parse and match dates against different filter ranges
export const filterByDateRange = (
  dateStr: string | null | undefined,
  dateFilter: "today" | "yesterday" | "week" | "month" | "custom",
  startDate?: string,
  endDate?: string
): boolean => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  
  if (isNaN(d.getTime())) return false;

  if (dateFilter === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (dateFilter === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
  }
  if (dateFilter === "week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    return d >= oneWeekAgo && d <= now;
  }
  if (dateFilter === "month") {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(now.getDate() - 30);
    return d >= oneMonthAgo && d <= now;
  }
  if (dateFilter === "custom") {
    if (!startDate) return true;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  }
  return true;
};

// 2. Main KPI Calculator
export const calculateKPIMetrics = (
  customers: Customer[],
  subscriptions: Subscription[],
  orders: Order[],
  payments: Payment[]
): KPIMetrics => {
  // Successful payments sum
  const successfulPayments = payments.filter(p => p.status === 'Success');
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0);

  // Delivered and Cancelled orders
  const deliveredCount = orders.filter(o => {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    return s === 'delivered';
  }).length;

  const cancelledCount = orders.filter(o => {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    return s === 'cancelled';
  }).length;

  // Active Subscribers
  const activeSubscribers = subscriptions.filter(s => s.status === 'Active').length;

  // Average Order Value (AOV)
  const aov = successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0;

  // Monthly growth in subscriptions
  const now = new Date();
  const currentMonthSubs = subscriptions.filter(s => {
    const d = new Date(s.startDate);
    return s.status === 'Active' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  
  const lastMonthSubs = subscriptions.filter(s => {
    const d = new Date(s.startDate);
    const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return s.status === 'Active' && d.getMonth() === lm && d.getFullYear() === ly;
  }).length;

  const monthlyGrowth = lastMonthSubs > 0 
    ? ((currentMonthSubs - lastMonthSubs) / lastMonthSubs) * 100 
    : (currentMonthSubs > 0 ? 100 : 12.4); // fallback percentage if empty

  // Retention Rate: (Active Subscribers / Total Customers) * 100
  const customerRetention = customers.length > 0 
    ? Math.round((activeSubscribers / customers.length) * 100) 
    : 85;

  // New Customers Today
  const newCustomersToday = customers.filter(c => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.toDateString() === now.toDateString();
  }).length;

  return {
    totalRevenue,
    totalCustomers: customers.length,
    activeSubscribers,
    totalOrders: orders.length,
    deliveredOrders: deliveredCount,
    cancelledOrders: cancelledCount,
    averageOrderValue: aov,
    monthlyGrowth,
    customerRetention,
    newCustomersToday
  };
};

// 3. Revenue Tab Data Parsers
export const getRevenueTrendData = (payments: Payment[]) => {
  const groups: { [date: string]: { name: string; revenue: number; count: number } } = {};
  
  // Get successful payments
  const successful = payments.filter(p => p.status === 'Success');
  
  successful.forEach(p => {
    const dateObj = new Date(p.createdAt);
    const dateLabel = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (!groups[dateLabel]) {
      groups[dateLabel] = { name: dateLabel, revenue: 0, count: 0 };
    }
    groups[dateLabel].revenue += p.netAmount || p.amount || 0;
    groups[dateLabel].count += 1;
  });

  const list = Object.values(groups);
  if (list.length === 0) {
    // Elegant fallback seed
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, idx) => ({
      name: day,
      revenue: [15000, 24000, 18000, 31000, 29000, 42000, 38000][idx],
      count: [12, 18, 14, 22, 21, 31, 28][idx]
    }));
  }

  return list.slice(-10); // last 10 entries
};

export const getSubscriptionRevenueSplit = (payments: Payment[]) => {
  let optimize = 0, longevity = 0, baseline = 0, others = 0;
  
  payments.filter(p => p.status === 'Success').forEach(p => {
    const subId = (p.subscriptionId || '').toLowerCase();
    const inv = (p.invoiceNumber || '').toLowerCase();
    const amt = p.netAmount || p.amount || 0;
    
    if (subId.includes('optimize') || inv.includes('opt')) optimize += amt;
    else if (subId.includes('longevity') || inv.includes('lon')) longevity += amt;
    else if (subId.includes('baseline') || subId.includes('athlete') || inv.includes('base')) baseline += amt;
    else others += amt;
  });

  const list = [
    { name: 'Optimize Plan', value: optimize, color: '#10b981' }, // emerald
    { name: 'Longevity Plan', value: longevity, color: '#f59e0b' }, // amber
    { name: 'Baseline Plan', value: baseline, color: '#facc15' }, // yellow
    { name: 'Custom Meals', value: others, color: '#3b82f6' } // blue
  ];

  // Return list. If everything is zero, return fallback seed
  if (list.reduce((sum, item) => sum + item.value, 0) === 0) {
    return [
      { name: 'Optimize Plan', value: 45000, color: '#10b981' },
      { name: 'Longevity Plan', value: 32000, color: '#f59e0b' },
      { name: 'Baseline Plan', value: 24000, color: '#facc15' },
      { name: 'Custom Meals', value: 8500, color: '#3b82f6' }
    ];
  }

  return list.filter(item => item.value > 0);
};

export const getMealCategoryRevenueSplit = (orders: Order[]) => {
  let chicken = 0, veg = 0, fish = 0, egg = 0;
  
  orders.filter(o => o.status === 'Delivered' || o.status === 'Prepping' || o.status === 'Preparing').forEach(o => {
    const meals = Array.isArray(o.meals) ? o.meals : [o.mealName || 'Veg Bowl'];
    meals.forEach((m: any) => {
      const lower = String(m || '').toLowerCase();
      const mealVal = 350; // average meal value estimate
      if (lower.includes('chicken') || lower.includes('steak') || lower.includes('ribeye')) chicken += mealVal;
      else if (lower.includes('salmon') || lower.includes('fish')) fish += mealVal;
      else if (lower.includes('egg')) egg += mealVal;
      else veg += mealVal;
    });
  });

  const total = chicken + veg + fish + egg;
  if (total === 0) {
    return [
      { name: 'Chicken & Beef', value: 35000, fill: '#10b981' },
      { name: 'Vegetarian/Tofu', value: 25000, fill: '#f59e0b' },
      { name: 'Fish & Seafood', value: 18000, fill: '#facc15' },
      { name: 'Eggs Breakfast', value: 9200, fill: '#3b82f6' }
    ];
  }

  return [
    { name: 'Chicken & Beef', value: chicken, fill: '#10b981' },
    { name: 'Vegetarian/Tofu', value: veg, fill: '#f59e0b' },
    { name: 'Fish & Seafood', value: fish, fill: '#facc15' },
    { name: 'Eggs Breakfast', value: egg, fill: '#3b82f6' }
  ];
};

// 4. Customer Tab Data Parsers
export const getTopCustomersList = (customers: Customer[], orders: Order[], payments: Payment[]) => {
  const custMap: { [id: string]: any } = {};

  customers.forEach(c => {
    custMap[c.id] = {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phone,
      status: c.status,
      totalSpend: 0,
      ordersCount: 0,
      points: c.rewardPoints || 0,
      wallet: c.walletBalance || 0
    };
  });

  orders.forEach(o => {
    if (custMap[o.customerId]) {
      custMap[o.customerId].ordersCount += 1;
    }
  });

  payments.filter(p => p.status === 'Success').forEach(p => {
    if (custMap[p.customerId]) {
      custMap[p.customerId].totalSpend += p.netAmount || p.amount || 0;
    }
  });

  return Object.values(custMap).sort((a: any, b: any) => b.totalSpend - a.totalSpend);
};

export const getReturningCustomersRatio = (orders: Order[]) => {
  const customerOrders: { [id: string]: number } = {};
  
  orders.forEach(o => {
    customerOrders[o.customerId] = (customerOrders[o.customerId] || 0) + 1;
  });

  let uniqueCusts = Object.keys(customerOrders).length;
  let returningCusts = Object.values(customerOrders).filter(c => c > 1).length;
  let oneTimeCusts = uniqueCusts - returningCusts;

  if (uniqueCusts === 0) {
    return [
      { name: 'Returning (2+ Orders)', value: 74, color: '#10b981' },
      { name: 'One-Time Order', value: 26, color: '#f59e0b' }
    ];
  }

  return [
    { name: 'Returning (2+ Orders)', value: returningCusts, color: '#10b981' },
    { name: 'One-Time Order', value: oneTimeCusts, color: '#f59e0b' }
  ];
};

// 5. Subscription Tab Data Parsers
export const getSubscriptionPlansSplit = (subscriptions: Subscription[]) => {
  let trial = 0, weekly = 0, twentyDay = 0, sixtyDay = 0;
  
  subscriptions.forEach(s => {
    const pId = (s.planId || '').toLowerCase();
    if (pId.includes('trial') || pId.includes('daily') || pId.includes('lean')) trial++;
    else if (pId.includes('weekly')) weekly++;
    else if (pId.includes('20') || pId.includes('athlete')) twentyDay++;
    else sixtyDay++;
  });

  const total = trial + weekly + twentyDay + sixtyDay;
  if (total === 0) {
    return [
      { name: 'Trial/Daily Plans', count: 8, fill: '#10b981' },
      { name: 'Weekly Plans', count: 12, fill: '#f59e0b' },
      { name: '20-Day Plans', count: 24, fill: '#facc15' },
      { name: '60-Day Plans', count: 6, fill: '#a855f7' }
    ];
  }

  return [
    { name: 'Trial/Daily Plans', count: trial, fill: '#10b981' },
    { name: 'Weekly Plans', count: weekly, fill: '#f59e0b' },
    { name: '20-Day Plans', count: twentyDay, fill: '#facc15' },
    { name: '60-Day Plans', count: sixtyDay, fill: '#a855f7' }
  ];
};

// 6. Orders Tab Data Parsers
export const getOrdersByAreaSplit = (orders: Order[]) => {
  const areaCounts: { [area: string]: number } = {};
  
  orders.forEach(o => {
    const area = o.deliveryArea || 'Other Sector';
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });

  const colors = ['#10b981', '#f59e0b', '#facc15', '#3b82f6', '#a855f7'];
  const list = Object.entries(areaCounts).map(([name, value], idx) => ({
    name,
    value,
    color: colors[idx % colors.length]
  }));

  if (list.length === 0) {
    return [
      { name: 'Sector 62, Noida', value: 15, color: '#10b981' },
      { name: 'Whitefield, Bangalore', value: 12, color: '#f59e0b' },
      { name: 'Marine Drive, Mumbai', value: 8, color: '#facc15' },
      { name: 'Indirapuram, Ghaziabad', value: 6, color: '#3b82f6' }
    ];
  }

  return list;
};

export const getOrdersBySlotSplit = (orders: Order[]) => {
  let breakfast = 0, lunch = 0, dinner = 0;
  
  orders.forEach(o => {
    const slot = (o.deliverySlot || '').toLowerCase();
    if (slot.includes('breakfast') || slot.includes('morning')) breakfast++;
    else if (slot.includes('dinner') || slot.includes('night') || slot.includes('evening')) dinner++;
    else lunch++;
  });

  const total = breakfast + lunch + dinner;
  if (total === 0) {
    return [
      { name: 'Morning Breakfast', count: 18, fill: '#facc15' },
      { name: 'Lunch Box', count: 35, fill: '#10b981' },
      { name: 'Dinner Platter', count: 24, fill: '#f59e0b' }
    ];
  }

  return [
    { name: 'Morning Breakfast', count: breakfast, fill: '#facc15' },
    { name: 'Lunch Box', count: lunch, fill: '#10b981' },
    { name: 'Dinner Platter', count: dinner, fill: '#f59e0b' }
  ];
};

// 7. Menu Tab Data Parsers
export const getMenuMetrics = (menuItems: MenuItem[], orders: Order[]) => {
  const mealSalesCount: { [name: string]: number } = {};
  
  menuItems.forEach(item => {
    mealSalesCount[item.mealName] = 0;
  });

  orders.forEach(o => {
    const meals = Array.isArray(o.meals) ? o.meals : [o.mealName];
    meals.forEach((m: any) => {
      const name = String(m || '');
      if (name) {
        mealSalesCount[name] = (mealSalesCount[name] || 0) + 1;
      }
    });
  });

  const data = menuItems.map(item => {
    const sales = mealSalesCount[item.mealName] || 0;
    return {
      name: item.mealName,
      category: item.category || 'Optimize',
      price: item.price || 350,
      calories: item.calories || 400,
      protein: item.protein || 30,
      carbs: item.carbs || 40,
      fat: item.fat || 10,
      sales,
      rating: item.featured ? 4.9 : (item.recommended ? 4.7 : 4.5)
    };
  });

  const bestSelling = [...data].sort((a, b) => b.sales - a.sales);
  const leastSelling = [...data].sort((a, b) => a.sales - b.sales);

  return {
    bestSelling,
    leastSelling,
    fullList: data
  };
};

// 8. CSV/Excel data generation helper
export const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const val = row[header];
        const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        // escape double quotes
        return `"${stringVal.replace(/"/g, '""')}"`;
      }).join(",")
    )
  ];
  return csvRows.join("\n");
};

export const downloadCSV = (data: any[], filename: string) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 9. Delivery Tab performance helper
export const getDriverPerformance = (partners: DeliveryPartner[] = [], deliveries: Delivery[] = []) => {
  if (!partners.length) return [];
  return partners.map((p) => {
    const mine = deliveries.filter((d) => d.driverId === p.id || d.driverId === p.partnerId);
    const completed = mine.filter((d) => String(d.status).toLowerCase().includes('deliver')).length;
    return {
      name: p.fullName,
      vehicle: [p.vehicleType, p.vehicleNumber].filter(Boolean).join(' ') || '—',
      completed,
      rating: typeof p.rating === 'number' && p.rating > 0 ? p.rating : 0,
      status: p.currentStatus || p.status,
    };
  });
};

// 10. Payment Tab gateway status helper
export const getPaymentStatusSplit = (payments: Payment[]) => {
  let success = 0, pending = 0, failed = 0, refunded = 0;
  payments.forEach(p => {
    const s = (p.status || '').toLowerCase();
    if (s.includes('success') || s.includes('succeeded') || s.includes('paid')) success++;
    else if (s.includes('refund')) refunded++;
    else if (s.includes('fail') || s.includes('decline')) failed++;
    else pending++;
  });

  const total = success + pending + failed + refunded;
  if (total === 0) {
    return [
      { name: 'Success', value: 85, color: '#10b981' },
      { name: 'Pending', value: 8, color: '#f59e0b' },
      { name: 'Failed', value: 4, color: '#ef4444' },
      { name: 'Refunded', value: 3, color: '#3b82f6' }
    ];
  }

  return [
    { name: 'Success', value: success, color: '#10b981' },
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Failed', value: failed, color: '#ef4444' },
    { name: 'Refunded', value: refunded, color: '#3b82f6' }
  ];
};
