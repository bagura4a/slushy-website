import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, getDocs, doc, writeBatch, serverTimestamp, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Store, Truck, ArrowRight, ArrowLeft, Plus, Minus, CheckCircle2, ShoppingBag, X, Star, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

type Modifier = { name: string; price: number };
type CartItem = {
  cartItemId: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: Modifier[];
};

export default function Order() {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<'pickup'|'delivery' | null>(null);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', deliveryAddress: '' });
  
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'cocktail'|'original'|'fruity'>('cocktail');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'number' | 'processing' | 'success'>('idle');
  const [momoNumber, setMomoNumber] = useState('');

  useEffect(() => {
    async function loadMenu() {
      try {
        const q = query(collection(db, 'menuItems'), where('isAvailable', '==', true));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setMenu(fetchedItems.filter(item => !item.id.startsWith('inv_')));
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        console.error("Failed to load menu", e);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const DELIVERY_FEE = 15.00;

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const modTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
      return total + ((item.basePrice + modTotal) * item.quantity);
    }, 0);
  }, [cart]);

  const totalAmount = orderType === 'delivery' ? subtotal + DELIVERY_FEE : subtotal;
  
  const totalItems = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const cartItems = useMemo(() => {
    return cart.map((item) => {
      const modTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
      return {
        menuItemId: item.menuItemId,
        itemName: item.name + (item.modifiers.length > 0 ? ` (${item.modifiers.map(m=>m.name).join(', ')})` : ''),
        quantity: item.quantity,
        unitPrice: item.basePrice + modTotal,
        subtotal: (item.basePrice + modTotal) * item.quantity,
      };
    });
  }, [cart]);

  const placeOrder = async () => {
    if (!orderType || !customer.name || !customer.phone || totalItems === 0) return;
    setPaymentStep('number');
  };

  const processPayment = () => {
    if (momoNumber.length < 9) return;
    setPaymentStep('processing');
    
    // Simulate Mobile Money Prompt Delay (3 seconds)
    setTimeout(() => {
      setPaymentStep('success');
      
      // Save order after 1 second of showing success message
      setTimeout(() => {
        finalizeOrder();
      }, 1000);
    }, 3000);
  };

  const finalizeOrder = async () => {
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      const customerRef = doc(collection(db, 'customers'));
      batch.set(customerRef, {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        createdAt: serverTimestamp()
      });

      const orderRef = doc(collection(db, 'orders'));
      const generatedOrderNumber = Math.floor(1000 + Math.random() * 9000); // Simple 4-digit ID
      setOrderNumber(generatedOrderNumber);
      
      const orderData: any = {
        orderNumber: generatedOrderNumber,
        customerId: customerRef.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        orderType,
        status: 'pending',
        totalAmount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        items: cartItems
      };
      
      if (orderType === 'delivery') {
        orderData.deliveryAddress = customer.deliveryAddress;
      }

      batch.set(orderRef, orderData);
      
      await batch.commit();
      setIsCartOpen(false);
      setPaymentStep('idle');
      setStep(5); // Confirmation
    } catch (e) {
      console.error(e);
      alert('There was a problem placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToCart = () => {
    if (!selectedItem) return;
    
    // Check if same item with same modifiers exists
    const existingIndex = cart.findIndex(c => 
      c.menuItemId === selectedItem.id && 
      JSON.stringify(c.modifiers.sort()) === JSON.stringify(selectedModifiers.sort())
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += itemQuantity;
      setCart(newCart);
    } else {
      setCart([...cart, {
        cartItemId: Math.random().toString(36).substring(7),
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        basePrice: selectedItem.price,
        quantity: itemQuantity,
        modifiers: selectedModifiers
      }]);
    }
    
    setSelectedItem(null);
    setSelectedModifiers([]);
    setItemQuantity(1);
    setIsCartOpen(true);
  };

  const updateCartItemQty = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const getDefaultImage = (name: string) => {
    const lowerName = name.toLowerCase();
    
    // Blue Drinks
    if (lowerName.includes('blue')) return '/images/slushy_original.png';
    
    // Purple / Dark Drinks
    if (lowerName.includes('grape') || lowerName.includes('illusion')) return '/images/slushy_purple.png';
    
    // Pink / Light Red Drinks
    if (lowerName.includes('pink') || lowerName.includes('watermelon')) return '/images/slushy_pink.png';
    
    // Red / Strawberry Drinks
    if (lowerName.includes('strawberry') || lowerName.includes('red') || lowerName.includes('sex') || lowerName.includes('margarita')) return '/images/slushy_cocktail.png';
    
    // Yellow / Orange / Tropical Drinks
    if (lowerName.includes('mango') || lowerName.includes('pineapple') || lowerName.includes('passion') || lowerName.includes('mimosa') || lowerName.includes('pornstar') || lowerName.includes('lemon') || lowerName.includes('pina')) return '/images/slushy_fruity.png';

    // Fallback based on hash if no keywords match
    const images = ['/images/slushy_cocktail.png', '/images/slushy_original.png', '/images/slushy_fruity.png', '/images/slushy_purple.png', '/images/slushy_pink.png'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return images[hash % images.length];
  };

  const getDefaultModifiers = (category: string) => {
    if (category === 'cocktail') return [{name: 'Make it a double', price: 20}, {name: 'Virgin (No Alcohol)', price: 0}];
    if (category === 'original') return [{name: 'Add Shot of Vodka', price: 20}, {name: 'Add Shot of Tequila', price: 20}];
    return [{name: 'Add Tapioca Pearls', price: 10}, {name: 'Add Mint', price: 5}];
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-body">
      {/* HEADER */}
      <header className="p-6 border-b border-white/5 relative flex-shrink-0 z-10 glass-nav flex justify-between items-center">
        <Link to="/" className="font-display text-3xl font-bold tracking-widest text-brand-primary uppercase transition-transform hover:scale-105">SLUSHIFY</Link>
        {step < 4 && (
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <ShoppingBag className="w-6 h-6 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        )}
      </header>

      <div className="flex-1 overflow-auto relative">
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
          <AnimatePresence mode="wait">

            {/* STEP 1: MENU */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex p-1 bg-white/5 rounded-2xl w-full mb-8 max-w-xl mx-auto">
                  {['cocktail', 'original', 'fruity'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 text-center rounded-xl font-bold uppercase tracking-widest text-sm transition-all  ${activeTab === tab ? 'bg-brand-primary text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                      {tab}s
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-3 flex gap-4 h-[120px] animate-pulse">
                        <div className="w-[100px] bg-white/10 rounded-2xl shrink-0" />
                        <div className="flex-1 py-2 flex flex-col justify-center space-y-3">
                          <div className="h-5 bg-white/10 rounded w-3/4" />
                          <div className="h-3 bg-white/10 rounded w-1/2" />
                          <div className="h-5 bg-white/10 rounded w-1/4 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {menu.filter(m => m.category === activeTab).map((item, idx) => {
                      const image = item.imageUrl || getDefaultImage(item.name);
                      const isPopular = item.isPopular ?? (idx % 3 === 0); 
                      
                      return (
                        <div key={item.id} className="glass rounded-3xl border border-white/5 overflow-hidden group hover:border-brand-primary/50 transition-all duration-300 flex flex-col cursor-pointer" onClick={() => { setSelectedItem(item); setItemQuantity(1); setSelectedModifiers([]); }}>
                          <div className="relative h-48 bg-black/50 overflow-hidden shrink-0">
                            <img src={image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
                            {isPopular && (
                              <div className="absolute top-4 left-4 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                                <Star className="w-3 h-3 fill-current" /> Trending
                              </div>
                            )}
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2 gap-4">
                              <h4 className="font-display text-xl tracking-widest text-white leading-tight">{item.name}</h4>
                              <span className="font-bold text-brand-primary whitespace-nowrap">GHC {item.price.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-white/40 tracking-wider leading-relaxed flex-1">{item.ingredients}</p>
                            
                            <button className="w-full mt-6 bg-white/10 hover:bg-brand-primary text-white py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors">
                              Customize & Add
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
            
            {/* STEP 2: ORDER TYPE */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-2xl mx-auto">
                 <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setStep(1)} className="text-white/50 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"><ArrowLeft /></button>
                  <h1 className="text-3xl md:text-4xl font-display uppercase tracking-widest text-white">How to receive?</h1>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-12">
                  <button onClick={() => { setOrderType('pickup'); setStep(3); }} className="glass p-8 rounded-3xl border border-white/10 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all duration-300 text-center flex flex-col items-center gap-4 group hover:-translate-y-1">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors duration-300">
                      <Store className="w-10 h-10 text-white group-hover:text-brand-primary transition-colors" />
                    </div>
                    <h3 className="font-display text-2xl uppercase tracking-widest">Store Pickup</h3>
                    <p className="text-sm text-white/50">I will come to the shop to pick up my order.</p>
                  </button>
                  <button onClick={() => { setOrderType('delivery'); setStep(3); }} className="glass p-8 rounded-3xl border border-white/10 hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all duration-300 text-center flex flex-col items-center gap-4 group hover:-translate-y-1">
                     <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors duration-300">
                      <Truck className="w-10 h-10 text-white group-hover:text-brand-accent transition-colors" />
                    </div>
                    <h3 className="font-display text-2xl uppercase tracking-widest">Delivery</h3>
                    <p className="text-sm text-white/50">Have it delivered right to my location by a rider.</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CUSTOMER DETAILS */}
            {step === 3 && (
               <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 glass p-8 border border-white/10 rounded-3xl max-w-2xl mx-auto">
               <div className="flex items-center gap-4 mb-8">
                 <button onClick={() => setStep(2)} className="text-white/50 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"><ArrowLeft /></button>
                 <h2 className="text-3xl font-display uppercase tracking-widest">Your Details</h2>
               </div>
               
               <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-6">
                 <div>
                   <label className="block text-sm font-medium tracking-widest text-white/70 uppercase mb-2">Full Name *</label>
                   <input required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-primary outline-none transition-colors" placeholder="John Doe" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium tracking-widest text-white/70 uppercase mb-2">Phone Number *</label>
                   <input required type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-primary outline-none transition-colors" placeholder="+233 5X XXX XXXX" />
                   <p className="text-xs text-white/40 mt-2">We will reach you on this number.</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium tracking-widest text-white/70 uppercase mb-2">Email (Optional)</label>
                   <input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-primary outline-none transition-colors" placeholder="john@example.com" />
                 </div>

                 {orderType === 'delivery' && (
                   <div className="pt-4 border-t border-white/10">
                     <label className="block text-sm font-medium tracking-widest text-white/70 uppercase mb-2">Delivery Address / Landmark *</label>
                     <textarea required value={customer.deliveryAddress} onChange={e => setCustomer({...customer, deliveryAddress: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-accent outline-none transition-colors min-h-[100px] resize-y" placeholder="E.g., East Legon, near ANC Mall. House no..." />
                   </div>
                 )}

                 <button type="submit" className="w-full bg-white hover:bg-white/90 text-black py-4 rounded-xl font-bold uppercase tracking-wider mt-8 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">
                   Review Order <ArrowRight className="w-5 h-5" />
                 </button>
               </form>
             </motion.div>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 glass p-8 border border-white/10 rounded-3xl max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setStep(3)} className="text-white/50 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"><ArrowLeft /></button>
                <h2 className="text-3xl font-display uppercase tracking-widest">Review Order</h2>
              </div>

              <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
                <div className="border-b border-white/10 pb-4 mb-4 text-sm">
                  <p><span className="text-white/40 uppercase tracking-widest mr-2 inline-block w-20">Name:</span> {customer.name}</p>
                  <p className="mt-1"><span className="text-white/40 uppercase tracking-widest mr-2 inline-block w-20">Phone:</span> {customer.phone}</p>
                  <p className="mt-1"><span className="text-white/40 uppercase tracking-widest mr-2 inline-block w-20">Method:</span> <span className="font-bold text-brand-primary uppercase">{orderType}</span></p>
                  {orderType === 'delivery' && (
                    <p className="mt-1"><span className="text-white/40 uppercase tracking-widest mr-2 inline-block align-top w-20">Address:</span> <span className="inline-block w-[calc(100%-6rem)]">{customer.deliveryAddress}</span></p>
                  )}
                </div>
                
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm mb-2">
                     <span><span className="text-white/50 bg-white/10 px-2 py-0.5 rounded-md mr-2">{item.quantity}x</span> <span className="font-medium text-white">{item.itemName}</span></span>
                     <span className="text-white/80">GHC {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t border-dashed border-white/20 pt-4 mt-6 space-y-3">
                  <div className="flex justify-between items-center text-white/70 text-sm uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>GHC {subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between items-center text-brand-primary text-sm uppercase tracking-widest">
                      <span>Delivery Fee</span>
                      <span>+ GHC {DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-display text-2xl uppercase tracking-widest pt-3 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-brand-primary">GHC {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={placeOrder} 
                disabled={isSubmitting} 
                className="w-full bg-brand-primary hover:bg-brand-accent text-white py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2  disabled:opacity-50 shadow-[0_0_30px_rgba(236,28,36,0.3)] transition-all hover:scale-[1.02] active:scale-95"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order Now'}
              </button>
            </motion.div>
            )}

            {/* STEP 5: CONFIRMATION */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-6 glass border border-white/10 rounded-3xl p-8 relative overflow-hidden max-w-2xl mx-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/10 blur-[100px]" />
              
              <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.3)] relative z-10">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <h2 className="text-5xl font-display uppercase tracking-widest relative z-10">Order Placed!</h2>
              
              <div className="bg-black/40 inline-block px-8 py-4 rounded-2xl border border-white/10 relative z-10 mt-2">
                <p className="text-white/50 text-sm uppercase tracking-widest mb-1">Order Number</p>
                <p className="font-display text-4xl text-brand-primary">#{orderNumber}</p>
              </div>
              
              <p className="text-white/70 max-w-sm mx-auto pt-6 leading-relaxed relative z-10">
                We'll confirm your order via WhatsApp shortly. Keep this order number handy. <br/> 
                {orderType === 'pickup' ? 'Prepare to pick up your beverages within 15 mins.' : 'Our rider will contact you soon.'}
              </p>
              
              <div className="pt-8 flex flex-col gap-4 max-w-sm mx-auto relative z-10">
                <Link to={`/track?id=${orderNumber}`} className="w-full bg-white hover:bg-white/90 text-black py-4 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex justify-center items-center gap-2">
                  Track Order
                </Link>
                <button onClick={() => { setStep(1); setCart([]); setCustomer({name:'', phone:'', email:'', deliveryAddress: ''}); setOrderType(null); }} className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-white/30">
                  Place Another Order
                </button>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL: ITEM CUSTOMIZATION */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-brand-dark border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="relative h-48 bg-black/50 shrink-0">
                <img src={selectedItem.imageUrl || getDefaultImage(selectedItem.name)} alt={selectedItem.name} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-3xl uppercase tracking-widest">{selectedItem.name}</h3>
                  <span className="font-bold text-brand-primary text-xl">GHC {selectedItem.price.toFixed(2)}</span>
                </div>
                <p className="text-white/50 text-sm mb-6 leading-relaxed">{selectedItem.ingredients}</p>

                {/* Modifiers */}
                <div className="space-y-4 mb-8">
                  <h4 className="font-bold uppercase tracking-widest text-sm text-white/70 border-b border-white/10 pb-2">Customize Your Drink</h4>
                  {(selectedItem.modifiers || getDefaultModifiers(selectedItem.category)).map((mod: Modifier, idx: number) => {
                    const isSelected = selectedModifiers.some(m => m.name === mod.name);
                    return (
                      <label key={idx} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-brand-primary rounded" 
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedModifiers([...selectedModifiers, mod]);
                              else setSelectedModifiers(selectedModifiers.filter(m => m.name !== mod.name));
                            }}
                          />
                          <span className="font-medium">{mod.name}</span>
                        </div>
                        {mod.price > 0 && <span className="text-white/50 text-sm">+GHC {mod.price.toFixed(2)}</span>}
                      </label>
                    );
                  })}
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="font-bold uppercase tracking-widest text-sm text-white/70">Quantity</span>
                  <div className="flex items-center gap-4 bg-black/40 rounded-full p-1 border border-white/10">
                    <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-bold">{itemQuantity}</span>
                    <button onClick={() => setItemQuantity(itemQuantity + 1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/40 shrink-0">
                <button onClick={addToCart} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-[1.02] active:scale-95">
                  Add to Cart • GHC {((selectedItem.price + selectedModifiers.reduce((sum, mod) => sum + mod.price, 0)) * itemQuantity).toFixed(2)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDE-OUT CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-dark border-l border-white/10 shadow-2xl z-50 flex flex-col">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-display text-2xl uppercase tracking-widest flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-brand-primary" /> Your Cart
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-4">
                    <ShoppingBag className="w-16 h-16 opacity-20" />
                    <p className="uppercase tracking-widest text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.cartItemId} className="flex gap-4 items-start border-b border-white/5 pb-6 last:border-0">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold uppercase tracking-wider text-sm">{item.name}</h4>
                          <span className="font-bold text-brand-primary">GHC {((item.basePrice + item.modifiers.reduce((sum, m) => sum + m.price, 0)) * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.modifiers.length > 0 && (
                          <div className="text-xs text-white/40 mt-1 space-y-0.5">
                            {item.modifiers.map((m, i) => <div key={i}>+ {m.name}</div>)}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-4">
                          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/10">
                            <button onClick={() => updateCartItemQty(item.cartItemId, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateCartItemQty(item.cartItemId, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => updateCartItemQty(item.cartItemId, -item.quantity)} className="text-xs text-brand-primary hover:underline uppercase tracking-wider">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-black/20 shrink-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="uppercase tracking-widest text-white/50 text-sm">Subtotal</span>
                      <span className="font-display text-xl">GHC {subtotal.toFixed(2)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between items-center">
                        <span className="uppercase tracking-widest text-brand-primary text-sm">Delivery Fee</span>
                        <span className="font-display text-xl text-brand-primary">+ GHC {DELIVERY_FEE.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                      <span className="uppercase tracking-widest text-white/50 text-sm">Total</span>
                      <span className="font-display text-3xl">GHC {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => { setIsCartOpen(false); setStep(2); }} className="w-full bg-white hover:bg-white/90 text-black py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                    Checkout <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PAYMENT SIMULATION MODAL */}
      <AnimatePresence>
        {paymentStep !== 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-brand-dark border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 relative">
              
              {paymentStep !== 'processing' && paymentStep !== 'success' && (
                <button onClick={() => setPaymentStep('idle')} className="absolute top-4 right-4 text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto text-brand-primary border border-brand-primary/50 shadow-[0_0_20px_rgba(236,28,36,0.2)]">
                  <DollarSign className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="font-display text-2xl uppercase tracking-widest text-white">Mobile Money</h3>
                  <p className="text-white/50 text-sm mt-1">Total to pay: <span className="text-brand-primary font-bold">GHC {totalAmount.toFixed(2)}</span></p>
                </div>

                {paymentStep === 'number' && (
                  <div className="space-y-4">
                    <input 
                      type="tel" 
                      placeholder="Enter MoMo Number" 
                      value={momoNumber}
                      onChange={e => setMomoNumber(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-primary focus:bg-white/10 outline-none text-center font-bold tracking-widest"
                    />
                    <button 
                      onClick={processPayment}
                      disabled={momoNumber.length < 9}
                      className="w-full bg-brand-primary hover:bg-brand-accent text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(236,28,36,0.3)] hover:shadow-[0_0_25px_rgba(236,28,36,0.5)]"
                    >
                      Send Prompt
                    </button>
                  </div>
                )}

                {paymentStep === 'processing' && (
                  <div className="space-y-4 py-4">
                    <div className="w-10 h-10 border-4 border-white/10 border-t-brand-primary rounded-full animate-spin mx-auto" />
                    <p className="text-brand-primary animate-pulse font-medium text-sm tracking-wider uppercase">Please authorize payment on your phone...</p>
                    <p className="text-xs text-white/40">Waiting for approval</p>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-4 py-4 text-green-400">
                    <CheckCircle2 className="w-16 h-16 mx-auto" />
                    <p className="font-bold uppercase tracking-widest text-lg">Payment Successful!</p>
                  </motion.div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
