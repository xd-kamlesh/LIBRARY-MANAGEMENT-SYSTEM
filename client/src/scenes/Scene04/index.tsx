import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Float, Torus } from '@react-three/drei';
import * as THREE from 'three';

const FeatureIsland = ({
    position,
    title,
    description,
    color,
    iconNode
}: {
    position: [number, number, number],
    title: string,
    description: string,
    color: string,
    iconNode?: React.ReactNode
}) => {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.5, 0.5]}>
            <group position={position}>
                {/* 3D Base representing the feature */}
                <mesh position={[0, -1, 0]} castShadow>
                    <cylinderGeometry args={[2, 1.5, 0.5, 6]} />
                    <meshStandardMaterial color={color} roughness={0.6} metalness={0.4} opacity={0.8} transparent />
                </mesh>

                {/* Dynamic internal mesh */}
                {iconNode}

                {/* DOM Overlay locked to this 3D point! */}
                <Html
                    position={[0, 1, 0]}
                    center
                    distanceFactor={15}
                    occlude
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="glass-panel" style={{ width: '250px', padding: '1.5rem', textAlign: 'center', opacity: 0.9 }}>
                        <h3 className="font-serif font-bold text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h3>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#e4e4e7' }}>{description}</p>
                    </div>
                </Html>
            </group>
        </Float>
    );
};

export const Scene04: React.FC = () => {
    const portalRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (portalRef.current) {
            portalRef.current.rotation.x = state.clock.elapsedTime * 0.5;
            portalRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <group position={[0, 0, -80]}>
            {/* Ambient light for the feature islands so they maintain linear sleek logic over deep shadows */}
            <ambientLight intensity={0.5} color="#cbd5e1" />

            <FeatureIsland
                position={[-6, 2, 0]}
                title="Inventory"
                description="Live analytics & automated shelf mapping powered by Prisma."
                color="#3b82f6"
                iconNode={
                    <mesh position={[0, 0.5, 0]}>
                        <boxGeometry args={[1, 1.5, 0.3]} />
                        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} />
                    </mesh>
                }
            />

            <FeatureIsland
                position={[6, 0, -5]}
                title="Librarian AI"
                description="Floating holograms interpreting circulation data in real time."
                color="#8b5cf6"
                iconNode={
                    <mesh position={[0, 0.5, 0]}>
                        <octahedronGeometry args={[0.8]} />
                        <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={2} wireframe />
                    </mesh>
                }
            />

            <FeatureIsland
                position={[0, -4, -10]}
                title="Magic QR"
                description="Hassle-free automated book reservations via mobile scanning."
                color="#10b981"
                iconNode={
                    <Torus ref={portalRef as any} args={[1, 0.1, 16, 100]} position={[0, 0.5, 0]}>
                        <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={5} />
                    </Torus>
                }
            />
        </group>
    );
};
