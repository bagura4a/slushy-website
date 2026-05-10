import { Instagram, Twitter, Youtube, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-dark pt-24 pb-8 px-6 md:px-12 border-t border-brand-primary/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
        
        {/* Column 1: Brand */}
        <div className="flex flex-col gap-6">
          <a href="#home" className="flex flex-col leading-none">
            <span className="font-script text-white text-xl -mb-2 ml-1 opacity-90">The</span>
            <span className="text-3xl font-display font-black tracking-widest text-brand-primary">SLUSHIFY</span>
          </a>
          <p className="text-white/60 font-medium">Cocktail / Mocktail Bar. Est. 2023.</p>
          
          <div className="flex gap-4 mt-2">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-primary hover:-translate-y-1 transition-all duration-300">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-primary hover:-translate-y-1 transition-all duration-300">
              {/* Using Twitter icon for X placeholder */}
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-primary hover:-translate-y-1 transition-all duration-300">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-brand-primary font-bold uppercase tracking-widest text-sm mb-2">Quick Links</h4>
          <a href="#home" className="text-white/60 hover:text-white transition-colors relative w-fit group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-primary group-hover:w-full transition-all duration-300" />
          </a>
          <Link to="/order" className="text-white/60 hover:text-white transition-colors relative w-fit group ">
            Order Now
          </Link>
          <a href="#locations" className="text-white/60 hover:text-white transition-colors relative w-fit group">
            Locations
          </a>
          <a href="#about" className="text-white/60 hover:text-white transition-colors relative w-fit group">
            About Us
          </a>
          <Link to="/admin" className="text-white/60 hover:text-brand-primary transition-colors relative w-fit group text-xs mt-2">
            Admin Login
          </Link>
        </div>

        {/* Column 3: Contact */}
        <div className="flex flex-col gap-4">
          <h4 className="text-brand-primary font-bold uppercase tracking-widest text-sm mb-2">Contact</h4>
          <p className="text-white/60 leading-relaxed">
            123 Slushify Ave<br />
            Accra, GH
          </p>
          <a href="tel:+18005550199" className="text-white hover:text-brand-primary transition-colors">
            (800) SLUSH-01
          </a>
          <a href="mailto:hello@theslushify.com" className="text-white hover:text-brand-primary transition-colors">
            hello@theslushify.com
          </a>
          <p className="text-white/40 text-sm mt-4 uppercase tracking-wider font-bold">
            Mon-Sun: 11AM - 10PM
          </p>
        </div>

        {/* Column 4: Newsletter Compact */}
        <div className="flex flex-col gap-4">
          <h4 className="text-brand-primary font-bold uppercase tracking-widest text-sm mb-2">Stay Frosty 🍸</h4>
          <p className="text-white/60 text-sm">Join the club for secret drops.</p>
          
          <form className="mt-2 relative">
            <input 
              type="email" 
              placeholder="Email address" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white text-sm outline-none focus:border-brand-primary transition-colors pr-12"
            />
            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white hover:bg-white hover:text-brand-dark transition-colors">
              <Send className="w-4 h-4 ml-[-2px]" />
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-brand-primary/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/40 text-sm">
          © 2023 The Slushify. All rights reserved.
        </p>
        <div className="flex gap-6 text-white/40 text-sm tracking-wide">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
