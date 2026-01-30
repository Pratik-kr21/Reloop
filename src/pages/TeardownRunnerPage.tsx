import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Recycle, ArrowLeft, ArrowRight, AlertTriangle, Loader2, BookOpen, ShieldCheck, ZapOff, ShieldAlert } from 'lucide-react';
import { Button, Card, Badge, Navbar } from '../components/ui';
import SafetyGate from '../components/SafetyGate';
import EducationalContext from '../components/EducationalContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import OptimizedImage from '../components/ui/OptimizedImage';

type Device = Database['public']['Tables']['devices']['Row'] & {
    device_components: Database['public']['Tables']['device_components']['Row'][];
};
type Step = Database['public']['Tables']['teardown_steps']['Row'];

const getHazardColor = (level: string) => {
    switch (level) {
        case 'high': return 'var(--color-pastel-coral)';
        case 'medium': return 'var(--color-pastel-yellow)';
        default: return 'var(--color-pastel-blue)';
    }
};

export default function TeardownRunnerPage() {
    const navigate = useNavigate();
    const { deviceId } = useParams();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const [device, setDevice] = useState<Device | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showSafetyGate, setShowSafetyGate] = useState(false);
    const [safetyAcknowledged, setSafetyAcknowledged] = useState<Record<string, boolean>>({});

    // AI Verification State


    useEffect(() => {
        const fetchDeviceData = async () => {
            if (!deviceId) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('devices')
                    .select('*, device_components(*)')
                    .eq('id', deviceId)
                    .single();

                if (error) throw error;
                setDevice(data as Device);

                const { data: stepsData, error: stepsError } = await supabase
                    .from('teardown_steps')
                    .select('*')
                    .eq('device_id', deviceId)
                    .order('step_number', { ascending: true });

                if (stepsError) throw stepsError;
                setSteps(stepsData);
            } catch (err) {
                console.error('Error fetching device:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDeviceData();
    }, [deviceId]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStepIndex]);

    const currentStep = steps[currentStepIndex];
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-pastel-coral" />
                <p className="font-black uppercase tracking-widest text-gray-400">Syncing Steps...</p>
            </div>
        );
    }

    if (!device || steps.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center p-12 border-4 border-black rounded-3xl">
                    <h1 className="text-4xl font-black uppercase italic mb-4">Teardown Not Available</h1>
                    <p className="mb-8 font-medium text-gray-500">
                        We haven't mapped this device yet. Stay tuned for updates!
                    </p>
                    <Button onClick={() => navigate('/devices')}>
                        Back to Catalog
                    </Button>
                </div>
            </div>
        );
    }

    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const handleNext = () => {
        if (isLastStep) {
            navigate(`/device/${deviceId}/complete?sessionId=${sessionId}`);
            return;
        }

        const nextStep = steps[currentStepIndex + 1];
        if (nextStep.has_safety_gate && !safetyAcknowledged[nextStep.id]) {
            setShowSafetyGate(true);
        } else {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleSafetyAcknowledge = () => {
        const nextStep = steps[currentStepIndex + 1];
        setSafetyAcknowledged(prev => ({ ...prev, [nextStep.id]: true }));
        setShowSafetyGate(false);
        setCurrentStepIndex(currentStepIndex + 1);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Step {currentStepIndex + 1} of {steps.length}</span>
                        <div className="w-32 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden border border-black/5">
                            <motion.div
                                className="h-full bg-pastel-coral"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
                <Button variant="secondary" size="md" onClick={() => navigate('/devices')}>Exit Session</Button>
            </Navbar>

            <div className="container mx-auto px-8 py-12">
                <div className="grid lg:grid-cols-2 gap-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="coral" className="text-[10px] font-black tracking-widest px-2">STAGE 0{currentStepIndex + 1}</Badge>
                                </div>
                                <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">{currentStep.title}</h1>
                                {currentStep.has_safety_gate && (
                                    <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-pastel-coral/10 border-2 border-pastel-coral rounded-xl inline-flex text-pastel-coral">
                                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                                        <span className="font-black uppercase tracking-widest text-xs">
                                            Safety Check Required
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Card variant="white" padding="lg" className="mb-8 border-b-8">
                                <p className="text-xl font-medium text-gray-600 leading-relaxed italic">"{currentStep.description}"</p>
                            </Card>

                            {currentStep.image_url ? (
                                <div className="aspect-video rounded-[2.5rem] mb-8 overflow-hidden border-4 border-black group relative">
                                    <OptimizedImage
                                        src={currentStep.image_url}
                                        alt={currentStep.title}
                                        className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                                        objectFit="cover"
                                        fallback={
                                            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center">
                                                <Recycle className="w-20 h-20 text-gray-200" />
                                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-300 mt-4">Visual Guide Unavailable</p>
                                            </div>
                                        }
                                    />
                                </div>
                            ) : currentStep.instructions && (currentStep.instructions as string[]).length > 0 ? (
                                <Card variant="pastel-yellow" padding="lg" className="mb-8 border-4 border-b-[12px] rotate-[-1deg] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                        <BookOpen className="w-24 h-24" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge variant="black" className="text-[10px] tracking-[0.2em]">WRITTEN GUIDE</Badge>
                                        </div>
                                        <ul className="space-y-4">
                                            {(currentStep.instructions as string[]).map((inst, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex gap-4 items-start"
                                                >
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-black">
                                                        {i + 1}
                                                    </span>
                                                    <p className="font-bold text-gray-800 leading-tight">{inst}</p>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                </Card>
                            ) : (
                                <div className="aspect-video bg-gray-50 rounded-[2.5rem] mb-8 flex flex-col items-center justify-center border-4 border-dashed border-gray-200 group">
                                    <Recycle className="w-20 h-20 text-gray-100 group-hover:rotate-12 transition-transform duration-500" />
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-300 mt-4">Visual Guide Inbound</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6 mt-12">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={handlePrevious}
                                    disabled={isFirstStep}
                                    className="h-16 text-xl font-black uppercase italic tracking-tighter"
                                >
                                    <ArrowLeft className="w-6 h-6 mr-2" />
                                    Prev
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleNext}
                                    className="h-16 text-xl font-black uppercase italic tracking-tighter border-b-4 active:border-b-0"
                                >
                                    {isLastStep ? 'Finalize' : 'Next'}
                                    {!isLastStep && <ArrowRight className="w-6 h-6 ml-2" />}
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-12"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Safety Protocol</h2>
                                <div className="h-px flex-1 bg-black/5" />
                            </div>

                            <Card
                                variant="white"
                                padding="lg"
                                className="border-4 border-black border-b-[12px] relative overflow-hidden group"
                                style={{ borderColor: getHazardColor(currentStep.hazard_level || 'low') }}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                                    <ShieldAlert className="w-24 h-24" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shrink-0">
                                            {currentStep.hazard_level === 'high' ? <ShieldAlert className="w-6 h-6 text-pastel-coral" /> : <ShieldCheck className="w-6 h-6 text-green-400" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Threat Level</p>
                                            <p className="text-xl font-black uppercase italic tracking-tighter" style={{ color: getHazardColor(currentStep.hazard_level || 'low') }}>
                                                {currentStep.hazard_level?.toUpperCase() || 'MODEST'} RISK
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className={cn(
                                            "p-3 rounded-xl border-2 flex flex-col gap-1 transition-colors",
                                            currentStep.power_off_required ? "border-pastel-yellow bg-pastel-yellow/5" : "border-black/5 bg-gray-50 opacity-40"
                                        )}>
                                            <ZapOff className={cn("w-4 h-4", currentStep.power_off_required ? "text-pastel-yellow" : "text-gray-300")} />
                                            <span className="text-[9px] font-black uppercase">Power Down</span>
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-xl border-2 flex flex-col gap-1 transition-colors",
                                            (currentStep.ppe_required as string[])?.length ? "border-pastel-blue bg-pastel-blue/5" : "border-black/5 bg-gray-50 opacity-40"
                                        )}>
                                            <ShieldCheck className={cn("w-4 h-4", (currentStep.ppe_required as string[])?.length ? "text-pastel-blue" : "text-gray-300")} />
                                            <span className="text-[9px] font-black uppercase">PPE Gears</span>
                                        </div>
                                    </div>

                                    {currentStep.safety_warnings && (currentStep.safety_warnings as string[]).length > 0 && (
                                        <div className="p-4 bg-red-50 border-2 border-pastel-coral/20 rounded-xl">
                                            <ul className="space-y-2">
                                                {(currentStep.safety_warnings as string[]).map((warn, i) => (
                                                    <li key={i} className="flex gap-2 items-start text-[10px] font-bold text-red-800 leading-tight">
                                                        <span className="text-pastel-coral">•</span>
                                                        {warn}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        <div className="space-y-12">
                            {currentStep.educational_context ? (
                                <motion.div
                                    key={`edu-${currentStepIndex}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center gap-2 mb-6">
                                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-pastel-coral">The Science Behind It</h2>
                                        <div className="h-px flex-1 bg-black/10" />
                                    </div>
                                    <EducationalContext {...(currentStep.educational_context as any)} />
                                </motion.div>
                            ) : (
                                <div>
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-pastel-coral mb-8">Harvest Progress</h2>
                                    <Card variant="pastel-blue" padding="lg" className="border-4 rotate-1 border-black border-b-[12px]">
                                        <div className="space-y-8">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Stage</p>
                                                <p className="text-5xl font-black italic tracking-tighter leading-none">{currentStepIndex + 1} <span className="text-2xl font-normal opacity-20">/ {steps.length}</span></p>
                                            </div>
                                            <div className="pt-8 border-t-2 border-black/10">
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Total Yield</p>
                                                <p className="text-5xl font-black italic tracking-tighter leading-none text-pastel-coral">₹{parseFloat(String(device.total_value)).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="mt-12">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 font-primary">Targets Remaining</h3>
                                        <div className="grid gap-4">
                                            {device.device_components.map((comp) => (
                                                <motion.div
                                                    key={comp.id}
                                                    whileHover={{ x: 5 }}
                                                >
                                                    <Card
                                                        variant="white"
                                                        padding="sm"
                                                        className="flex items-center justify-between border-2 border-black border-b-8 hover:border-b-4 transition-all"
                                                    >
                                                        <span className="text-xs font-black uppercase italic">{comp.name}</span>
                                                        <span className="text-lg font-black text-pastel-coral">₹{parseFloat(String(comp.value)).toLocaleString('en-IN')}</span>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showSafetyGate && steps[currentStepIndex + 1]?.safety_warnings && (
                    <SafetyGate
                        warnings={steps[currentStepIndex + 1].safety_warnings!}
                        onAcknowledge={handleSafetyAcknowledge}
                        onCancel={() => setShowSafetyGate(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
