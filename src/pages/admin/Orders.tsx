import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, serverTimestamp, writeBatch, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Phone, AlertCircle, CheckCircle2, ChevronRight, XCircle, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const previousOrdersLength = useRef(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // First high pitch ding
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1200, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);

      // Second higher pitch ding
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1600, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.4);

    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundEnabledRef.current = newState;
    if (newState) playNotificationSound(); // Play test sound
  };

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Check for new pending orders
      const currentPending = data.filter((o: any) => o.status === 'pending').length;
      if (currentPending > previousOrdersLength.current && currentPending > 0 && !loading) {
        if (soundEnabledRef.current) {
          playNotificationSound();
        }
      }
      previousOrdersLength.current = currentPending;

      setOrders(data);
      if (loading) setLoading(false);
    }, (error) => {
      console.error("Orders onSnapshot error:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, [loading]);

  const updateStatus = async (orderId: string, currentStatus: string, cancel: boolean = false) => {
    try {
      if (cancel) {
        await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled', updatedAt: serverTimestamp() });
        return;
      }
      const currentIndex = STATUSES.indexOf(currentStatus);
      if (currentIndex < STATUSES.length - 1) {
        const nextStatus = STATUSES[currentIndex + 1];
        
        if (nextStatus === 'completed') {
          const batch = writeBatch(db);
          batch.update(doc(db, 'orders', orderId), { status: nextStatus, updatedAt: serverTimestamp() });
          
          const order = orders.find(o => o.id === orderId);
          if (order && order.items) {
            const totalDrinks = order.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
            if (totalDrinks > 0) {
              batch.update(doc(db, 'menuItems', 'inv_cups'), { quantity: increment(-totalDrinks) });
              batch.update(doc(db, 'menuItems', 'inv_straws'), { quantity: increment(-totalDrinks) });
              batch.update(doc(db, 'menuItems', 'inv_base_slush'), { quantity: increment(-(totalDrinks * 0.5)) });
            }
          }
          await batch.commit();
        } else {
          await updateDoc(doc(db, 'orders', orderId), { status: nextStatus, updatedAt: serverTimestamp() });
        }
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center text-white/50">Loading live orders...</div>;
  }

  const columns = STATUSES.map(status => ({
    status,
    items: orders.filter(o => o.status === status)
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Live Order Board</h1>
          <p className="text-white/60 mt-1">Real-time updates. Move orders left to right.</p>
        </div>
        
        <button 
          onClick={toggleSound}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${soundEnabled ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/50 shadow-[0_0_15px_rgba(236,28,36,0.2)]' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          <span className="font-bold uppercase tracking-widest text-sm hidden sm:inline">{soundEnabled ? 'Audio On' : 'Audio Off'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full w-max min-w-full">
          {columns.map((col) => (
            <div key={col.status} className="w-80 flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex-shrink-0">
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <h2 className="font-display uppercase tracking-widest flex items-center justify-between">
                  {col.status}
                  <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full font-sans">
                    {col.items.length}
                  </span>
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                <AnimatePresence>
                  {col.items.map((order) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={order.id} 
                      className={`glass p-5 rounded-2xl border ${col.status === 'pending' ? 'border-brand-primary/50 shadow-[0_0_15px_rgba(236,28,36,0.2)]' : 'border-white/10'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-display text-2xl text-white">#{order.orderNumber}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm ${
                          order.orderType === 'event' ? 'bg-brand-accent/20 text-brand-accent' : 
                          order.orderType === 'delivery' ? 'bg-purple-500/20 text-purple-400' :
                          order.orderType === 'pickup' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-white/10 text-white'
                        }`}>
                          {order.orderType}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="font-medium">{order.customerName}</div>
                        <a href={`https://wa.me/${order.customerPhone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-brand-primary hover:text-white transition-colors mt-1">
                          <Phone className="w-3 h-3" /> {order.customerPhone}
                        </a>
                        {order.orderType === 'delivery' && order.deliveryAddress && (
                          <div className="text-xs text-white/50 mt-2 bg-white/5 p-2 rounded-lg border border-white/5 leading-relaxed">
                            <span className="font-bold uppercase tracking-wider text-[10px] block mb-1 text-white/40">Delivery Address</span>
                            {order.deliveryAddress}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 my-4 bg-black/20 p-3 rounded-xl border border-white/5">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-white/80"><span className="text-white/40">{item.quantity}x</span> {item.itemName}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm font-medium text-brand-accent">
                          GHC {order.totalAmount.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                          <Clock className="w-3 h-3" />
                          {order.createdAt?.toDate ? formatDistanceToNow(order.createdAt.toDate(), { addSuffix: true }) : ''}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        {col.status !== 'completed' && (
                          <>
                            <button 
                              onClick={() => updateStatus(order.id, col.status, true)}
                              className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 text-white/60"
                            >
                              <XCircle className="w-3 h-3" /> Cancel
                            </button>
                            <button 
                              onClick={() => updateStatus(order.id, col.status)}
                              className="py-2 px-3 bg-brand-primary hover:bg-brand-accent rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-colors flex items-center justify-center gap-1"
                            >
                              Next <ChevronRight className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {col.status === 'completed' && (
                          <div className="col-span-2 text-center text-xs text-green-400 font-bold uppercase tracking-wider flex justify-center items-center gap-1 py-1">
                            <CheckCircle2 className="w-4 h-4" /> Finished
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {col.items.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm italic pointer-events-none p-4 text-center">
                    No orders
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
