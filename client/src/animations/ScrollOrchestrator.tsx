import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ScrollOrchestrator: React.FC = () => {
    const { camera } = useThree();
    const tl = useRef<gsap.core.Timeline>(null);

    useEffect(() => {
        // Build a monolithic GSAP timeline locking the WebGL camera position to standard HTML scroll height

        const masterTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-trigger-wrapper",
                start: "top top",
                end: "bottom bottom",
                scrub: 1, // 1 second smoothing delay
            }
        });

        // Scene 1 -> Scene 3 (Hogwarts) Dive
        masterTimeline.to(camera.position, {
            z: -30, // move deep into the scene towards Hogwarts
            y: -2,
            duration: 1,
            ease: "power2.inOut"
        }, 0);

        // Scene 3 -> Scene 4 (Feature Islands) Traverse
        masterTimeline.to(camera.position, {
            z: -70,
            y: 0,
            duration: 1,
            ease: "power2.inOut"
        }, 1);

        // Scene 4 -> Scene 6 (Telemetry Matrix)
        masterTimeline.to(camera.position, {
            z: -110,
            y: -5,
            duration: 1,
            ease: "power2.inOut"
        }, 2);

        // Scene 6 -> Scene 7 (Netflix Array)
        masterTimeline.to(camera.position, {
            z: -140, // Park directly in front of the Dashboard group
            y: -10,
            duration: 1,
            ease: "power1.inOut"
        }, 3);

        // Scene 7 -> Scene 8 (Glass Analytics)
        masterTimeline.to(camera.position, {
            z: -180,
            y: -15,
            duration: 1,
            ease: "power1.inOut"
        }, 4);

        tl.current = masterTimeline;

        return () => {
            if (tl.current) tl.current.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [camera]);

    return null;
};
