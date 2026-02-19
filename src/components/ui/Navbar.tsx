import { useNavigate, useLocation } from 'react-router-dom';
import { Recycle, Loader2, LogOut, User, BookOpen, ShoppingBag, Trophy, Menu, X } from 'lucide-react';
import { Button } from './index';
import { useAuthStore } from '../../lib/auth.store';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface NavbarProps {
    className?: string;
    showLinks?: boolean;
    children?: React.ReactNode;
}

export default function Navbar({ className, showLinks = true, children }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, signOut } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setMobileMenuOpen(false);
        navigate('/');
    };

    const NavContent = (
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <Recycle className="w-8 h-8 text-pastel-green" />
                <span className="text-xl font-bold tracking-tighter uppercase flex items-center">
                    RELOOP
                </span>
            </button>

            {showLinks && (
                <div className="hidden lg:flex items-center gap-8">
                    <button
                        onClick={() => navigate('/devices')}
                        className={cn(
                            "flex items-center gap-2 font-bold text-sm uppercase tracking-wider hover:text-pastel-coral transition-colors",
                            location.pathname === '/devices' && "text-pastel-coral"
                        )}
                    >
                        <BookOpen className="w-4 h-4" />
                        Devices
                    </button>
                    <button
                        onClick={() => navigate('/marketplace')}
                        className={cn(
                            "flex items-center gap-2 font-bold text-sm uppercase tracking-wider hover:text-pastel-blue transition-colors",
                            location.pathname === '/marketplace' && "text-pastel-blue"
                        )}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Marketplace
                    </button>
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className={cn(
                            "flex items-center gap-2 font-bold text-sm uppercase tracking-wider hover:text-pastel-yellow transition-colors",
                            location.pathname === '/leaderboard' && "text-pastel-yellow"
                        )}
                    >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                    </button>
                </div>
            )}

            <div className="hidden lg:flex items-center gap-4">
                {children}
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : user ? (
                    <>
                        <Button variant="secondary" size="md" onClick={() => navigate('/profile')}>
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </Button>
                        <button
                            onClick={handleSignOut}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5 text-gray-500 hover:text-red-500" />
                        </button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" size="md" onClick={() => navigate('/login')}>Login</Button>
                        <Button variant="primary" size="md" onClick={() => navigate('/signup')}>Sign Up</Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            <nav className={cn("sticky top-0 bg-white border-b-2 border-black px-8 py-4 z-50", className)}>
                {NavContent}

                {/* Mobile Menu Button */}
                {showLinks && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden fixed top-4 right-4 z-[60] w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(244,189,176,1)] border-2 border-black active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-[transform,box-shadow] duration-150 will-change-transform"
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                )}
            </nav>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {mobileMenuOpen && showLinks && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white border-l-4 border-black z-[55] lg:hidden overflow-y-auto shadow-[-8px_0_16px_rgba(0,0,0,0.1)] will-change-transform"
                    >
                        <div className="p-8 flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <Recycle className="w-6 h-6" />
                                    <span className="text-lg font-bold tracking-tighter uppercase">RELOOP</span>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        navigate('/devices');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 font-bold text-lg uppercase tracking-wider p-4 rounded-xl border-2 border-black transition-all hover:bg-pastel-blue/20",
                                        location.pathname === '/devices' && "bg-pastel-blue text-black"
                                    )}
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Devices
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/marketplace');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 font-bold text-lg uppercase tracking-wider p-4 rounded-xl border-2 border-black transition-all hover:bg-pastel-blue/20",
                                        location.pathname === '/marketplace' && "bg-pastel-blue text-black"
                                    )}
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Marketplace
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/leaderboard');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 font-bold text-lg uppercase tracking-wider p-4 rounded-xl border-2 border-black transition-all hover:bg-pastel-yellow/20",
                                        location.pathname === '/leaderboard' && "bg-pastel-yellow text-black"
                                    )}
                                >
                                    <Trophy className="w-5 h-5" />
                                    Leaderboard
                                </button>
                            </div>

                            {/* Auth Actions */}
                            <div className="flex flex-col gap-4 mt-8 pt-8 border-t-2 border-black">
                                {loading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                    </div>
                                ) : user ? (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            className="w-full justify-start"
                                            onClick={() => {
                                                navigate('/profile');
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <User className="w-5 h-5 mr-2" />
                                            Profile
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            className="w-full justify-start"
                                            onClick={handleSignOut}
                                        >
                                            <LogOut className="w-5 h-5 mr-2" />
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            className="w-full"
                                            onClick={() => {
                                                navigate('/login');
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full"
                                            onClick={() => {
                                                navigate('/signup');
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Sign Up
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 z-[54] md:hidden will-change-opacity"
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// Export a motion version for the landing page
export const MotionNavbar = motion.create(Navbar);
