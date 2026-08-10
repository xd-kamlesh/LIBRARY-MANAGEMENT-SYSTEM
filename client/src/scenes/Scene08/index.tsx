import React, { useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import gsap from 'gsap';

export const Scene08: React.FC = () => {
    const graphBar1 = useRef<HTMLDivElement>(null);
    const graphBar2 = useRef<HTMLDivElement>(null);
    const graphBar3 = useRef<HTMLDivElement>(null);
    const graphBar4 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Animate the graphs drawing themselves up sequentially when hovering near this Z-depth
        gsap.to(".scene08-bar", {
            scrollTrigger: {
                trigger: ".scene08-trigger",
                start: "top center",
                end: "bottom center",
                scrub: 1
            },
            height: (i) => [180, 240, 120, 280][i],
            stagger: 0.2,
            ease: "circ.out"
        });
    }, []);

    return (
        <group position={[0, -15, -190]}>
            <Html center distanceFactor={14} style={{ pointerEvents: 'none', width: '800px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.2)', padding: '3rem', borderRadius: '24px', display: 'flex', gap: '3rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, color: 'white' }}>
                        <h2 className="font-serif mb-2" style={{ fontSize: '2.5rem' }}>Librarian Analytics</h2>
                        <p style={{ color: '#a1a1aa' }}>Graphs draw themselves automatically tied to your scroll progression. No static elements.</p>
                    </div>

                    {/* Simulated Recharts Animating Bars */}
                    <div style={{ display: 'flex', gap: '1rem', height: '300px', alignItems: 'flex-end' }}>
                        <div ref={graphBar1} className="scene08-bar" style={{ width: '40px', height: '10px', background: '#3b82f6', borderRadius: '6px 6px 0 0' }} />
                        <div ref={graphBar2} className="scene08-bar" style={{ width: '40px', height: '10px', background: '#8b5cf6', borderRadius: '6px 6px 0 0' }} />
                        <div ref={graphBar3} className="scene08-bar" style={{ width: '40px', height: '10px', background: '#f43f5e', borderRadius: '6px 6px 0 0' }} />
                        <div ref={graphBar4} className="scene08-bar" style={{ width: '40px', height: '10px', background: '#10b981', borderRadius: '6px 6px 0 0' }} />
                    </div>
                </div>
            </Html>
        </group>
    );
};
