import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Particle effect background
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: any[] = [];
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * w;
        this.y = h + Math.random() * h;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 1.5 + 0.5;
        const colors = ['#ec1c24', '#ffffff', '#ff4d4d'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.speedY;
        if (this.y < 0) {
          this.y = h;
          this.x = Math.random() * w;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.4;
      }
    }

    const init = () => {
      particlesArray = [];
      for (let i = 0; i < 50; i++) {
        particlesArray.push(new Particle());
      }
    };

    let animationFrameId: number;
    let isVisible = true;

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    
    // observe the parent section to know if hero is on screen
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    const animate = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particlesArray.length; i++) {
          particlesArray[i].update();
          particlesArray[i].draw();
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen pt-24 pb-12 flex items-center overflow-hidden bg-brand-dark">
      {/* Animated gradient mesh & noise */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary opacity-20 blur-[150px] rounded-full animate-blob-spin" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary opacity-10 blur-[150px] rounded-full animate-blob-spin" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Half: Text content */}
        <div className="flex flex-col gap-6 pt-10 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
          >
            <motion.h1 className="font-display flex flex-col leading-[0.9]">
              <motion.span 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-7xl font-light text-white uppercase tracking-wider"
              >
                WELCOME TO
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3 }}
                className="text-[12vw] md:text-[8vw] lg:text-[7rem] font-black text-brand-primary uppercase tracking-tight py-2"
              >
                SLUSHIFY
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-3xl md:text-4xl lg:text-5xl font-light text-white uppercase tracking-widest mt-2"
              >
                Cocktail Bar
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-lg md:text-xl text-white/70 max-w-md font-medium"
          >
            Premium Cocktails &amp; Mocktails. Bold original flavors and fruity classics. Est. 2023.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-4 mt-4"
          >
            <Link to="/order" className="px-8 py-4 rounded-full bg-brand-primary text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(236,28,36,0.6)]">
              Order Now
            </Link>
            <a href="#menu" className="px-8 py-4 rounded-full border-2 border-white/20 text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-brand-dark transition-colors duration-300 flex items-center gap-2 group">
              View Menu
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}
            className="flex items-center gap-4 mt-8 text-sm text-white/50 font-medium font-mono"
          >
            <span className="flex items-center gap-1"><span className="text-brand-primary text-lg">★</span> Excellent Reviews</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>EST. 2023</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/20" />
            <span className="hidden sm:inline-block">Accra</span>
          </motion.div>
        </div>

        {/* Right Half: Product Visual */}
        <div className="relative h-[50vh] md:h-[80vh] flex items-center justify-center">
          {/* Decorative shapes behind cup */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="w-64 h-64 md:w-96 md:h-96 rounded-full border border-white/10 border-dashed absolute"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="w-48 h-48 md:w-72 md:h-72 rounded-full border border-brand-primary/30 absolute"
            />
          </div>

          {/* Video Container */}
          <motion.div 
            className="relative z-10 w-[95%] sm:w-full max-w-[600px] aspect-[16/9] rounded-[30px] border border-brand-primary/50 flex items-center justify-center shadow-[0_0_50px_rgba(236,28,36,0.5)] overflow-hidden animate-float-cup bg-black mx-auto"
          >
            {/* The actual video tag */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
              src="/red-slushy.mp4"
            >
              <p>Your browser does not support the video tag.</p>
            </video>
          </motion.div>

          {/* Floating Badges */}
          <motion.div 
            animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-0 md:-left-12 bg-black/40 backdrop-blur-md px-5 py-3 rounded-full border border-brand-primary/50 text-white font-bold tracking-wider text-xs uppercase flex items-center gap-2 shadow-lg"
          >
            🍸 Cocktails
          </motion.div>
          
          <motion.div 
            animate={{ y: [10, -10, 10], rotate: [5, -5, 5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-0 md:-right-8 bg-brand-primary/20 backdrop-blur-md px-5 py-3 rounded-full border border-brand-primary text-white font-bold tracking-wider text-xs uppercase flex items-center gap-2 shadow-lg"
          >
            🍹 Mocktails
          </motion.div>
          
          <motion.div 
            animate={{ y: [-5, 15, -5], rotate: [-2, 8, -2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 left-4 md:-left-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white font-bold tracking-wider text-xs uppercase flex items-center gap-2"
          >
            ✨ Est. 2023
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Scroll</span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 w-full h-1/2 bg-brand-primary"
            animate={{ top: ['-50%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
