import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchGeminiPricing, verifyComponentWithGemini } from '../lib/gemini';
import { Heart, DollarSign, Trash2, Loader2, Sparkles, CheckCircle, AlertTriangle, Receipt, Info, Globe, Truck } from 'lucide-react';
import { Button, Card, Badge, Navbar } from '../components/ui';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../components/ImageUpload';
import { cn, processImageForGemini } from '../lib/utils';

type Device = Database['public']['Tables']['devices']['Row'] & {
    device_components: Database['public']['Tables']['device_components']['Row'][];
};

export default function TeardownCompletePage() {
    const navigate = useNavigate();
    const { deviceId } = useParams();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<Record<string, 'idle' | 'verifying' | 'verified' | 'failed'>>({});
    const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});
    const [decisions, setDecisions] = useState<Record<string, 'resell' | 'donate' | 'recycle' | null>>({});
    const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Derived state for verified count
    const verifiedCount = device?.device_components.filter(c => verificationStatus[c.id] === 'verified').length || 0;
    const [bonusXP, setBonusXP] = useState(0);
    const [pricesINR, setPricesINR] = useState<Record<string, number>>({});
    const [totalYieldINR, setTotalYieldINR] = useState<number | null>(null);
    const [evaluating, setEvaluating] = useState(false);

    useEffect(() => {
        const fetchDevice = async () => {
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
            } catch (err) {
                console.error('Error fetching device:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDevice();
    }, [deviceId]);

    useEffect(() => {
        const evaluateComponents = async () => {
            if (!device || device.device_components.length === 0 || evaluating) return;
            setEvaluating(true);

            // First, set fallback values immediately to avoid showing "---"
            const fallbackMapping: Record<string, number> = {};
            let fallbackTotal = 0;
            device.device_components.forEach(c => {
                // Values in database are already in INR for the Indian market
                const inrValue = Math.ceil(parseFloat(String(c.value)));
                fallbackMapping[c.id] = inrValue;
                fallbackTotal += inrValue;
            });

            // Set fallback values immediately
            setPricesINR(fallbackMapping);
            setTotalYieldINR(fallbackTotal);

            try {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

                if (!apiKey) {
                    console.log('No Gemini API key found, using fallback pricing');
                    setEvaluating(false);
                    return;
                }

                const componentList = device.device_components.map(c => `- ${c.name} (${c.type}), current market estimate: ₹${c.value}`).join('\n');
                const prompt = `You are a gadget valuation expert for the Indian secondary market.
Estimate the realistic resale values in INR for these specific components harvested from a "${device.name}".
Consider the current Indian market conditions, demand, and component condition.
Return ONLY JSON with a mapping of component name to value in INR (as numbers), and a "total_yield_inr" field.

Components:
${componentList}

Example format:
{
  "Component Name": 2500,
  "Another Component": 4200,
  "total_yield_inr": 6700
}`;

                const parsed = await fetchGeminiPricing(prompt);

                const mapping: Record<string, number> = {};
                let hasValidData = false;

                device.device_components.forEach(c => {
                    if (parsed[c.name] && typeof parsed[c.name] === 'number') {
                        mapping[c.id] = Math.ceil(parsed[c.name]);
                        hasValidData = true;
                    } else {
                        mapping[c.id] = fallbackMapping[c.id];
                    }
                });

                if (hasValidData) {
                    setPricesINR(mapping);
                    const total = parsed.total_yield_inr || Object.values(mapping).reduce((a, b) => a + b, 0);
                    setTotalYieldINR(Math.ceil(total));
                    console.log('Successfully got AI pricing for Indian market');
                }
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    console.log('Request timed out, using database pricing');
                } else {
                    console.warn('AI Valuation failed:', err.message);
                }
                // Initial database values are already set
            } finally {
                setEvaluating(false);
            }
        };

        if (device && device.device_components.length > 0) {
            evaluateComponents();
        }
    }, [device]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-pastel-coral" />
                <p className="font-black uppercase tracking-widest text-gray-400">Finalizing Session...</p>
            </div>
        );
    }

    if (!device) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center p-12 border-4 border-black rounded-3xl">
                    <h1 className="text-4xl font-black uppercase italic mb-4">Device Not Found</h1>
                    <Button onClick={() => navigate('/devices')}>
                        Back to Catalog
                    </Button>
                </div>
            </div>
        );
    }

    const awardXP = async (amount: number) => {
        setBonusXP(prev => prev + amount);

        // Try to persist if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: userData } = await supabase.from('users').select('xp').eq('id', user.id).single();
            if (userData) {
                await supabase.from('users').update({ xp: (userData.xp || 0) + amount }).eq('id', user.id);
            }
        }
    };

    const saveVerificationToDB = async (componentId: string, status: 'verified' | 'rejected', xp: number, imageUrl?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn('Cannot save verification: No user found');
                return;
            }

            console.log(`Saving verification to DB for ${componentId}: ${status}`);
            const { error } = await supabase.from('component_verifications').upsert({
                user_id: user.id,
                component_id: componentId,
                status: status === 'verified' ? 'verified' : 'rejected',
                teardown_session_id: sessionId,
                xp_awarded: xp,
                image_url: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200',
                verified_at: status === 'verified' ? new Date().toISOString() : null,
                manual_verified: true // Tag as manually verified for bypasses
            } as any, { onConflict: 'user_id, component_id' });

            if (error) {
                console.error('Database insert error in saveVerificationToDB:', error);
            } else {
                console.log('Verification saved successfully');
            }
        } catch (err) {
            console.error('Caught error in saveVerificationToDB:', err);
        }
    };

    const handleComponentVerify = async (componentId: string, file: File) => {
        if (!device) return;
        const component = device.device_components.find(c => c.id === componentId);
        if (!component) return;

        setVerificationStatus(prev => ({ ...prev, [componentId]: 'verifying' }));

        try {
            // Process image to standardized JPEG (fixes AVIF/HEIC issues)
            const { base64: base64Image, mimeType } = await processImageForGemini(file);
            const fullDataUrl = `data:${mimeType};base64,${base64Image}`;
            setCapturedImages(prev => ({ ...prev, [componentId]: fullDataUrl }));

            let data: any = null;
            let error: any = null;
            try {
                data = await verifyComponentWithGemini(base64Image, device.name, component.name, mimeType);
            } catch (err) {
                error = err;
            }

            if (error || data?.status !== 'verified') {
                // Check for quota exceeded and offer bypass for demo
                // Enhanced check for various 429 signatures
                const isQuotaError =
                    error?.message?.includes('429') ||
                    error?.message?.includes('quota') ||
                    error?.message?.includes('Failed to load resource') ||
                    error?.context?.status === 429 ||
                    data?.error?.includes('quota') ||
                    data?.code === 429;

                if (isQuotaError || error) { // Also fallback on network errors for demo stability
                    console.log('Gemini Quota Exceeded - Failing gracefully');
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    setVerificationStatus(prev => ({ ...prev, [componentId]: 'failed' }));
                    setVerificationResults(prev => ({
                        ...prev,
                        [componentId]: {
                            reasoning: 'AI Service Busy (Quota Exceeded). Please verify manually.'
                        }
                    }));
                    // Save as failed/rejected in DB
                    saveVerificationToDB(componentId, 'rejected', 0);
                    return;
                }

                // AI Result mismatch
                setVerificationResults(prev => ({ ...prev, [componentId]: data }));
                setVerificationStatus(prev => ({ ...prev, [componentId]: data.status }));

                if (data.status === 'verified') {
                    awardXP(250);
                    saveVerificationToDB(componentId, 'verified', 250, fullDataUrl);
                    setNotification({ message: `${component.name} Verified Successfully!`, type: 'success' });
                } else if (data.status === 'mismatch') {
                    saveVerificationToDB(componentId, 'rejected', 0, fullDataUrl);
                    setNotification({ message: 'Verification Mismatch: Unrelated Image Detected', type: 'error' });
                }
            } else if (data?.status === 'verified') {
                // Success case
                setVerificationResults(prev => ({ ...prev, [componentId]: data }));
                setVerificationStatus(prev => ({ ...prev, [componentId]: data.status }));
                awardXP(250);
                saveVerificationToDB(componentId, 'verified', 250, fullDataUrl);
                setNotification({ message: `${component.name} Verified Successfully!`, type: 'success' });
            }
        } catch (err: any) {
            console.error('Verification error:', err);

            // Check for quota/rate-limit errors in the catch block too
            const isQuotaError =
                err?.message?.includes('429') ||
                err?.message?.includes('quota') ||
                err?.message?.includes('Failed to load resource') ||
                err?.status === 429;

            if (isQuotaError) {
                console.log('Gemini Quota Exceeded (Caught) - Failing gracefully');
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Fail the verification but allow manual override
                setVerificationStatus(prev => ({ ...prev, [componentId]: 'failed' }));
                setVerificationResults(prev => ({
                    ...prev,
                    [componentId]: {
                        reasoning: 'AI Service Busy (Quota Exceeded). Please verify manually.'
                    }
                }));
                return;
            }

            setVerificationStatus(prev => ({ ...prev, [componentId]: 'failed' }));
        }
    };

    const handleFinish = async () => {
        if (sessionId) {
            await supabase.from('teardown_sessions')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                } as any)
                .eq('id', sessionId);
        }
        navigate('/leaderboard');
    };

    const baseXP = (device.device_components?.length || 0) * 50;
    const totalXP = baseXP + bonusXP;

    return (
        <div className="min-h-screen bg-white selection:bg-pastel-coral/20">
            <Navbar />

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pastel-coral/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pastel-blue/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Minimal Header */}
                <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="black" className="text-[10px]">SESSION ID: {deviceId?.slice(0, 8).toUpperCase()}</Badge>
                            <span className="text-gray-300 text-xs font-medium">|</span>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{device.name}</span>
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Harvest Dashboard</h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Verification Hub */}
                    <div className="lg:col-span-7 space-y-8">

                        <div className="grid gap-6">
                            {device.device_components.map((component, idx) => (
                                <motion.div
                                    key={component.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card
                                        variant="white"
                                        padding="lg"
                                        className={cn(
                                            "border-2 transition-all duration-500 relative overflow-hidden group",
                                            verificationStatus[component.id] === 'verified' ? "border-green-500/50 bg-green-50/10" : "border-black/5 hover:border-black/20"
                                        )}
                                    >
                                        {verificationStatus[component.id] === 'verified' && (
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rotate-45 translate-x-12 translate-y-[-12px] flex items-end justify-center pb-4">
                                                <CheckCircle className="w-6 h-6 text-green-500 -rotate-45" />
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="w-full md:w-48 shrink-0">
                                                {verificationStatus[component.id] === 'verified' ? (
                                                    <div className="aspect-square rounded-2xl bg-green-500/10 border-2 border-green-500/20 flex flex-col items-center justify-center text-green-600 gap-2">
                                                        <CheckCircle className="w-10 h-10" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Secured</span>
                                                    </div>
                                                ) : (
                                                    <ImageUpload
                                                        onUpload={(file) => handleComponentVerify(component.id, file)}
                                                        isVerifying={verificationStatus[component.id] === 'verifying'}
                                                        isFailed={verificationStatus[component.id] === 'failed'}
                                                        className="h-full aspect-square rounded-2xl"
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <Badge variant="blue" className="text-[9px] px-2 mb-2 uppercase tracking-widest">{component.type}</Badge>
                                                        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-tight">{component.name}</h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-2xl font-black italic text-pastel-coral">₹{pricesINR[component.id]?.toLocaleString('en-IN') || (Math.ceil(parseFloat(String(component.value)))).toLocaleString('en-IN')}</span>
                                                        <p className="text-[10px] font-black uppercase text-gray-300">Est. Value</p>
                                                    </div>
                                                </div>

                                                <AnimatePresence mode="wait">
                                                    {verificationStatus[component.id] === 'verified' ? (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex flex-col gap-4"
                                                        >
                                                            <div className="p-3 bg-white border-2 border-black/5 rounded-xl flex flex-col gap-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-black uppercase text-gray-400">Yield Reliability</span>
                                                                    <span className="text-xs font-bold text-green-600 italic">Grade: {verificationResults[component.id]?.condition || 'Premium'}</span>
                                                                </div>
                                                                <p className="text-[10px] font-medium text-gray-500 leading-snug italic">"{verificationResults[component.id]?.reasoning || 'Optical pattern matching confirms high-quality salvage state.'}"</p>
                                                            </div>

                                                            {/* Individual Actions */}
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <button
                                                                    onClick={() => setDecisions(prev => ({ ...prev, [component.id]: 'resell' }))}
                                                                    className={cn(
                                                                        "h-10 rounded-lg flex items-center justify-center gap-2 border-2 transition-all",
                                                                        decisions[component.id] === 'resell'
                                                                            ? "bg-black border-black text-white"
                                                                            : "bg-white border-black/10 text-gray-400 hover:border-black/30"
                                                                    )}
                                                                >
                                                                    <DollarSign className="w-3 h-3" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Resell</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => setDecisions(prev => ({ ...prev, [component.id]: 'donate' }))}
                                                                    className={cn(
                                                                        "h-10 rounded-lg flex items-center justify-center gap-2 border-2 transition-all",
                                                                        decisions[component.id] === 'donate'
                                                                            ? "bg-pastel-coral border-pastel-coral text-white"
                                                                            : "bg-white border-black/10 text-gray-400 hover:border-pastel-coral/50 hover:text-pastel-coral"
                                                                    )}
                                                                >
                                                                    <Heart className="w-3 h-3" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Donate</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => setDecisions(prev => ({ ...prev, [component.id]: 'recycle' }))}
                                                                    className={cn(
                                                                        "h-10 rounded-lg flex items-center justify-center gap-2 border-2 transition-all",
                                                                        decisions[component.id] === 'recycle'
                                                                            ? "bg-pastel-blue border-pastel-blue text-white"
                                                                            : "bg-white border-black/10 text-gray-400 hover:border-pastel-blue/50 hover:text-pastel-blue"
                                                                    )}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Recycle</span>
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ) : verificationStatus[component.id] === 'failed' ? (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="p-4 bg-pastel-coral/5 border-2 border-pastel-coral/20 rounded-xl"
                                                        >
                                                            <div className="flex items-center gap-2 text-pastel-coral mb-2">
                                                                <AlertTriangle className="w-4 h-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                                    {verificationResults[component.id]?.reasoning?.includes('Busy')
                                                                        ? 'Service Busy'
                                                                        : 'Verification Mismatch'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-gray-600 mb-3 italic">"{verificationResults[component.id]?.reasoning || 'Image does not match component profile.'}"</p>
                                                            <button
                                                                onClick={async () => {
                                                                    setVerificationStatus(prev => ({ ...prev, [component.id]: 'verified' }));
                                                                    awardXP(250);
                                                                    await saveVerificationToDB(component.id, 'verified', 250);
                                                                }}
                                                                className="w-full h-8 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors"
                                                            >
                                                                Manual Verification Bypass
                                                            </button>
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                            <Info className="w-4 h-4 text-gray-300" />
                                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Awaiting Visual Signature</p>
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                        {/* E-Waste Remnants Section */}
                        <div className="bg-gray-100 rounded-3xl p-8 border-2 border-dashed border-gray-300">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-500">Device Remnants</h3>
                                    <p className="text-xs text-gray-400 font-medium">Chassis, Screws, Cables, & Broken Parts</p>
                                </div>
                                <Trash2 className="w-6 h-6 text-gray-300" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Est. Weight</span>
                                <span className="text-lg font-black tabular-nums">~2.4 kg</span>
                            </div>
                            <button className="w-full h-12 bg-gray-200 text-gray-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                                <Truck className="w-4 h-4" />
                                Schedule E-Waste Pickup
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Checkout Sidebar */}
                    <div className="lg:col-span-5 sticky top-12">
                        <div className="relative">
                            {/* Receipt Styling Container */}
                            <div className="bg-white border-4 border-black p-1 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
                                <div className="border-2 border-black/5 p-8 relative overflow-hidden bg-white">
                                    {/* Receipt Zig Zag Border Bottom (Visualized via pseudo-element or real div) */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle_at_2px_0,transparent_2px,white_2.5px)] bg-[length:5px_1px]" />

                                    <div className="flex justify-between items-start mb-10 border-b-2 border-dashed border-black/10 pb-8">
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-300 mb-2">Session Summary</h3>
                                            <p className="text-2xl font-black uppercase italic tracking-tighter leading-none">{device.name}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-pastel-coral/10 rounded-xl flex items-center justify-center">
                                            <Receipt className="w-6 h-6 text-pastel-coral" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-12">
                                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-400">
                                            <span>Base Component Value</span>
                                            <span className="text-black">₹{totalYieldINR?.toLocaleString('en-IN') || '---'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-400">
                                            <span>Verification Bonus (XP)</span>
                                            <span className="text-pastel-blue">+{totalXP}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-400">
                                            <span>Parts Processed</span>
                                            <span className="text-black">{device.device_components.length} Items</span>
                                        </div>
                                        <div className="pt-6 border-t-2 border-dashed border-black/10 mt-6">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Impact Valuation</p>
                                                    <p className="text-6xl font-black italic tracking-tightest leading-none text-pastel-coral tabular-nums">
                                                        ₹{totalYieldINR?.toLocaleString('en-IN') || '---'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge variant="blue" className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest">Final Redistribution Phase</Badge>
                                        </div>

                                        {/* Dynamic Summary */}
                                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                            <div className="p-2 bg-gray-50 rounded-lg">
                                                <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Resell</div>
                                                <div className="text-xl font-black">{Object.values(decisions).filter(d => d === 'resell').length}</div>
                                            </div>
                                            <div className="p-2 bg-gray-50 rounded-lg">
                                                <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Donate</div>
                                                <div className="text-xl font-black">{Object.values(decisions).filter(d => d === 'donate').length}</div>
                                            </div>
                                            <div className="p-2 bg-gray-50 rounded-lg">
                                                <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Recycle</div>
                                                <div className="text-xl font-black">{Object.values(decisions).filter(d => d === 'recycle').length}</div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="primary"
                                            disabled={verifiedCount === 0 || Object.keys(decisions).length === 0}
                                            className="w-full h-16 text-xl font-black italic uppercase tracking-tighter border-b-8 active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
                                            onClick={async () => {
                                                const resellComponents = device.device_components
                                                    .filter(c => decisions[c.id] === 'resell');

                                                if (resellComponents.length > 0) {
                                                    sessionStorage.setItem('pending_harvest', JSON.stringify({
                                                        device: device.name,
                                                        components: resellComponents.map(c => ({
                                                            name: c.name,
                                                            type: c.type,
                                                            condition: verificationResults[c.id]?.condition || 'Good',
                                                            suggestedPrice: pricesINR[c.id] || Math.ceil(parseFloat(String(c.value))),
                                                            image_url: capturedImages[c.id]
                                                        }))
                                                    }));
                                                    // Also finish the session
                                                    if (sessionId) {
                                                        await supabase.from('teardown_sessions')
                                                            .update({
                                                                status: 'completed',
                                                                completed_at: new Date().toISOString()
                                                            } as any)
                                                            .eq('id', sessionId);
                                                    }
                                                    navigate('/marketplace');
                                                } else {
                                                    handleFinish();
                                                }
                                            }}
                                        >
                                            <CheckCircle className="w-6 h-6" />
                                            Process & Finish
                                        </Button>
                                    </div>

                                    <div className="mt-12 text-center">
                                        <button
                                            onClick={() => navigate('/devices')}
                                            className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors"
                                        >
                                            ← Discard Session
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-8 grid grid-cols-2 gap-4 opacity-40">
                                <div className="flex items-center gap-2 p-3 border border-black/5 rounded-xl grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                    <Globe className="w-4 h-4" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Net Zero Tech</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 border border-black/5 rounded-xl grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">AI Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={cn(
                            "fixed bottom-8 left-1/2 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border-2 min-w-[300px]",
                            notification.type === 'success' ? "bg-black text-white border-white/10" : "bg-pastel-coral text-white border-transparent"
                        )}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-white" />
                        )}
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">{notification.type === 'success' ? 'System Verified' : 'Action Failed'}</p>
                            <p className="text-sm font-bold">{notification.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
