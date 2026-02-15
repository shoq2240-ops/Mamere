import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { LOOKBOOK_ITEMS } from '../data/lookbook';

const LookbookSection = ({ items = LOOKBOOK_ITEMS }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section className="lookbook-section relative border-t border-white/5 overflow-hidden">
      <div className="px-6 md:px-12 pt-12 md:pt-16 pb-4">
        <p className="text-purple-500 text-[8pt] md:text-[9pt] font-black tracking-widest uppercase italic">Lookbook</p>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth lookbook-scroll pb-8 md:pb-12 pl-[50vw] pr-[50vw] md:pl-[45vw] md:pr-[45vw]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.2) transparent',
          height: 'min(85vh, 850px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((item, idx) => (
          <LookbookSlide key={item.id} item={item} index={idx} />
        ))}
      </div>

      <style>{`
        .lookbook-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .lookbook-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .lookbook-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
        }
      `}</style>
    </section>
  );
};

const LookbookSlide = ({ item, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-20%', once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex-shrink-0 snap-center mx-4 md:mx-6"
      style={{ scrollSnapAlign: 'center' }}
    >
      <div
        className="relative overflow-hidden bg-zinc-900 flex items-center justify-center"
        style={{
          width: 'min(85vw, 900px)',
          height: 'min(80vh, 700px)',
        }}
      >
        <img
          src={item.image}
          alt={item.caption}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        <p className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-[9px] md:text-[10px] font-light tracking-[0.25em] uppercase text-white/50">
          {item.caption}
        </p>
      </div>
    </motion.div>
  );
};

export default LookbookSection;
