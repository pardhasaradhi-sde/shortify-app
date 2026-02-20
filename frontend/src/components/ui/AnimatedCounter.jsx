import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateCount();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const animateCount = () => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
  };

  const formatted =
    target >= 1000000
      ? (count / 1000000).toFixed(1) + 'M'
      : target >= 1000
      ? (count / 1000).toFixed(1) + 'K'
      : count.toString();

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
