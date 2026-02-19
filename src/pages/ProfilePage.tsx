import { Award, Star, History, MoreVertical, Shield, Cpu, Package, Loader2, Zap, Globe, Recycle } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Navbar from '../components/ui/Navbar';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
// import { Database } from '../lib/database.types'; // Removed as types were unused in final implementation logic (using any for merged log)

import { estimateWasteDiverted } from '../lib/gemini';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState({
        rank: '#--',
        partsSaved: 0,
        wasteDiverted: 0,
        safetyRating: '10.0'
    });
    const [activityLog, setActivityLog] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Fetch User Stats
                const { data: dbUser } = await supabase
                    .from('users')
                    .select('xp, name, school')
                    .eq('id', user.id)
                    .single();

                const safeUser = {
                    name: dbUser?.name || user.user_metadata.name || 'Anonymous Excavator',
                    school: dbUser?.school || 'Independent',
                    xp: dbUser?.xp || 0
                };
                setUserData(safeUser);

                // 2. Fetch Global Rank
                const { count: rankCount } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .gt('xp', safeUser.xp);
                const globalRank = (rankCount || 0) + 1;

                // 3. Robust Fetch Parts Saved (Count components from all completed teardowns)
                const { data: completedSessions } = await supabase
                    .from('teardown_sessions')
                    .select('device_id')
                    .eq('user_id', user.id)
                    .eq('status', 'completed');

                let partsTotal = 0;
                if (completedSessions && completedSessions.length > 0) {
                    const deviceIds = completedSessions.map(s => s.device_id);
                    const { count } = await supabase
                        .from('device_components')
                        .select('*', { count: 'exact', head: true })
                        .in('device_id', deviceIds);
                    partsTotal = count || 0;
                }

                // Also count individual verified parts (in case of partial/extra verifications not covered above? 
                // actually, completed session implies all parts. Let's stick to the session-based count as the primary source of truth for "harvested")
                // If we want to be additive:
                // partsTotal = components_from_sessions + verified_standalone_components?
                // For simplicity and to match "harvested till now", session components is the best proxy.

                const partsErr = null; // No longer using specific verification error here

                if (partsErr) console.error('Error fetching parts count:', partsErr);

                // Fetch parts with details for Gemini estimation
                const { data: verifiedParts } = await supabase
                    .from('component_verifications')
                    .select('*, device_components(name, devices(name))')
                    .eq('user_id', user.id)
                    .eq('status', 'verified');

                // 4. Fetch Completed Sessions (for Global Waste Context)
                const { count: sessionCount } = await supabase
                    .from('teardown_sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'completed');

                // 5. Calculate Waste using AI or Fallback
                let waste = 0;
                try {
                    if (verifiedParts && verifiedParts.length > 0) {
                        const componentMetadata = verifiedParts.map((v: any) => ({
                            name: v.device_components?.name || 'Component',
                            device: v.device_components?.devices?.name || 'Electronic Device'
                        }));
                        waste = await estimateWasteDiverted(componentMetadata);
                    } else if (sessionCount && sessionCount > 0) {
                        waste = sessionCount * 1.8; // Baseline shell weight
                    }
                } catch (err) {
                    waste = ((sessionCount || 0) * 2.5) + ((partsTotal || 0) * 0.3);
                }

                setStats({
                    rank: `#${globalRank}`,
                    partsSaved: partsTotal || 0,
                    wasteDiverted: waste,
                    safetyRating: '10.0' // Placeholder for now
                });

                // 5. Fetch Activity Log (Merge Sessions & Verifications)
                const { data: recentVerifications } = await supabase
                    .from('component_verifications')
                    .select('*, device_components(name)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                const { data: recentSessions } = await supabase
                    .from('teardown_sessions')
                    .select('*, devices(name)')
                    .eq('user_id', user.id)
                    .eq('status', 'completed')
                    .order('completed_at', { ascending: false })
                    .limit(5);

                // Merge and format
                const log: any[] = [];

                recentVerifications?.forEach((v: any) => {
                    log.push({
                        type: 'verification',
                        action: `Verified ${v.device_components?.name || 'Component'}`,
                        target: 'Inventory',
                        xp: `+${v.xp_awarded || 0} XP`,
                        date: new Date(v.created_at || ''),
                        status: v.status
                    });
                });

                recentSessions?.forEach((s: any) => {
                    log.push({
                        type: 'session',
                        action: 'Teardown Complete',
                        target: s.devices?.name || 'Device',
                        xp: '+500 XP', // Base session XP
                        date: new Date(s.completed_at || ''),
                        status: 'completed'
                    });
                });

                log.sort((a, b) => b.date.getTime() - a.date.getTime());
                setActivityLog(log.slice(0, 5));

                // 6. Safety Rating (Mock based on rejections vs verified)
                const { count: rejectedCount } = await supabase
                    .from('component_verifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'rejected');

                const totalVerifs = (partsTotal || 0) + (rejectedCount || 0);
                const accuracy = totalVerifs === 0 ? 1 : (partsTotal || 0) / totalVerifs;
                const rating = Math.max(5, Math.min(10, 8 + (accuracy * 2))).toFixed(1); // Baseline 8, up to 10

                setStats({
                    rank: `#${globalRank}`,
                    partsSaved: partsTotal || 0,
                    wasteDiverted: waste,
                    safetyRating: rating
                });

            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const userXP = userData?.xp || 0;
    const currentLevel = Math.floor(userXP / 1000) + 1;
    const progressToNext = (userXP % 1000) / 10;

    const displayStats = [
        { label: 'Global Rank', value: stats.rank, icon: Award, color: 'var(--color-pastel-yellow)' },
        { label: 'Total XP', value: userXP.toLocaleString(), icon: Star, color: 'var(--color-pastel-coral)' },
        { label: 'Parts Saved', value: stats.partsSaved.toString(), icon: Package, color: 'var(--color-pastel-blue)' },
        { label: 'Waste Diverted', value: stats.wasteDiverted.toFixed(1) + 'kg', icon: Recycle, color: 'var(--color-pastel-peach)' },
    ];

    const artifacts = [
        { name: 'Novice Excavator', unlockedAt: 0, icon: Package, desc: 'First device dismantled' },
        { name: 'Circuit Carver', unlockedAt: 1000, icon: Cpu, desc: 'Earn 1000 XP from harvests' },
        { name: 'Silicon Sorcerer', unlockedAt: 2500, icon: Zap, desc: 'Expert Level (2500 XP)' },
        { name: 'Master Redistributor', unlockedAt: 5000, icon: Globe, desc: 'Top Tier (5000 XP)' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-pastel-coral" />
                <p className="font-black uppercase tracking-widest text-gray-400">Syncing Profile Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="container mx-auto px-8 py-20 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column: Profile Card */}
                    <div className="lg:w-1/3">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card variant="white" padding="xl" className="border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center relative">
                                <button className="absolute top-6 right-6">
                                    <MoreVertical className="w-6 h-6 text-gray-300" />
                                </button>

                                <div className="w-40 h-40 rounded-full border-4 border-black mx-auto mb-6 bg-pastel-yellow/20 overflow-hidden relative">
                                    <img
                                        src={`https://api.dicebear.com/9.x/bottts/svg?seed=${userData?.name}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover scale-110 mt-2"
                                    />
                                </div>
                                <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{userData?.name}</h1>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 italic">{userData?.school}</p>

                                <div className="flex justify-center gap-2 mb-8">
                                    <Badge variant="blue" className="px-4 py-1 uppercase font-black text-[10px]">Tier {currentLevel}</Badge>
                                    <Badge variant="coral" className="px-4 py-1 uppercase font-black text-[10px]">Top {(parseInt(stats.rank.replace('#', '')) / 100 * 10).toFixed(1)}%</Badge>
                                </div>

                                <div className="space-y-4 text-left border-t-2 border-black/5 pt-8">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                            <span>Progress to Tier {currentLevel + 1}</span>
                                            <span>{Math.round(progressToNext)}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-gray-100 border-2 border-black rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-pastel-coral transition-all duration-1000"
                                                style={{ width: `${progressToNext}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="secondary" className="w-full mt-10 font-black uppercase italic tracking-tighter border-b-4">Edit Public Bio</Button>
                            </Card>

                            <div className="mt-8">
                                <Card variant="white" padding="lg" className="border-4 border-black border-b-[12px] bg-pastel-yellow/5">
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-pastel-yellow" />
                                        Safety Rating
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="text-5xl font-black italic tracking-tighter">{stats.safetyRating}</div>
                                        <div className="text-xs font-bold text-gray-500 italic">
                                            {parseFloat(stats.safetyRating) > 9 ? 'Highly reliable dismantler. Perfect PPE compliance record.' : 'Good standing. Ensure consistent safety checks.'}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Stats & Activity */}
                    <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                            {displayStats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card variant="white" padding="md" className="h-full border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center min-h-[140px]">
                                        <stat.icon className="w-8 h-8 mb-4" style={{ color: stat.color }} />
                                        <p className="text-3xl font-black italic tracking-tighter">{stat.value}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 text-center">{stat.label}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mb-16">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-4">
                                <Award className="w-10 h-10 text-pastel-coral" />
                                Unlocked Artifacts
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {artifacts.map((art) => {
                                    const isLocked = userXP < art.unlockedAt;
                                    const Icon = art.icon;
                                    return (
                                        <Card
                                            key={art.name}
                                            variant="white"
                                            padding="lg"
                                            className={cn(
                                                "border-2 border-black flex items-center gap-6 group transition-all",
                                                isLocked ? "opacity-30 grayscale saturate-0" : "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:border-pastel-coral"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-16 h-16 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 transition-transform",
                                                !isLocked && "bg-pastel-yellow group-hover:rotate-12"
                                            )}>
                                                {isLocked ? <Shield className="w-8 h-8 opacity-20" /> : <Icon className="w-10 h-10" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black uppercase italic tracking-tighter">{art.name}</h4>
                                                    {isLocked && <Badge variant="black" className="text-[8px] py-0">LOCKED</Badge>}
                                                </div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    {isLocked ? `Unlocks at ${art.unlockedAt} XP` : art.desc}
                                                </p>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-4">
                                <History className="w-10 h-10 text-pastel-blue" />
                                Extraction Log
                            </h2>
                            <Card variant="white" padding="none" className="overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                                {activityLog.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-black text-white">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Entry</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Target</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Reward</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activityLog.map((act, i) => (
                                                    <tr key={i} className="border-b-2 border-black last:border-0 hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-6">
                                                            <div className="font-black uppercase italic tracking-tighter">{act.action}</div>
                                                            <div className={cn(
                                                                "text-[10px] font-black uppercase tracking-widest",
                                                                act.status === 'verified' || act.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                                                            )}>
                                                                {act.status}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 font-bold text-gray-500 italic text-sm">{act.target}</td>
                                                        <td className="px-6 py-6 font-black text-pastel-coral italic uppercase tracking-tighter">{act.xp}</td>
                                                        <td className="px-6 py-6 text-right text-xs font-black text-gray-300 uppercase leading-none">
                                                            {act.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-400 font-medium italic">
                                        No recent activity recorded.
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
