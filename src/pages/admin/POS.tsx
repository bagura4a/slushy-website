import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, doc, writeBatch, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Minus, Search, ShoppingBag } from 'lucide-react';

export default function POS() {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart state: Record<itemId, quantity>
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'cocktail'|'original'|'fruity'>('cocktail');
  const [searchQuery, setSearchQuery] = useState('');

  const [customerInfo, setCustomerInfo] = useState({ name: 'Walk-in', phone: '0000000000' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        const q = query(collection(db, 'menuItems'), where('isAvailable', '==', true));
        const snap = await getDocs(q);
        const fetchedItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (fetchedItems.length > 0) {
          setMenu(fetchedItems);
        } else {
          setMenu([]);
        }
      } catch (e) {
        console.error("Failed to load menu", e);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const totalAmount = useMemo(() => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = menu.find(m => m.id === id);
      return total + (item ? item.price * (qty as number) : 0);
    }, 0);
  }, [cart, menu]);
  
  const totalItems = Object.values(cart).reduce((a, b) => (a as number) + (b as number), 0) as number;

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const item = menu.find(m => m.id === id);
      return {
        menuItemId: id,
        itemName: item?.name || 'Unknown Item',
        quantity: qty,
        unitPrice: item?.price || 0,
        subtotal: (item?.price || 0) * (qty as number),
      };
    });
  }, [cart, menu]);

  const updateCart = (id: string, delta: number) => {
    setCart(prev => {
      const newQty = (prev[id] || 0) + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const placeOrder = async () => {
    if (totalItems === 0 || !customerInfo.name || !customerInfo.phone) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      const customerRef = doc(collection(db, 'customers'));
      batch.set(customerRef, {
        name: customerInfo.name,
        phone: customerInfo.phone,
        createdAt: serverTimestamp()
      });

      const orderRef = doc(collection(db, 'orders'));
      const generatedOrderNumber = Math.floor(1000 + Math.random() * 9000); 
      
      const orderData = {
        orderNumber: generatedOrderNumber,
        customerId: customerRef.id,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        orderType: 'walk-in',
        status: 'confirmed', // Automatically confirmed if placed at POS
        totalAmount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        items: cartItems
      };

      batch.set(orderRef, orderData);
      await batch.commit();
      
      // Reset
      setCart({});
      setCustomerInfo({ name: 'Walk-in', phone: '0000000000' });
      
      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(`
          <html>
            <head><title>Receipt #${generatedOrderNumber}</title></head>
            <body style="font-family: monospace; padding: 20px;">
              <h2 style="text-align: center;">SLUSHIFY</h2>
              <p style="text-align: center;">Order #${generatedOrderNumber}</p>
              <hr/>
              <p>Customer: ${customerInfo.name}</p>
              <p>Type: Walk-in</p>
              <hr/>
              <table style="width: 100%; text-align: left;">
                ${cartItems.map(item => `
                  <tr>
                    <td>${item.quantity}x ${item.itemName}</td>
                    <td style="text-align: right;">GHC ${item.subtotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </table>
              <hr/>
              <p><strong>Total: <span style="float: right;">GHC ${totalAmount.toFixed(2)}</span></strong></p>
              <p style="text-align: center; margin-top: 40px;">Thank you!</p>
            </body>
          </html>
        `);
        receiptWindow.document.close();
        receiptWindow.focus();
        setTimeout(() => {
          receiptWindow.print();
        }, 500);
      } else {
        alert(`Order #${generatedOrderNumber} placed successfully!`);
      }
    } catch (e) {
      console.error(e);
      alert('There was a problem placing your order: ' + (e as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMenu = menu.filter(m => 
    m.category === activeTab && 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex gap-6">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold font-display uppercase tracking-widest">Point of Sale</h1>
          
          <div className="relative max-w-xs w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl w-full mb-6 shrink-0">
          {['cocktail', 'original', 'fruity'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)} 
              className={`flex-1 py-2 text-center rounded-lg font-bold uppercase tracking-widest text-sm transition-all ${activeTab === tab ? 'bg-brand-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              {tab}s
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-8">
          {loading ? (
             <div className="text-white/50 text-center py-8 text-sm">Loading Menu...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMenu.map((item) => {
                const qty = cart[item.id] || 0;
                 return (
                   <div 
                     key={item.id} 
                     onClick={() => updateCart(item.id, 1)}
                     className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-brand-primary cursor-pointer transition-all flex flex-col items-center text-center relative group select-none"
                    >
                      {qty > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {qty}
                        </div>
                      )}
                      <h3 className="font-bold uppercase text-sm mt-2">{item.name}</h3>
                      <div className="text-brand-primary font-bold mt-2 text-sm mt-auto">GHC {item.price.toFixed(2)}</div>
                   </div>
                 )
              })}
              {filteredMenu.length === 0 && (
                <div className="col-span-full text-white/50 text-center py-8 text-sm">No items found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-[#060610] rounded-2xl border border-white/10 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-brand-primary" />
          <h2 className="font-bold uppercase tracking-widest">Current Order</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {cartItems.length === 0 ? (
             <div className="h-full flex items-center justify-center text-white/30 text-sm italic">
               Cart is empty
             </div>
           ) : (
             cartItems.map((item) => (
                <div key={item.menuItemId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-sm leading-tight text-white">{item.itemName}</div>
                    <div className="text-brand-primary text-xs mt-1">GHC {item.unitPrice.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateCart(item.menuItemId, -1)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateCart(item.menuItemId, 1)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
             ))
           )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 space-y-4">
          <div className="space-y-3">
            <input 
              type="text"
              placeholder="Customer Name"
              value={customerInfo.name}
              onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
            />
            <input 
              type="text"
              placeholder="Phone (optional for walkin)"
              value={customerInfo.phone}
              onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Total</span>
            <span className="text-2xl font-display text-brand-primary">GHC {totalAmount.toFixed(2)}</span>
          </div>

          <button 
            onClick={placeOrder}
            disabled={totalItems === 0 || isSubmitting}
            className="w-full bg-brand-primary hover:bg-brand-accent text-white py-3 rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 transition-all flex justify-center items-center gap-2"
          >
            {isSubmitting ? 'Processing...' : 'Charge & Print'}
          </button>
        </div>
      </div>
    </div>
  );
}
