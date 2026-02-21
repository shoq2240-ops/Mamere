import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const MAX_TILT = 15;
const SHADOW_OFFSET = 24;
const SPRING = { type: 'spring', stiffness: 300, damping: 30 };

const TiltCard = ({
  children,
  className = '',
  style = {},
  maxTilt = MAX_TILT,
  shadowOffset = SHADOW_OFFSET,
  enableTouchAnimation = true,
  ...rest
}) => {
  const cardRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const check = () =>
      window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
    setIsTouch(check());
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), SPRING);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), SPRING);

  const shadowX = useSpring(useTransform(x, [-0.5, 0.5], [shadowOffset, -shadowOffset]), SPRING);
  const shadowY = useSpring(useTransform(y, [-0.5, 0.5], [-shadowOffset, shadowOffset]), SPRING);

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current || isTouch) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const relX = (e.clientX - centerX) / (rect.width / 2);
      const relY = (e.clientY - centerY) / (rect.height / 2);
      x.set(Math.max(-1, Math.min(1, relX)));
      y.set(Math.max(-1, Math.min(1, relY)));
    },
    [isTouch, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  // 터치 환경에서도 부모의 높이를 꽉 채우도록 설정
  if (isTouch) {
    return (
      <motion.div
        ref={cardRef}
        className={`${className} w-full h-full`}
        style={{ ...style, position: 'relative' }}
        initial={enableTouchAnimation ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`${className} w-full h-full`}
      style={{ position: 'relative', perspective: '1000px', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'rgba(0,0,0,0.15)',
          filter: 'blur(20px)',
          x: shadowX,
          y: shadowY,
          scale: 0.95,
        }}
      />
      <motion.div
        className="w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          zIndex: 1,
          display: 'flex',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default TiltCard;
