import { motion } from 'motion/react';

const testimonials = [
  {
    id: 1,
    quote: "Honestly ruined all other slushies for me. The Red Passion hit my soul and woke me up. 10/10.",
    name: "Alex R.",
    location: "Accra, GH",
    color: "bg-brand-primary"
  },
  {
    id: 2,
    quote: "The Pornstar Martini slush was next level. Actual fruit, actual flavor, totally addicted to Slushify.",
    name: "Samira K.",
    location: "Accra, GH",
    color: "bg-white text-black"
  },
  {
    id: 3,
    quote: "I didn't know ice could taste this premium. The original blends are insane. Pure vibes.",
    name: "Jordan T.",
    location: "Accra, GH",
    color: "bg-[#222]"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      
      {/* Background radial soft light */}
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-brand-primary opacity-10 blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-black text-white mb-4 uppercase tracking-wider"
          >
            Real People. Real Slushies. <br className="hidden md:block"/> Real Reactions.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            Don't just take our word for it 👀
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/5 backdrop-blur-md p-8 rounded-3xl relative group hover:-translate-y-2 transition-all duration-300 border border-white/10 hover:border-brand-primary/50 hover:shadow-[0_0_30px_rgba(236,28,36,0.15)]"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-brand-primary text-xl">★</span>
                ))}
              </div>
              
              <p className="text-white/90 text-[15px] font-medium leading-relaxed mb-8 relative z-10">
                "{t.quote}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center font-display font-bold text-lg`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold tracking-widest text-sm uppercase">{t.name}</div>
                  <div className="text-white/50 text-xs">{t.location}</div>
                </div>
              </div>

              <div className="absolute top-4 right-4 text-9xl font-display font-black text-white/5 pointer-events-none transition-colors group-hover:text-brand-primary/10">
                "
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="border-t border-brand-primary/20 pt-12 flex flex-col items-center"
        >
          <span className="text-brand-primary text-xs font-bold tracking-[0.2em] uppercase mb-8">As Seen Sipping On</span>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500 text-sm">
            <div className="text-lg font-display font-black text-white">THE DAILY SCOOP</div>
            <div className="text-lg font-display font-black text-white tracking-widest uppercase">HYPEBEAST</div>
            <div className="text-lg font-display font-black text-white italic">VICE</div>
            <div className="text-lg font-display font-bold text-white">FoodNetwork</div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
