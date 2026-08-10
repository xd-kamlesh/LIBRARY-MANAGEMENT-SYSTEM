import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';


interface CanvasLayoutProps {
    children: React.ReactNode;
}

export const CanvasLayout: React.FC<CanvasLayoutProps> = ({ children }) => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 45 }}
                gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#000000']} />
                {/* Global Lighting Placeholder */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {children}



                <Preload all />
            </Canvas>
        </div>
    );
};
