import React, { useEffect, useState } from 'react';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const main = document.getElementById('main-scroll');
      const yWindow = window.scrollY || window.pageYOffset;
      const yMain = main && typeof main.scrollTop === 'number' ? main.scrollTop : 0;
      const y = Math.max(yWindow, yMain);
      setVisible(y > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const main = document.getElementById('main-scroll');
    if (main) {
      main.addEventListener('scroll', handleScroll, { passive: true });
    }
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const m = document.getElementById('main-scroll');
      if (m) {
        m.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  if (!visible) return null;

  const handleClick = () => {
    const container = document.getElementById('main-scroll');
    if (container && typeof container.scrollTo === 'function') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="맨 위로 가기"
      className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#EAE5DD] shadow-sm flex items-center justify-center text-[#8C857B] hover:shadow-md transition-all duration-200"
    >
      <span className="text-sm leading-none" aria-hidden>
        ↑
      </span>
    </button>
  );
};

export default ScrollToTopButton;

