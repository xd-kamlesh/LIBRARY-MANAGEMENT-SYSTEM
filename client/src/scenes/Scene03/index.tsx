import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Scene03: React.FC = () => {
    // InstancedMesh for performance rendering "Thousands of books"
    const bookCount = 3000;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const lightGlow = useRef<THREE.PointLight>(null);

    // Warm Hogwarts lighting color palette
    const colors = useMemo(() => [
        new THREE.Color('#451a03'), // deep brown
        new THREE.Color('#78350f'), // warm leather
        new THREE.Color('#b45309'), // gold/orange
        new THREE.Color('#1e1b4b'), // midnight blue
        new THREE.Color('#0f172a'), // slate
    ], []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Setup initial matrices on first frame
        if (meshRef.current.userData.initialized !== true) {
            meshRef.current.userData.initialized = true;
            for (let i = 0; i < bookCount; i++) {
                // Arrange them in massive tunnel-like arches/bookshelves
                const angle = Math.random() * Math.PI * 2;
                const radius = 10 + Math.random() * 15; // wide tunnel
                const z = (Math.random() * -150) - 20; // deep along z-axis (-20 to -170)

                const x = Math.cos(angle) * (radius + (Math.random() * 5));
                const y = Math.sin(angle) * (radius + (Math.random() * 5)) + 10;

                dummy.position.set(x, y, z);

                // Random rotations to look like hovering chaotic magic
                dummy.rotation.x = Math.random() * Math.PI;
                dummy.rotation.y = Math.random() * Math.PI;
                dummy.rotation.z = Math.random() * Math.PI;

                dummy.scale.set(0.3, 0.4, 0.05); // Book shape

                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);

                // Allocate random colors from the Hogwarts palette
                meshRef.current.setColorAt(i, colors[Math.floor(Math.random() * colors.length)]);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
            meshRef.current.instanceColor!.needsUpdate = true;
        }

        // Add subtle floating oscillation to the library structure over time
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;

        // Pulse the main warm light
        if (lightGlow.current) {
            lightGlow.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 2) * 1.5;
        }
    });

    return (
        <group position={[0, -2, -30]}>
            <fog attach="fog" args={['#020205', 10, 100]} />

            <pointLight ref={lightGlow} position={[0, 5, -20]} distance={50} color="#fbbf24" intensity={3} castShadow />
            <pointLight position={[0, -10, -50]} distance={80} color="#ec4899" intensity={2} />

            <instancedMesh ref={meshRef} args={[undefined, undefined, bookCount]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    roughness={0.8}
                    metalness={0.2}
                />
            </instancedMesh>
        </group>
    );
};
