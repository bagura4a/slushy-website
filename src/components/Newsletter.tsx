import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if(email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail('');
    }
  }

  return (
    <section className="relative py-32 overflow-hidden bg-brand-dark">
      {/* Animated gradient background spanning the whole section */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-[#900000] to-black animate-bg-pan bg-[length:200%_200%] opacity-80" />
      
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-4xl mb-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-brand-primary"
        >
          🍸
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-display font-black text-white uppercase mb-4 drop-shadow-lg tracking-widest pt-2"
        >
          Get First Dibs <br/> on New Drops
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/90 text-lg md:text-xl font-medium mb-10 max-w-xl text-shadow-sm"
        >
          Drop your email and we'll hit you first. No spam. Just slushies.
        </motion.p>

        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md relative"
        >
          <div className="flex flex-col sm:flex-row gap-4 p-2 bg-black/40 backdrop-blur-md rounded-3xl sm:rounded-full border border-white/20 shadow-2xl">
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white rounded-full px-6 py-4 text-brand-dark outline-none placeholder:text-gray-500 font-medium w-full shadow-inner"
            />
            <button 
              type="submit"
              className="bg-brand-primary text-white rounded-full px-8 py-4 font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
            >
              {submitted ? "Joined!" : "Notify Me"}
              {!submitted && <Send className="w-4 h-4" />}
            </button>
          </div>
        </motion.form>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mt-6"
        >
          Join 5,000+ slushy insiders. Unsubscribe anytime.
        </motion.p>

      </div>
    </section>
  );
}
