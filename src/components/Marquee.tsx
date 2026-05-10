export default function Marquee() {
  const words = [
    "COCKTAILS", "✦", 
    "MOCKTAILS", "✦", 
    "ORIGINAL BLENDS", "✦", 
    "EST. 2023", "✦", 
    "FRUITY FLAVORS", "✦"
  ];
  const strip = [...words, ...words, ...words, ...words];

  return (
    <section className="bg-brand-dark overflow-hidden relative z-20 py-8">
      <div className="flex flex-col gap-2 transform -skew-y-2 origin-left border-y border-brand-primary/20 py-8">
        {/* Strip 1 - Left */}
        <div className="bg-brand-primary py-4 flex whitespace-nowrap overflow-hidden shadow-[0_0_30px_rgba(236,28,36,0.3)]">
          <div className="animate-marquee-left flex gap-8 items-center shrink-0 min-w-max">
            {strip.map((word, i) => (
              <span key={`l-${i}`} className="text-white font-display font-black text-3xl md:text-5xl uppercase pt-2 tracking-widest">
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Strip 2 - Right */}
        <div className="bg-white py-4 flex whitespace-nowrap overflow-hidden">
          <div className="animate-marquee-right flex gap-8 items-center shrink-0 min-w-max" style={{ transform: 'translateX(-50%)' }}>
            {strip.map((word, i) => (
              <span key={`r-${i}`} className="text-brand-dark font-display font-black text-3xl md:text-5xl uppercase pt-2 tracking-widest">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
