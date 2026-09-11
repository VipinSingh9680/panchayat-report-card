'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AnimatedCounterProps {
    end: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
}

const AnimatedCounter = ({
    end,
    duration = 2000,
    prefix = '',
    suffix = '',
}: AnimatedCounterProps): React.JSX.Element => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const frameRef = useRef<number>(0);

    const animate = useCallback(() => {
        const startTime = performance.now();
        const step = (currentTime: number): void => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            }
        };
        frameRef.current = requestAnimationFrame(step);
    }, [end, duration]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                    animate();
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [hasStarted, animate]);

    return (
        <span
            ref={ref}
            className="tabular-nums font-bold text-4xl md:text-5xl text-emerald-700"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            {prefix}
            {count}
            {suffix}
        </span>
    );
};

export default AnimatedCounter;
