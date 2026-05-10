import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const steps = [
  {
    num: 1,
    title: "Pick Your Base",
    desc: "Choose from our roster of wildly bold, handcrafted fruit blends or cocktail bases.",
    icon: "🍓"
  },
  {
    num: 2,
    title: "Add Your Flavor",
    desc: "Make it a mocktail or add your favorite spirits. Blitzed to absolute perfection.",
    icon: "🌪️"
  },
  {
    num: 3,
    title: "Sip & Enjoy",
    desc: "Experience the premium slushify difference. Zero regrets.",
    icon: "😎"
  }
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Calculate standard dasharray/offset for drawing a line
  const dashOffset = useTransform(scrollYProgress, [0.2, 0.8], [100, 0]);

  return (
    <section ref={containerRef} className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-display font-black uppercase text-white mb-20 tracking-wider"
        >
          How it works — <br className="md:hidden" /><span className="text-brand-primary">in 3 Steps</span>
        </motion.h2>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-4 lg:px-12">
          
          {/* Animated Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-1 z-0 pointer-events-none">
            <svg width="100%" height="20" preserveAspectRatio="none">
              <motion.line 
                x1="0" y1="10" x2="100%" y2="10" 
                stroke="#ec1c24" 
                strokeWidth="4"
                strokeDasharray="10 10"
                style={{ 
                  strokeDashoffset: dashOffset,
                  pathLength: 100
                }}
              />
            </svg>
          </div>

          {steps.map((step, i) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center p-6 md:w-1/3 text-center mix-blend-lighten"
            >
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-[#111] rounded-full border border-white/5" />
                <span className="absolute text-[120px] font-display font-black text-brand-primary/10 -z-10 leading-none select-none">
                  {step.num}
                </span>
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(236,28,36,0.3)] border-2 border-brand-primary text-3xl">
                  {step.icon}
                </div>
              </div>
              
              <h3 className="font-display font-bold text-2xl uppercase mb-2 text-white tracking-widest">
                {step.title}
              </h3>
              <p className="text-white/60 font-medium max-w-[250px] mx-auto text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
          
        </div>
      </div>
    </section>
  );
}
