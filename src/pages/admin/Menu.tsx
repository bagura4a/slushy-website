import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function MenuManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New Item State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'cocktail' | 'original' | 'fruity'>('cocktail');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'menuItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      setLoading(false);
    }, (error) => {
      console.error("Menu onSnapshot error:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleToggleAvailable = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'menuItems', id), { isAvailable: !currentStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'menuItems', id));
    }
  };

  const submitNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    try {
      await addDoc(collection(db, 'menuItems'), {
        name,
        category,
        price: Number(price),
        ingredients,
        isAvailable: true,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setName('');
      setPrice('');
      setIngredients('');
    } catch (e) {
      console.error('Failed to add item', e);
      alert('Failed to add item. Check permissions.');
    }
  };

  if (loading) return <div>Loading menu...</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Menu Management</h1>
          <p className="text-white/60">Update prices and availability.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-brand-accent transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      {isAdding && (
        <div className="glass p-6 rounded-3xl border border-brand-primary/30 relative">
          <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-xl font-display uppercase tracking-widest mb-6 text-brand-primary">Adding New Item</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={submitNewItem}>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Item Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" placeholder="Strawberry Daiquiri" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 appearance-none">
                <option value="cocktail">Cocktail</option>
                <option value="original">Original</option>
                <option value="fruity">Fruity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Price (GHC)</label>
              <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" placeholder="60" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Ingredients</label>
              <input value={ingredients} onChange={e => setIngredients(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" placeholder="Rum, Strawberry, Lime..." />
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="bg-brand-primary hover:bg-brand-accent px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg">Save Item</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest">Price</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className={`hover:bg-white/5 transition-colors ${!item.isAvailable ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-white tracking-wide">{item.name}</div>
                  <div className="text-xs text-white/40 max-w-xs truncate" title={item.ingredients}>{item.ingredients}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="uppercase text-[10px] tracking-widest px-2 py-1 bg-white/10 rounded-sm">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-accent">
                  GHC {item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleToggleAvailable(item.id, item.isAvailable)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.isAvailable ? 'bg-brand-primary' : 'bg-white/20'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 text-white/50">
                  {/* Edit functionality omitted for brevity, adding delete and toggle */}
                  <button onClick={() => handleDelete(item.id)} className="hover:text-brand-primary transition-colors">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
