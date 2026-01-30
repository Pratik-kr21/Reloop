import { useState, useEffect } from 'react';

import { Trophy, Medal, ArrowUp, ArrowDown, Loader2, Target, Users } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Navbar from '../components/ui/Navbar';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardUser {
    id: string;
    rank: number;
    name: string;
    school: string;
    xp: number;
    parts_saved: number;
    trend: 'up' | 'down' | 'neutral';
}



export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // Fetch points and username. Note: 'school' and 'full_name' are in auth metadata which we can't easily join here without an Edge Function or duplicate data.
                // For MVP, we will use 'username' as display name and mock 'school' or fetch if possible. 
                // To fix this properly, we should encourage users to create a public profile or duplicate 'school' in public.users.
                // For now, we'll fetch points and username, and if school is missing, show 'ReLoop Academy'.

                const { data: usersData, error } = await supabase
                    .from('users')
                    .select('id, name, school, xp')
                    .order('xp', { ascending: false })
                    .limit(10);

                if (error) throw error;

                if (usersData) {
                    const usersWithStats = await Promise.all(usersData.map(async (u: any, i: number) => {
                        // Fetch actual verification count for each user
                        const { count } = await supabase
                            .from('component_verifications')
                            .select('*', { count: 'exact', head: true })
                            .eq('user_id', u.id)
                            .eq('status', 'verified');

                        return {
                            id: u.id,
                            rank: i + 1,
                            name: u.name || 'Anonymous',
                            school: u.school || 'Community Member',
                            xp: u.xp || 0,
                            parts_saved: count || 0,
                            trend: 'neutral' as const
                        };
                    }));
                    setUsers(usersWithStats);
                } else {
                    setUsers([]);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-pastel-coral" />
                <p className="font-black uppercase tracking-widest text-gray-400">Syncing Global Rankings...</p>
            </div>
        );
    }

    const topThree = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="container mx-auto px-8 py-20 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Badge variant="coral" className="mb-6 uppercase italic font-black text-xs tracking-widest">
                            Circular Economy Rankings
                        </Badge>
                        <h1 className="text-[7rem] font-black uppercase italic tracking-tighter leading-[0.8]">
                            Hall of<br />
                            <span style={{ color: 'var(--color-pastel-coral)' }}>Harvest</span>
                        </h1>
                    </motion.div>
                    <div className="flex flex-col items-end gap-4">

                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Last updated: 2 mins ago</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-12 mb-32 items-end">
                    {/* Rank 2 */}
                    {topThree[1] && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="order-2 md:order-1">
                            <Card variant="white" padding="lg" className="text-center relative border-b-[12px] border-pastel-blue">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                    <div className="w-20 h-20 rounded-full bg-pastel-blue border-4 border-black flex items-center justify-center">
                                        <Medal className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <div className="mt-10 mb-6">
                                    <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-black mx-auto mb-4 flex items-center justify-center text-4xl font-black">
                                        {topThree[1].name.charAt(0)}
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{topThree[1].name}</h3>
                                    <p className="font-bold text-gray-400 text-xs uppercase tracking-widest">{topThree[1].school}</p>
                                </div>
                                <div className="flex justify-around border-t-2 border-black/5 pt-6">
                                    <div>
                                        <p className="text-3xl font-black text-pastel-blue">{topThree[1].xp.toLocaleString()}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Total XP</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black">{topThree[1].parts_saved}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Saved</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Rank 1 */}
                    {topThree[0] && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="order-1 md:order-2">
                            <Card variant="white" padding="xl" className="text-center relative border-b-[20px] border-pastel-yellow shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="w-28 h-28 rounded-[2.5rem] bg-pastel-yellow border-4 border-black flex items-center justify-center rotate-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        <Trophy className="w-14 h-14 text-white" />
                                    </motion.div>
                                </div>
                                <div className="mt-16 mb-8">
                                    <div className="w-32 h-32 rounded-full bg-gray-50 border-4 border-black mx-auto mb-6 flex items-center justify-center text-6xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-cover" style={{ backgroundImage: `url(https://api.dicebear.com/9.x/bottts/svg?seed=${topThree[0].name})` }}>
                                    </div>
                                    <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{topThree[0].name}</h3>
                                    <Badge variant="yellow" className="uppercase font-black tracking-[0.2em] text-[10px]">Harvest Vanguard</Badge>
                                </div>
                                <div className="flex justify-around border-t-4 border-black pt-8">
                                    <div>
                                        <p className="text-5xl font-black text-pastel-yellow italic tracking-tighter">{topThree[0].xp.toLocaleString()}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Global Points</p>
                                    </div>
                                    <div>
                                        <p className="text-5xl font-black italic tracking-tighter">{topThree[0].parts_saved}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Subsystems</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Rank 3 */}
                    {topThree[2] && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="order-3">
                            <Card variant="white" padding="lg" className="text-center relative border-b-[12px] border-pastel-coral">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                    <div className="w-20 h-20 rounded-full bg-pastel-coral border-4 border-black flex items-center justify-center">
                                        <Target className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <div className="mt-10 mb-6">
                                    <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-black mx-auto mb-4 flex items-center justify-center text-4xl font-black">
                                        {topThree[2].name.charAt(0)}
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{topThree[2].name}</h3>
                                    <p className="font-bold text-gray-400 text-xs uppercase tracking-widest">{topThree[2].school}</p>
                                </div>
                                <div className="flex justify-around border-t-2 border-black/5 pt-6">
                                    <div>
                                        <p className="text-3xl font-black text-pastel-coral">{topThree[2].xp.toLocaleString()}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Total XP</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black">{topThree[2].parts_saved}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Saved</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>

                <Card variant="white" padding="none" className="overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-xs">Rank</th>
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-xs">Student Explorer</th>
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-xs hidden md:table-cell">Affiliation</th>
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-xs text-right">Yield</th>
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-xs text-right">XP Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {rest.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b-2 border-black last:border-0 hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-8 py-8 font-black text-4xl italic tracking-tighter group-hover:text-pastel-coral transition-colors">
                                            <div className="flex items-center gap-4">
                                                #{user.rank}
                                                {user.trend === 'up' && <ArrowUp className="w-6 h-6 text-green-500" />}
                                                {user.trend === 'down' && <ArrowDown className="w-6 h-6 text-red-500" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-100 flex-shrink-0" style={{ backgroundImage: `url(https://api.dicebear.com/9.x/bottts/svg?seed=${user.name})`, backgroundSize: 'cover' }}></div>
                                                <div>
                                                    <div className="text-2xl font-black uppercase italic tracking-tighter">{user.name}</div>
                                                    <div className="text-[10px] md:hidden font-black text-gray-400">{user.school}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 hidden md:table-cell font-black uppercase tracking-widest text-[10px] text-gray-400 italic">{user.school}</td>
                                        <td className="px-8 py-8 text-right font-black text-2xl tracking-tighter">{user.parts_saved}</td>
                                        <td className="px-8 py-8 text-right font-black text-3xl italic tracking-tighter text-pastel-coral">{user.xp.toLocaleString()}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </Card>

                {/* Sticky User Summary */}
                <div className="mt-20 flex justify-center">
                    <motion.div whileHover={{ y: -5 }}>
                        <Card variant="white" padding="md" className="flex items-center gap-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-pastel-yellow/5">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center font-black text-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">K</div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">Current Standing</p>
                                    <p className="text-3xl font-black italic tracking-tighter">#42 Global</p>
                                </div>
                            </div>
                            <div className="h-12 w-1 bg-black rounded-full"></div>
                            <div className="hidden sm:block">
                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-2">XP to Vanguard Status</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-48 h-4 bg-white border-2 border-black rounded-full overflow-hidden">
                                        <div className="h-full bg-pastel-coral" style={{ width: '65%' }}></div>
                                    </div>
                                    <span className="font-black italic text-xs">65%</span>
                                </div>
                            </div>
                            <Button variant="primary" className="font-black uppercase italic tracking-tighter px-8">Your Stats <Users className="ml-2 w-4 h-4" /></Button>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
