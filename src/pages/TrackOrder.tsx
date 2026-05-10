import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, Package, Coffee, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('id') || '';
  
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [isSearching, setIsSearching] = useState(!!initialOrderNumber);
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSearching || !orderNumberInput) return;

    setError('');
    
    // Convert input to number since orderNumber is stored as a number in DB
    const num = parseInt(orderNumberInput, 10);
    if (isNaN(num)) {
      setError('Please enter a valid order number');
      setIsSearching(false);
      return;
    }

    const q = query(collection(db, 'orders'), where('orderNumber', '==', num));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setError('Order not found. Please check your number.');
        setOrder(null);
        setIsSearching(false);
      } else {
        const orderData = snapshot.docs[0].data();
        setOrder({ id: snapshot.docs[0].id, ...orderData });
        setError('');
      }
    }, (err) => {
      console.error(err);
      setError('Failed to fetch order status.');
      setIsSearching(false);
    });

    return () => unsubscribe();
  }, [isSearching, orderNumberInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setIsSearching(true);
    }
  };

  const getStatusIndex = (status: string) => {
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    return statuses.indexOf(status) !== -1 ? statuses.indexOf(status) : 0;
  };

  const currentStep = order ? getStatusIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-body">
      <header className="p-6 border-b border-white/5 relative flex-shrink-0 z-10 glass-nav flex items-center justify-between">
        <Link to="/" className="text-white/50 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
        <Link to="/" className="font-display text-2xl font-bold tracking-widest text-brand-primary uppercase">SLUSHIFY</Link>
        <div className="w-16" /> {/* Spacer */}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
        <div className="w-full max-w-md space-y-8 relative">
          
          <div className="text-center space-y-2">
            <h1 className="font-display text-4xl uppercase tracking-widest text-white">Track Order</h1>
            <p className="text-white/50 text-sm">Enter your 4-digit order number below.</p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={orderNumberInput}
              onChange={(e) => { setOrderNumberInput(e.target.value); setIsSearching(false); setOrder(null); }}
              placeholder="e.g. 4092"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-xl font-display tracking-widest placeholder:text-white/20 focus:border-brand-primary focus:bg-white/10 outline-none transition-all text-center"
            />
            <button type="submit" className="absolute right-3 top-3 bottom-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-6 flex items-center justify-center transition-all">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 text-red-400 p-4 rounded-xl text-center text-sm border border-red-500/20">
              {error}
            </motion.div>
          )}

          {order && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[50px] pointer-events-none" />
              
              <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Order For</p>
                  <p className="font-bold text-white text-lg">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Type</p>
                  <p className="font-bold text-brand-primary uppercase text-sm">{order.orderType}</p>
                </div>
              </div>

              {/* TRACKING VISUAL */}
              <div className="relative mb-8">
                <div className="absolute top-5 left-6 right-6 h-1 bg-white/10 rounded-full" />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.min(currentStep, 3) / 3) * 100}%` }}
                  className="absolute top-5 left-6 h-1 bg-brand-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(236,28,36,0.5)]" 
                />

                <div className="flex justify-between relative z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${currentStep >= 0 ? 'bg-brand-primary text-white shadow-lg' : 'bg-brand-dark border-2 border-white/10 text-white/20'}`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${currentStep >= 0 ? 'text-white' : 'text-white/20'}`}>Received</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${currentStep >= 2 ? 'bg-brand-primary text-white shadow-lg' : 'bg-brand-dark border-2 border-white/10 text-white/20'}`}>
                      <Coffee className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${currentStep >= 2 ? 'text-white' : 'text-white/20'}`}>Mixing</span>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${currentStep >= 3 ? 'bg-brand-primary text-white shadow-lg' : 'bg-brand-dark border-2 border-white/10 text-white/20'}`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${currentStep >= 3 ? 'text-white' : 'text-white/20'}`}>Ready</span>
                  </div>
                </div>
              </div>

              {/* CURRENT STATUS MESSAGE */}
              <div className="bg-black/40 rounded-2xl p-6 text-center border border-white/5">
                {currentStep === 0 && <><p className="font-display text-xl uppercase tracking-widest text-white mb-2">Order Received</p><p className="text-sm text-white/50">We've got your order and are reviewing it now.</p></>}
                {currentStep === 1 && <><p className="font-display text-xl uppercase tracking-widest text-white mb-2">Order Confirmed</p><p className="text-sm text-white/50">Your order is confirmed and will be mixed shortly.</p></>}
                {currentStep === 2 && <><p className="font-display text-xl uppercase tracking-widest text-brand-primary mb-2 animate-pulse">Mixing Now!</p><p className="text-sm text-white/50">Our bartenders are currently crafting your drinks.</p></>}
                {currentStep >= 3 && <><p className="font-display text-xl uppercase tracking-widest text-green-400 mb-2">Order Ready!</p><p className="text-sm text-white/50">{order.orderType === 'pickup' ? 'Come pick it up at the bar.' : 'Our rider is on the way.'}</p></>}
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
