import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function Vibe() {
  const ref1 = useRef(null);
  const isInView1 = useInView(ref1, { once: true, margin: "100px" });
  
  const ref2 = useRef(null);
  const isInView2 = useInView(ref2, { once: true, margin: "100px" });

  return (
    <section id="vibe" className="py-24 bg-brand-dark relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-primary/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-black text-white mb-4 uppercase tracking-wider"
          >
            The <span className="text-brand-primary">SLUSHIFY</span> Experience
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            Good food, great drinks, and spotless vibes.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Video 1: Interior/Vibe */}
          <motion.div
            ref={ref1}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-[9/16] max-w-[400px] mx-auto rounded-[30px] overflow-hidden shadow-[0_0_40px_rgba(236,28,36,0.15)] border border-white/10 group"
          >
            {isInView1 && (
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                src="/interior.mp4"
              >
                <p>Your browser does not support the video tag.</p>
              </video>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 pointer-events-none">
              <h3 className="font-display font-bold text-white text-2xl uppercase tracking-widest mb-2">The Ambience</h3>
              <p className="text-sm text-white/70 font-medium">Step inside our East Legon branch.</p>
            </div>
          </motion.div>

          {/* Video 2: Food & Drinks */}
          <motion.div
            ref={ref2}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-[9/16] max-w-[400px] mx-auto rounded-[30px] overflow-hidden shadow-[0_0_40px_rgba(236,28,36,0.15)] border border-white/10 group mt-12 md:mt-0"
          >
            {isInView2 && (
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                src="/food.mp4"
              >
                <p>Your browser does not support the video tag.</p>
              </video>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 pointer-events-none">
              <h3 className="font-display font-bold text-white text-2xl uppercase tracking-widest mb-2">Bites &amp; Sips</h3>
              <p className="text-sm text-white/70 font-medium">We do amazing finger foods, too.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
