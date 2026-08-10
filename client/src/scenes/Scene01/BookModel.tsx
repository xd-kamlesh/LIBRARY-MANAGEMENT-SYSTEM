import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as THREE from 'three';

export const BookModel: React.FC = () => {
    const groupRef = useRef<Group>(null);
    const targetRotation = useRef(new THREE.Vector2(0, 0));

    // Smooth mouse parallax rotation tracking
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Target rotation based on mouse coordinates (-1 to 1)
        targetRotation.current.x = (state.pointer.y * 0.2);
        targetRotation.current.y = (state.pointer.x * 0.3);

        // Lerp rotation smoothly
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, delta * 3);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, delta * 3);
    });

    return (
        <group ref={groupRef}>
            {/* The Hardcover Binding */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 4, 0.5]} />
                <meshStandardMaterial
                    color="#0a0a0c"
                    roughness={0.7}
                    metalness={0.8}
                    envMapIntensity={2}
                />
            </mesh>

            {/* The Pages Insert */}
            <mesh position={[0.1, 0, 0]} castShadow>
                <boxGeometry args={[2.8, 3.8, 0.45]} />
                <meshStandardMaterial
                    color="#f4f4f5"
                    roughness={1}
                    metalness={0}
                />
            </mesh>

            {/* Gold Leaf Accent */}
            <mesh position={[-1.48, 0, 0]} castShadow>
                <boxGeometry args={[0.05, 4, 0.5]} />
                <meshStandardMaterial
                    color="#d4af37"
                    roughness={0.3}
                    metalness={1}
                />
            </mesh>
        </group>
    );
};
