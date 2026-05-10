import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ShoppingBag, Clock, DollarSign, Activity, PackageOpen, AlertTriangle } from 'lucide-react';
import { startOfDay } from 'date-fns';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Orders Listener
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Inventory Listener (bypassing rules by using menuItems collection)
    const qInv = query(collection(db, 'menuItems'));
    const unsubInv = onSnapshot(qInv, (snapshot) => {
      const allItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const invItems = allItems.filter(item => item.id.startsWith('inv_')).map(item => ({
        ...item,
        id: item.id.replace('inv_', '')
      }));
      setInventory(invItems);
    });

    return () => { unsubOrders(); unsubInv(); };
  }, []);

  const [chartData, setChartData] = useState<any[]>([]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    let todaysOrders = 0;
    let pendingOrders = 0;
    let revenueToday = 0;

    // Chart Data prep (Last 7 days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateKey: d.toDateString(),
        revenue: 0,
        count: 0
      };
    });

    orders.forEach(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      
      // Calculate Stats
      if (orderDate >= today) {
        todaysOrders++;
        if (order.status === 'completed') revenueToday += order.totalAmount;
      }
      if (order.status === 'pending') pendingOrders++;

      // Populate Chart
      if (order.status === 'completed') {
        const dayMatch = last7Days.find(d => d.dateKey === orderDate.toDateString());
        if (dayMatch) {
          dayMatch.revenue += order.totalAmount;
          dayMatch.count += 1;
        }
      }
    });

    setChartData(last7Days);

    return { todaysOrders, pendingOrders, revenueToday, totalOrders: orders.length };
  }, [orders]);

  const seedInventory = async () => {
    const batch = writeBatch(db);
    const items = [
      { id: 'cups', name: 'Plastic Cups (16oz)', quantity: 150, threshold: 50, unit: 'pcs', price: 0, category: 'original', description: 'inv', isAvailable: false },
      { id: 'straws', name: 'Straws', quantity: 300, threshold: 100, unit: 'pcs', price: 0, category: 'original', description: 'inv', isAvailable: false },
      { id: 'base_slush', name: 'Base Slush Mix', quantity: 20, threshold: 5, unit: 'Liters', price: 0, category: 'original', description: 'inv', isAvailable: false },
      { id: 'vodka', name: 'Vodka (750ml)', quantity: 6, threshold: 2, unit: 'Bottles', price: 0, category: 'original', description: 'inv', isAvailable: false },
      { id: 'tequila', name: 'Tequila (750ml)', quantity: 4, threshold: 2, unit: 'Bottles', price: 0, category: 'original', description: 'inv', isAvailable: false }
    ];
    items.forEach(item => {
      const { id, ...data } = item;
      batch.set(doc(db, 'menuItems', `inv_${id}`), { ...data, createdAt: serverTimestamp() });
    });
    await batch.commit();
  };

  if (loading) {
    return <div className="animate-pulse h-full w-full flex items-center justify-center text-white/50">Loading dashboard...</div>;
  }

  const statCards = [
    { name: "Today's Orders", value: stats.todaysOrders, icon: ShoppingBag, color: 'text-blue-400', desc: 'Orders placed today' },
    { name: "Pending", value: stats.pendingOrders, icon: Clock, color: 'text-brand-primary', desc: 'Awaiting confirmation' },
    { name: "Revenue Today", value: `GHC ${stats.revenueToday.toFixed(2)}`, icon: DollarSign, color: 'text-green-400', desc: 'Completed today' },
    { name: "Total Orders", value: stats.totalOrders, icon: Activity, color: 'text-purple-400', desc: 'All time count' },
  ];

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100); // minimum scale of 100

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-wider uppercase">Dashboard Overview</h1>
        <p className="text-white/60 mt-2">Welcome back. Here's what's happening at Slushify today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className={`w-16 h-16 ${stat.color}`} />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-white/50 uppercase tracking-widest">{stat.name}</p>
                <p className="mt-2 text-4xl font-display font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-xs text-white/40">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SALES CHART */}
      <div className="glass rounded-3xl border border-white/5 p-8 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] pointer-events-none" />
        <h3 className="font-display tracking-widest text-lg font-medium uppercase mb-8 flex justify-between items-center z-10">
          Revenue Overview
          <span className="text-xs text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">Last 7 Days</span>
        </h3>
        
        <div className="h-64 flex items-end justify-between gap-4 z-10">
          {chartData.map((day, idx) => {
            const heightPercent = `${Math.max((day.revenue / maxRevenue) * 100, 2)}%`;
            return (
              <div key={idx} className="flex-1 flex flex-col justify-end items-center group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-brand-primary mb-2 whitespace-nowrap">
                  GHC {day.revenue.toFixed(2)}
                </div>
                <div className="w-full max-w-[40px] bg-white/5 rounded-t-xl relative overflow-hidden flex items-end justify-center group-hover:bg-white/10 transition-colors">
                  <div 
                    className="w-full bg-gradient-to-t from-brand-primary/40 to-brand-primary rounded-t-xl transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(236,28,36,0.2)]"
                    style={{ height: heightPercent }}
                  />
                </div>
                <span className="text-xs text-white/40 mt-3 uppercase tracking-wider font-medium group-hover:text-white/80 transition-colors">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT ORDERS TABLE */}
        <div className="lg:col-span-2 glass rounded-3xl border border-white/5 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-display tracking-widest text-lg font-medium uppercase">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest">Order</th>
                  <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-display text-lg">#{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white/90">{order.customerName}</div>
                      <div className="text-xs text-white/50">{order.orderType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider
                        ${order.status === 'pending' ? 'bg-brand-primary/20 text-brand-primary' : 
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                          'bg-white/10 text-white/70'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-brand-accent">
                      GHC {order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-white/50">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INVENTORY WIDGET */}
        <div className="lg:col-span-1 glass rounded-3xl border border-white/5 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-display tracking-widest text-lg font-medium uppercase flex items-center gap-2">
              <PackageOpen className="w-5 h-5 text-brand-primary" /> Live Inventory
            </h3>
            {inventory.length === 0 && (
              <button onClick={seedInventory} className="text-xs bg-brand-primary hover:bg-brand-accent text-white px-3 py-1 rounded-full uppercase tracking-wider font-bold transition-colors">
                Initialize
              </button>
            )}
          </div>
          
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {inventory.length === 0 ? (
              <div className="text-center text-white/40 italic py-8">Click 'Initialize' to load stock tracking.</div>
            ) : (
              inventory.map(item => {
                const percentage = Math.min(100, Math.max(0, (item.quantity / (item.threshold * 3)) * 100));
                const isLowStock = item.quantity <= item.threshold;
                
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{item.name}</span>
                        {isLowStock && <AlertTriangle className="w-4 h-4 text-brand-primary animate-pulse" />}
                      </div>
                      <span className={`text-sm font-bold ${isLowStock ? 'text-brand-primary' : 'text-white/70'}`}>
                        {item.quantity.toFixed(1)} <span className="text-xs font-normal uppercase tracking-wider">{item.unit}</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isLowStock ? 'bg-brand-primary shadow-[0_0_10px_rgba(236,28,36,0.5)]' : 'bg-green-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
