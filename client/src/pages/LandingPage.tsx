import React from 'react';
import { SmoothScrollLayout } from '../layouts/SmoothScrollLayout';
import { CanvasLayout } from '../layouts/CanvasLayout';
import { Scene01 } from '../scenes/Scene01';
import { Scene03 } from '../scenes/Scene03';
import { Scene04 } from '../scenes/Scene04';
import { Scene06 } from '../scenes/Scene06';
import { Scene07 } from '../scenes/Scene07';
import { Scene08 } from '../scenes/Scene08';
import { ScrollOrchestrator } from '../animations/ScrollOrchestrator';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../components/auth/AuthModal';
import './LandingPage.css';

const LandingPage: React.FC = () => {
    const [isAuthOpen, setIsAuthOpen] = React.useState(false);

    // For UI fading sync on absolute position layers
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

    return (
        <SmoothScrollLayout>
            <CanvasLayout>
                <ScrollOrchestrator />
                <Scene01 />
                <Scene03 />
                <Scene04 />
                <Scene06 />
                <Scene07 />
                <Scene08 />
            </CanvasLayout>

            <div className="ui-layer scroll-trigger-wrapper" style={{ position: 'relative', width: '100%', pointerEvents: 'none', zIndex: 10 }}>
                <nav className="glass-nav" style={{ pointerEvents: 'auto' }}>
                    <div className="nav-logo font-serif">Lumina</div>
                    <div className="nav-links">
                        <Button variant="ghost" onClick={() => setIsAuthOpen(true)}>Explore</Button>
                        <Button variant="primary" onClick={() => setIsAuthOpen(true)}>Sign Up</Button>
                    </div>
                </nav>

                <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <motion.div style={{ opacity, textAlign: 'center' }}>
                        <h1 className="font-serif hero-title" style={{ mixBlendMode: 'difference' }}>
                            The Digital <br /><span className="text-gradient">Library Experience.</span>
                        </h1>
                        <p className="hero-subtitle" style={{ mixBlendMode: 'difference' }}>
                            Immerse yourself. Scroll slowly to unlock the portal.
                        </p>
                    </motion.div>
                </section>

                {/* GSAP Scroll Regions to navigate the Camera inside Three.js */}
                <section style={{ height: '150vh' }}></section>
                <section style={{ height: '150vh' }}></section>
                <section className="scene06-trigger" style={{ height: '100vh' }}></section>
                <section className="scene07-trigger" style={{ height: '100vh' }}></section>
                <section className="scene08-trigger" style={{ height: '100vh', position: 'relative', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10vh' }}>
                    <Button size="lg" variant="primary" style={{ pointerEvents: 'auto' }} onClick={() => setIsAuthOpen(true)}>Enter Digital Portal</Button>
                </section>
            </div>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </SmoothScrollLayout>
    );
};

export default LandingPage;
