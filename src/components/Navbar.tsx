import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = [
  { name: 'Home', href: '#home' },
  { name: 'Menu', href: '#menu' },
  { name: 'About', href: '#about' },
  { name: 'Locations', href: '#locations' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 glass-nav shadow-lg shadow-brand-primary/5' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <a href="#home" className="flex flex-col items-center leading-none group">
          <span className="font-script text-white text-2xl -mb-3 self-start ml-2 tracking-wider group-hover:text-brand-primary transition-colors">The</span>
          <span className="text-2xl md:text-4xl font-display font-black tracking-widest text-brand-primary">SLUSHIFY</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href.startsWith('#') ? `/${link.href}` : link.href}
              onClick={(e) => {
                if (link.href.startsWith('#')) {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  setActiveLink(link.name);
                }
              }}
              className="relative text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white transition-colors"
            >
              {link.name}
              {activeLink === link.name && (
                <motion.div
                  layoutId="active-link-pill"
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-primary rounded-full tracking-widest"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            to="/order"
            className="px-8 py-3 rounded-full bg-brand-primary text-white font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(236,28,36,0.6)] border border-brand-primary hover:border-transparent transition-all duration-300 transform hover:scale-105 inline-block"
          >
            Order Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at top right)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at top right)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at top right)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-brand-dark flex flex-col justify-center items-center"
          >
            <button
              className="absolute top-6 right-6 text-white p-2"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col items-center gap-8">
              {links.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-4xl font-display font-black text-white uppercase tracking-widest hover:text-brand-primary transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              <Link
                to="/order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 px-10 py-4 border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-full font-bold uppercase tracking-widest text-lg transition-all"
              >
                Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
