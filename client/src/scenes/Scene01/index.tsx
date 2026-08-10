import React from 'react';
import { Float, Sparkles, SpotLight, Environment } from '@react-three/drei';
import { BookModel } from './BookModel';

export const Scene01: React.FC = () => {
    return (
        <group>
            <Environment preset="city" />

            {/* Ambient Lighting & Shadows */}
            <ambientLight intensity={0.4} />
            <SpotLight
                position={[0, 5, 5]}
                angle={0.5}
                penumbra={1}
                intensity={5}
                color="#ffffff"
                castShadow
            />

            {/* Cinematic Volumetric Light Ray */}
            <SpotLight
                position={[-5, 5, -2]}
                angle={0.4}
                penumbra={1}
                intensity={4}
                color="#a855f7"
                volumetric
                attenuation={20}
                anglePower={5}
            />

            {/* Floating Dust Particles mapped across the viewport */}
            <Sparkles
                count={200}
                scale={10}
                size={2}
                speed={0.2}
                opacity={0.3}
                color="#ffffff"
            />

            {/* Slow, ambient, cinematic floating motion */}
            <Float
                speed={1.5}
                rotationIntensity={0.2}
                floatIntensity={0.5}
                floatingRange={[-0.2, 0.2]}
            >
                <BookModel />
            </Float>
        </group>
    );
};
