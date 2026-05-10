import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

// Counter hook for stats
function useCounter(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return { count, ref };
}

export default function Story() {
  const flavorStat = useCounter(15);
  const locStat = useCounter(2023, 2);
  const cupStat = useCounter(10);
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "100px" });

  return (
    <section id="about" ref={ref} className="py-24 text-white overflow-hidden bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center">
        
        {/* Visual Left (on desktop) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-square md:aspect-[4/3] max-w-[500px] mx-auto flex items-center justify-center order-2 md:order-1"
        >
          {/* Video Container */}
          <div className="bg-brand-primary/10 rounded-[30px] -rotate-3 border border-brand-primary/50 shadow-[0_0_50px_rgba(236,28,36,0.2)] overflow-hidden relative z-10 w-full aspect-[16/9] mx-auto">
             {/* Assuming user uploads 'blue-slushy.mp4' to public folder */}
             {isInView && (
               <video 
                 autoPlay 
                 loop 
                 muted 
                 playsInline
                 className="w-full h-full object-cover"
                 src="/blue-slushy.mp4"
               >
                 <p>Your browser does not support the video tag.</p>
               </video>
             )}
             
             {/* Gradient overlay */}
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
             <div className="absolute bottom-6 left-6 right-6 text-white font-bold uppercase tracking-widest text-xs text-center z-20">
               Est. 2023<br/>Cocktail / Mocktail Bar
             </div>
          </div>

          {/* Circular SVG Badge */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -right-4 bottom-1/4 w-32 h-32 bg-black rounded-full flex items-center justify-center text-brand-primary z-20 shadow-lg border-2 border-brand-primary"
          >
            <svg viewBox="0 0 100 100" className="w-28 h-28 overflow-visible">
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
              <text className="text-[14px] font-display font-medium tracking-widest uppercase fill-current">
                <textPath href="#circlePath" startOffset="0%">
                  EST 2023 • BOLD FLAVORS • EST 2023 • 
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <span className="font-display font-black text-2xl">🍸</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Text Right */}
        <div className="flex flex-col gap-8 order-1 md:order-2">
          <div>
            <span className="text-brand-primary font-bold tracking-[0.2em] text-sm uppercase block mb-4">OUR STORY</span>
            <h2 className="text-4xl md:text-6xl font-display font-black leading-tight uppercase tracking-wide">
              The <span className="text-brand-primary">SLUSHIFY</span> Standard.
            </h2>
          </div>

          <p className="text-lg text-white/70 font-medium leading-relaxed max-w-lg">
            Since 2023, we've been blending the finest ingredients to create an unforgettable cocktail and mocktail experience. 
            Whether you're craving an original blend, a fruity classic, or a high-end cocktail, we serve it cold, bold, and crafted to perfection.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-primary/20">
            <div ref={flavorStat.ref}>
              <div className="font-display font-black text-4xl text-white mb-2">
                {flavorStat.count}<span className="text-brand-primary">+</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Cocktails</div>
            </div>
            <div ref={cupStat.ref}>
              <div className="font-display font-black text-4xl text-white mb-2">
                {cupStat.count}<span className="text-brand-primary">+</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Originals</div>
            </div>
            <div ref={locStat.ref}>
              <div className="font-display font-black text-4xl text-white mb-2">
                {locStat.count}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Established</div>
            </div>
          </div>

          <div>
            <a href="#locations" className="inline-flex items-center gap-2 group text-white font-bold uppercase tracking-wider text-sm mt-4">
              Visit Us Today
              <motion.span 
                className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center group-hover:bg-white group-hover:text-brand-primary transition-colors"
              >
                →
              </motion.span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
