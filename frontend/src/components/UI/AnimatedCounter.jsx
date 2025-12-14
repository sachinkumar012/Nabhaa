import React, { useState, useEffect, useRef } from 'react';

const AnimatedCounter = ({ 
  end, 
  duration = 2500, 
  delay = 0, 
  className = "",
  style = {} 
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  const getNumericValue = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      if (value.includes("/")) {
        return parseInt(value.split("/")[0]);
      }
      const match = value.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }
    return 0;
  };

  const formatDisplay = (currentCount) => {
    if (typeof end === "string") {
      if (end.includes("/")) {
        return `${currentCount}${end.substring(end.indexOf("/"))}`;
      }
      if (end.includes("+")) {
        return `${currentCount}+`;
      }
    }
    return currentCount.toString();
  };

  const animate = () => {
    if (hasAnimated) return;
    setHasAnimated(true);

    const numericEnd = getNumericValue(end);

    setTimeout(() => {
      const startTime = Date.now();
      const startValue = 0;

      const animateFrame = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        const currentValue = Math.floor(
          startValue + (numericEnd - startValue) * easeOutQuart
        );
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animateFrame);
        } else {
          setCount(numericEnd);
        }
      };

      requestAnimationFrame(animateFrame);
    }, delay);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          animate();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasAnimated]);

  return (
    <span 
      ref={elementRef}
      className={className}
      style={style}
    >
      {formatDisplay(count)}
    </span>
  );
};

export default AnimatedCounter;