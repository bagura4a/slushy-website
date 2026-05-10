import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const cocktails = [
  { name: 'STRAWBERRY / PASSION FRUIT MOJITO', desc: 'White rum, mint, lime juice, sugar, and soda water.', price: '80' },
  { name: 'MIMOSA', desc: 'Champagne and orange juice.', price: '120' },
  { name: 'SEX ON THE BEACH', desc: 'Vodka, peach schnapps, orange juice, and cranberry juice.', price: '120' },
  { name: 'PORNSTAR MARTINI', desc: 'Vodka, passion fruit liqueur, vanilla syrup, passion fruit puree, and Prosecco.', price: '120' },
  { name: 'PINA COLADA', desc: 'Coconut syrup, pineapple, tequila', price: '120' },
  { name: 'PASSION / STRAWBERRY MARGARITA', desc: 'Margarita syrup, tequila', price: '120' },
];

const originals = [
  { name: 'RED PASSION', desc: 'Mixed fruit, grenadine syrup', price: '50' },
  { name: 'BLUE PILL', desc: 'passion, blue caro, soda', price: '50' },
  { name: 'LEMON TEASE', desc: 'fresh lemon, soda, passion', price: '50' },
  { name: 'PINK ANTIDOTE', desc: 'Cranberry, grenadine, lemon', price: '50' },
  { name: 'ILLUSION', desc: 'Grape, Vimto, s', price: '50' },
];

const fruity = [
  { name: 'MANGO', price: '50' },
  { name: 'GRAPE', price: '50' },
  { name: 'WATERMELON', price: '50' },
  { name: 'PINEAPPLE', price: '50' },
  { name: 'PASSION', price: '50' },
];

export default function Flavors() {
  return (
    <section id="menu" className="py-24 bg-brand-dark px-6 md:px-12 relative overflow-hidden text-white">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary opacity-5 blur-[200px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 relative flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center gap-2"
          >
            <h2 className="text-6xl md:text-8xl font-display font-black text-brand-primary tracking-tighter uppercase leading-none drop-shadow-lg drop-[0_0_15px_rgba(236,28,36,0.8)]">
              SLUSHIFY
            </h2>
            <div className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest mt-2 bg-white text-black px-6 py-2">
              MENU
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <Link to="/order" className="bg-brand-primary hover:bg-white hover:text-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(236,28,36,0.4)] flex items-center gap-3">
              Order Now <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </motion.div>
        </div>

        {/* Menu Grid */}
        <div className="grid lg:grid-cols-3 gap-16 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Cocktails Column */}
          <div className="flex flex-col border-r-0 lg:border-r border-brand-primary/20 pr-0 lg:pr-8">
            <div className="text-center mb-10">
              <div className="font-script text-white text-3xl mb-1 opacity-80">Slushify</div>
              <h3 className="text-2xl font-display font-bold uppercase tracking-widest border-b border-brand-primary/30 pb-4 inline-block px-4">
                COCKTAILS
              </h3>
            </div>
            
            <div className="flex flex-col gap-8">
              {cocktails.map((item, i) => (
                <Link to="/order" key={i}>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-start gap-4 group cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-[15px] uppercase tracking-wide group-hover:text-brand-primary transition-colors flex items-center gap-2">{item.name}</h4>
                      <p className="text-xs text-white/50 font-medium mt-1 uppercase max-w-[250px] leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="w-12 h-12 shrink-0 rounded-full bg-brand-primary flex flex-col items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(236,28,36,0.4)] transform group-hover:scale-110 transition-transform">
                      {item.price}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Original Column */}
          <div className="flex flex-col border-r-0 lg:border-r border-brand-primary/20 pr-0 lg:pr-8">
            <div className="text-center mb-10">
              <div className="font-script text-white text-3xl mb-1 opacity-80">Slushify</div>
              <h3 className="text-2xl font-display font-bold uppercase tracking-widest border-b border-brand-primary/30 pb-4 inline-block px-4">
                ORIGINAL
              </h3>
            </div>
            
            <div className="flex flex-col gap-8">
              {originals.map((item, i) => (
                <Link to="/order" key={i}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-start gap-4 group cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-[15px] uppercase tracking-wide group-hover:text-brand-primary transition-colors">{item.name}</h4>
                      <p className="text-xs text-white/50 font-medium mt-1 uppercase max-w-[200px] leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(236,28,36,0.4)] transform group-hover:scale-110 transition-transform">
                      {item.price}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Fruity & Special Promo Column */}
          <div className="flex flex-col">
            <div className="text-center mb-10">
              <div className="font-script text-white text-3xl mb-1 opacity-80">Slushify</div>
              <h3 className="text-2xl font-display font-bold uppercase tracking-widest border-b border-brand-primary/30 pb-4 inline-block px-4">
                FRUITY
              </h3>
            </div>
            
            <div className="flex flex-col gap-8 mb-16">
              {fruity.map((item, i) => (
                <Link to="/order" key={i}>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-center gap-4 group border-b border-white/5 pb-4 cursor-pointer"
                  >
                    <h4 className="font-bold text-[15px] uppercase tracking-wide group-hover:text-brand-primary transition-colors">{item.name}</h4>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(236,28,36,0.4)] transform group-hover:scale-110 transition-transform">
                      {item.price}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Alcohol Alert Promo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-auto bg-black border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-primary opacity-5"></div>
              <h4 className="font-bold uppercase tracking-widest text-sm mb-4 leading-loose relative z-10">
                ORIGINAL AND FRUITY<br/>FLAVORS CONTAINING<br/>ALCOHOL
              </h4>
              <div className="w-32 h-32 rounded-full bg-brand-primary flex flex-col items-center justify-center text-white shadow-[0_0_30px_rgba(236,28,36,0.6)] relative z-10">
                <span className="font-display font-black text-2xl">GHC</span>
                <span className="font-display font-black text-5xl">80</span>
              </div>
            </motion.div>
          </div>

        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <Link to="/order" className="bg-brand-primary hover:bg-white hover:text-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(236,28,36,0.4)] flex items-center gap-3">
            Place Your Order <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
