import { useNavigate } from 'react-router-dom';
import { Recycle, Zap, Award, Info, ChevronRight, BarChart3, Globe, Shield } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { MotionNavbar } from '../components/ui/Navbar';
import { motion } from 'framer-motion';

export default function LandingPage() {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            {/* Header / Nav */}
            <MotionNavbar
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                showLinks={true}
            />



            {/* Hero Section */}
            <section className="relative px-8 pt-8 md:pt-12 overflow-hidden border-b-4 border-black min-h-[calc(100vh-100px)] flex flex-col">
                {/* Background Decoration - Inspiration from design */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Dot Grid */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                        opacity: 0.4
                    }} />

                    {/* Gradient Glows - Hidden on mobile for cleaner look */}
                    <div className="hidden md:block absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20"
                        style={{ backgroundColor: 'var(--color-pastel-coral)' }} />
                    <div className="hidden md:block absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[130px] opacity-20"
                        style={{ backgroundColor: 'var(--color-pastel-blue)' }} />
                    <div className="hidden md:block absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-10"
                        style={{ backgroundColor: 'var(--color-pastel-yellow)' }} />
                </div>

                <div className="container mx-auto max-w-6xl flex-1 flex flex-col justify-center mb-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl"
                    >
                        <Badge variant="coral" className="mb-4 px-4 py-1 text-xs font-black uppercase tracking-widest">
                            Built for Change
                        </Badge>
                        <h1 className="text-6xl md:text-[8rem] font-black mb-4 leading-[0.85] tracking-tighter uppercase italic">
                            REVERSE <br />
                            <span style={{ color: 'var(--color-pastel-coral)', WebkitTextStroke: '2px black' }}>THE TRASH</span>
                        </h1>
                        <p className="text-lg md:text-xl mb-8 max-w-xl font-medium leading-tight text-gray-700">
                            The first AI-powered platform for sustainable e-waste harvesting. Extract value, save the planet, and power your next project.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <Button
                                variant="primary"
                                size="lg"
                                className="h-16 px-8 text-xl group border-b-[6px] border-gray-800 active:border-b-0 active:translate-y-[2px] transition-all"
                                onClick={() => navigate('/devices')}
                            >
                                Start Harvesting
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="h-16 px-8 text-xl border-b-[6px] border-black active:border-b-0 active:translate-y-[2px] transition-all"
                                onClick={() => navigate('/marketplace')}
                            >
                                Marketplace
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Scrolling Banner - Solid Screen-Edge Anchor */}
                <div className="full-bleed bg-black text-white py-3 sm:py-4 border-t-4 border-black overflow-hidden whitespace-nowrap z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.2)]" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', maxWidth: '100vw' }}>
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="flex gap-8 sm:gap-16 md:gap-24 text-xs sm:text-sm md:text-base font-black uppercase tracking-widest italic"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-pastel-coral"><Globe className="w-4 h-4 sm:w-5 sm:h-5" /> 4,200kg E-Waste Saved</div>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-pastel-yellow"><Zap className="w-4 h-4 sm:w-5 sm:h-5" /> 12,000 Components Harvested</div>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-pastel-blue"><Award className="w-4 h-4 sm:w-5 sm:h-5" /> ₹1.2Cr Community Value</div>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-pastel-peach"><Shield className="w-4 h-4 sm:w-5 sm:h-5" /> AI Verified Components</div>
                        {/* Duplicate */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-pastel-coral"><Globe className="w-4 h-4 sm:w-5 sm:h-5" /> 4,200kg E-Waste Saved</div>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-pastel-yellow"><Zap className="w-4 h-4 sm:w-5 sm:h-5" /> 12,000 Components Harvested</div>
                    </motion.div>
                </div>
            </section>



            {/* Features Section */}
            <section className="px-8 py-20 container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <h2 className="text-[5rem] font-black uppercase italic tracking-tighter leading-none">
                        How It <br />
                        <span style={{ color: 'var(--color-pastel-blue)' }}>Works</span>
                    </h2>
                    <p className="max-w-md text-xl opacity-70 font-medium leading-tight">
                        We've simplified the complex process of e-waste dismantling into a gamified, AI-guided experience from start to finish.
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    <Card variant="pastel-blue" className="group" delay={0.1}>
                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-black flex items-center justify-center mb-6 rotate-3 group-hover:rotate-12 transition-transform">
                            <Info className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">01. Blueprint</h3>
                        <p className="text-lg opacity-80 leading-snug">Expert-verified blueprints for thousands of consumer devices. Follow step-by-step with safety gates.</p>
                    </Card>
                    <Card variant="pastel-coral" className="group" delay={0.2}>
                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-black flex items-center justify-center mb-6 -rotate-3 group-hover:-rotate-12 transition-transform">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">02. Verify</h3>
                        <p className="text-lg opacity-80 leading-snug">Extract a part, snap a photo. Our Gemini Vision AI verifies authenticity and condition instantly.</p>
                    </Card>
                    <Card variant="pastel-yellow" className="group" delay={0.3}>
                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-black flex items-center justify-center mb-6 rotate-6 group-hover:rotate-0 transition-transform">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">03. Marketplace</h3>
                        <p className="text-lg opacity-80 leading-snug">List your verified parts or donate to STEM labs in exchange for global XP and community rewards.</p>
                    </Card>
                </motion.div>
            </section>

            {/* Large Feature Banner */}
            <section className="px-8 mb-20">
                <div className="mobile-no-side-borders container mx-auto max-w-6xl grid md:grid-cols-2 bg-black border-y-4 lg:border-4 border-black group transition-all duration-300">
                    <div className="bg-white p-8 sm:p-12 flex flex-col justify-center transition-all duration-300">
                        <Badge variant="blue" className="mb-6 w-fit">AI ECOSYSTEM</Badge>
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6 transition-all duration-300">Built with Gemini 2.0 Flash</h2>
                        <p className="text-xl opacity-70 mb-8 font-medium transition-all duration-300">Our vision system doesn't just recognize parts; it grades them for circularity, estimates remaining lifespan, and suggests the best secondary use case.</p>
                        <Button variant="primary" size="md" className="w-fit">View AI Docs</Button>
                    </div>
                    <div className="bg-pastel-peach p-8 sm:p-12 flex flex-col items-center justify-center gap-4 sm:gap-6 overflow-hidden transition-all duration-300">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border-2 border-black border-dashed rounded-full flex items-center justify-center transition-all duration-300"
                        >
                            <Recycle className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 transition-all duration-300" />
                        </motion.div>
                        <div className="text-center px-4">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all duration-300">98.4% Identification Accuracy</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-16 border-t-4 border-black bg-white">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between gap-12">
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 mb-6">
                            <Recycle className="w-8 h-8" />
                            <span className="text-xl font-bold italic">RELOOP</span>
                        </div>
                        <p className="text-sm font-medium opacity-60">Architecting the zero-waste future for electronics. One component at a time.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                        <div>
                            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Platform</h4>
                            <ul className="text-sm space-y-2 font-medium opacity-60">
                                <li className="hover:opacity-100 cursor-pointer">Devices</li>
                                <li className="hover:opacity-100 cursor-pointer">Marketplace</li>
                                <li className="hover:opacity-100 cursor-pointer">Leaderboard</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Connect</h4>
                            <ul className="text-sm space-y-2 font-medium opacity-60">
                                <li className="hover:opacity-100 cursor-pointer">Donate</li>
                                <li className="hover:opacity-100 cursor-pointer">STEM Labs</li>
                                <li className="hover:opacity-100 cursor-pointer">Twitter/X</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Base</h4>
                            <ul className="text-sm space-y-2 font-medium opacity-60">
                                <li className="hover:opacity-100 cursor-pointer">Privacy</li>
                                <li className="hover:opacity-100 cursor-pointer">Terms</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto max-w-6xl mt-24 pt-8 border-t-2 border-black flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                    <div>© 2026 RELOOP</div>
                    <div>SECURED BY GOOGLE CLOUD</div>
                </div>
            </footer>
        </div>
    );
}
