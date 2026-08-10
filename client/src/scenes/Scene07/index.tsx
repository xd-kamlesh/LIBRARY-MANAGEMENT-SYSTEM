import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const HoverableCard = ({ idx }: { idx: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div
            style={{
                flex: '0 0 160px',
                height: '240px',
                background: `linear-gradient(45deg, #374151, #1f2937)`,
                borderRadius: '12px',
                boxShadow: isHovered ? '0 10px 30px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(96,165,250,0.5)' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '1rem',
                transform: isHovered ? 'scale(1.1) translateY(-10px)' : 'scale(1) translateY(0px)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                cursor: 'pointer',
                zIndex: isHovered ? 10 : 1
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span style={{ color: 'white', fontWeight: 'bold' }}>Trending #{idx}</span>
        </div>
    );
};

export const Scene07: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        // Cinematic idle floating
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
    });

    return (
        <group position={[0, -10, -150]} ref={groupRef}>
            <Html center distanceFactor={14} style={{ pointerEvents: 'none', width: '800px' }}>
                <div style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <h2 className="font-serif text-white mb-6" style={{ fontSize: '2.5rem' }}>The Student Experience</h2>

                    {/* Simulated Netflix-style Row */}
                    <div style={{ display: 'flex', gap: '1rem', overflow: 'visible', padding: '2rem 0', pointerEvents: 'auto' }}>
                        {[1, 2, 3, 4, 5].map(idx => (
                            <HoverableCard key={idx} idx={idx} />
                        ))}
                    </div>
                </div>
            </Html>

            {/* Ambient light for the scene */}
            <pointLight position={[5, 10, 5]} intensity={0.8} color="#60a5fa" />
        </group>
    );
};
