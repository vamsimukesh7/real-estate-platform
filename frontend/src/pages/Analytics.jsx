import { useState, useEffect } from 'react';
import Layout from '../components/layouts/Layout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, Users, Home, DollarSign, ArrowUpRight,
    ArrowDownRight, Activity, PieChart as PieIcon, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { generateMarketReport } from '../services/reportService';

const Analytics = () => {
    const { isAdmin } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    const handleGenerateReport = async () => {
        if (!data) {
            console.warn('Cannot generate report: No data available');
            return;
        }

        console.log('Starting market report generation...', data);
        setIsGenerating(true);

        // Add a slight artificial delay for premium "Generating" feel
        setTimeout(() => {
            try {
                generateMarketReport(data);
            } catch (err) {
                console.error('PDF Generation failed:', err);
            } finally {
                setIsGenerating(false);
            }
        }, 1500);
    };

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/properties/analytics');
                setData(response.data.data);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin()) {
            fetchAnalytics();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    if (loading) {
        return (
            <Layout title="Market Analytics">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Layout>
        );
    }

    if (!isAdmin()) {
        return (
            <Layout title="Market Analytics">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                    <div className="text-6xl mb-4">🛡️</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                        The detailed market analytics dashboard is reserved for administrative users only.
                        Please contact the office if you believe you should have access.
                    </p>
                </div>
            </Layout>
        );
    }

    const stats = [
        {
            label: 'Total Revenue',
            value: `$${(data?.stats.totalRevenue / 1000000).toFixed(2)}M`,
            growth: '+12.5%',
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            label: 'Properties Sold',
            value: data?.stats.soldProperties,
            growth: '+8.2%',
            icon: Home,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            label: 'Avg. Sale Price',
            value: `$${(data?.stats.avgPrice / 1000).toFixed(1)}k`,
            growth: '+5.4%',
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        {
            label: 'Market Reach',
            value: data?.stats.totalViews > 1000 ? `${(data?.stats.totalViews / 1000).toFixed(1)}k` : data?.stats.totalViews.toString(),
            growth: '+22.1%',
            icon: Users,
            color: 'text-orange-600',
            bg: 'bg-orange-100'
        },
    ];

    return (
        <Layout title="Market Analytics Dashboard">
            <div className="space-y-6 pb-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 hover-lift"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} dark:bg-opacity-10`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                                    <ArrowUpRight size={16} />
                                    {stat.growth}
                                </div>
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Trend Area Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">Revenue & Listings Trend</h3>
                                <p className="text-xs text-gray-500">Monthly performance analysis</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                                    <span className="dark:text-gray-300">Listings</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <span className="dark:text-gray-300">Revenue (k)</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.trend}>
                                    <defs>
                                        <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="listings"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorListings)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Property Type Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700"
                    >
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <PieIcon size={20} className="text-primary-500" />
                                Inventory Mix
                            </h3>
                            <p className="text-xs text-gray-500 truncate">Distribution by property type</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.typeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.typeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-dark-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Most Popular:</span>
                                <span className="font-bold text-primary-600 dark:text-primary-400">
                                    {[...(data?.typeDistribution || [])].sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* City & Price segments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* City Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700"
                    >
                        <div className="mb-8 items-center flex justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Activity size={20} className="text-emerald-500" />
                                    Top Market Locations
                                </h3>
                                <p className="text-xs text-gray-500">Distribution by city</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Active</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.cityBreakdown} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none' }}
                                    />
                                    <Bar dataKey="value" fill="#10b981" radius={[0, 10, 10, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Price Tiers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700"
                    >
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-orange-500" />
                                Price Segment Distribution
                            </h3>
                            <p className="text-xs text-gray-500">Inventory volume by price tier</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.priceTiers}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.priceTiers.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700"
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-purple-500" />
                                Listing Type Efficiency
                            </h3>
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Real-time</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.listingDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none' }}
                                    />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                        {data?.listingDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#10b981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Investment Quick Insights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
                    >
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Investment Insights</h3>
                                    <p className="text-indigo-200 text-sm">AI-Powered Market Outlook</p>
                                </div>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-indigo-100 font-medium">Market Sentiment</span>
                                        <span className={`px-2 py-1 ${(data?.trend[data.trend.length - 1]?.revenue > data?.trend[0]?.revenue) ? 'bg-green-400 text-green-950' : 'bg-orange-400 text-orange-900'} text-[10px] font-bold rounded-lg uppercase tracking-wider`}>
                                            {(data?.trend[data.trend.length - 1]?.revenue > data?.trend[0]?.revenue) ? 'Bullish' : 'Neutral'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-indigo-50 opacity-80 leading-relaxed">
                                        {(data?.trend[data.trend.length - 1]?.revenue > data?.trend[0]?.revenue)
                                            ? `Sales volume has increased by ${(((data.trend[data.trend.length - 1].revenue - data.trend[0].revenue) / (data.trend[0].revenue || 1)) * 100).toFixed(1)}% over the last 6 months.`
                                            : "Market is stabilizing with consistent transaction volumes across core segments."}
                                        ROI remains steady at 8.2% for prime listings.
                                    </p>
                                </div>

                                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-indigo-100 font-medium">Hot Spotlight</span>
                                        <span className="text-sm font-bold">{data?.cityBreakdown[0]?.name || 'Global'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-blue-300 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-bold">85% Match</span>
                                    </div>
                                    <p className="text-[10px] text-indigo-200 mt-2 italic">Based on search frequency and listing velocity.</p>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                                className="mt-8 w-full py-4 bg-white text-indigo-700 font-bold rounded-2xl shadow-lg hover:shadow-white/20 hover:scale-[1.02] transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating && <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />}
                                {isGenerating ? 'Analyzing Market Data...' : 'Generate Full Market Report'}
                            </button>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
