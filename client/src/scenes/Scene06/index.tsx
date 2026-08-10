import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

export const Scene06: React.FC = () => {
    const telemetryRef = useRef<THREE.Group>(null);
    const countRef1 = useRef<HTMLHeadingElement>(null);
    const countRef2 = useRef<HTMLHeadingElement>(null);
    const countRef3 = useRef<HTMLHeadingElement>(null);

    // Hardcode an animation trigger mimicking intersection logic 
    useEffect(() => {
        // We can hook GSAP natively here based on ScrollTrigger to animate numbers
        gsap.to({}, {
            scrollTrigger: {
                trigger: ".scene06-trigger",
                start: "top center",
                end: "bottom center",
                scrub: 1,
                onUpdate: (self) => {
                    const progress = self.progress;
                    if (countRef1.current) countRef1.current.innerText = Math.floor(progress * 135892).toLocaleString();
                    if (countRef2.current) countRef2.current.innerText = Math.floor(progress * 4820).toLocaleString();
                    if (countRef3.current) countRef3.current.innerText = Math.floor(progress * 74).toLocaleString() + '%';
                }
            }
        });
    }, []);

    useFrame((state) => {
        if (telemetryRef.current) {
            telemetryRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    return (
        <group position={[0, -5, -120]} ref={telemetryRef}>
            {/* The Telemetry Core Mesh */}
            <mesh position={[0, 0, 0]}>
                <torusKnotGeometry args={[3, 0.4, 128, 32]} />
                <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={2} wireframe />
            </mesh>

            <Html center distanceFactor={12} style={{ pointerEvents: 'none', minWidth: '400px' }}>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '1rem', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 ref={countRef1} className="font-serif text-gradient" style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold', minWidth: '150px' }}>0</h2>
                        <span style={{ color: '#a1a1aa' }}>Books Archived</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 ref={countRef2} className="font-serif text-gradient" style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold', minWidth: '100px' }}>0</h2>
                        <span style={{ color: '#a1a1aa' }}>Active Students</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 ref={countRef3} className="font-serif text-gradient" style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold', minWidth: '100px' }}>0%</h2>
                        <span style={{ color: '#a1a1aa' }}>Server Load</span>
                    </div>
                </div>
            </Html>
        </group>
    );
};
