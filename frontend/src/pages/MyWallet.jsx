import { useState, useEffect } from 'react';
import Layout from '../components/layouts/Layout';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    History,
    CreditCard,
    Search,
    Filter,
    Download,
    TrendingUp,
    Briefcase,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyWallet = () => {
    const { user, refreshUser } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const res = await api.get('/wallet');
            setBalance(res.data.balance);
            setTransactions(res.data.transactions);
        } catch (error) {
            console.error('Failed to fetch wallet data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type) => {
        if (!amount || isNaN(amount) || amount <= 0) return;

        setProcessing(true);
        try {
            const endpoint = type === 'deposit' ? '/wallet/deposit' : '/wallet/withdraw';
            await api.post(endpoint, {
                amount: Number(amount),
                description: type === 'deposit' ? 'Added funds to wallet' : 'Withdrew funds from wallet'
            });

            // Refresh data
            await fetchWalletData();
            await refreshUser();

            // Reset states
            setAmount('');
            setShowDepositModal(false);
            setShowWithdrawModal(false);
        } catch (error) {
            console.error(`Failed to ${type} funds`, error);
            alert(error.response?.data?.message || `Failed to ${type} funds`);
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val);
    };

    const stats = [
        { label: 'Total Volume', value: '$124,500', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-100' },
        { label: 'Escrow Holdings', value: '$45,000', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-100' },
        { label: 'Trust Score', value: '98/100', icon: Shield, color: 'text-green-500', bg: 'bg-green-100' },
    ];

    return (
        <Layout title="My Wallet">
            <div className="space-y-8 pb-12">
                {/* Upper Section: Card and Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* The Virtual Card */}
                    <div className="lg:col-span-12 xl:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative h-64 w-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden group hover-lift"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <Wallet size={120} />
                            </div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium mb-1 opacity-80 uppercase tracking-widest">Available Balance</p>
                                        <h2 className="text-4xl font-bold tracking-tight">
                                            {loading ? '...' : formatCurrency(balance)}
                                        </h2>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                                        <CreditCard size={24} />
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-indigo-200 mb-1 opacity-60 uppercase tracking-tighter">Account Holder</p>
                                        <p className="text-lg font-semibold tracking-wide">{user?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-indigo-200 mb-1 opacity-60 uppercase tracking-tighter">Status</p>
                                        <div className="flex items-center gap-1.5 bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-green-400/30">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                            Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative circles */}
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/15 transition-all"></div>
                        </motion.div>
                    </div>

                    {/* Quick Stats & Actions */}
                    <div className="lg:col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Actions */}
                        <div className="md:col-span-3 flex flex-wrap gap-4">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="flex-1 min-w-[150px] bg-white dark:bg-dark-800 p-4 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-700 hover:border-indigo-500 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Plus size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Deposit</p>
                                        <p className="text-xs text-gray-500">Add funds instantly</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                className="flex-1 min-w-[150px] bg-white dark:bg-dark-800 p-4 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-700 hover:border-pink-500 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-pink-50 dark:bg-pink-900/40 text-pink-600 rounded-2xl group-hover:scale-110 transition-transform">
                                        <ArrowUpRight size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Withdraw</p>
                                        <p className="text-xs text-gray-500">Transfer out</p>
                                    </div>
                                </div>
                            </button>

                            <button className="flex-1 min-w-[150px] bg-indigo-600 p-4 rounded-3xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 text-white rounded-2xl group-hover:scale-110 transition-transform border border-white/20">
                                        <ArrowDownLeft size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-white">Transfer</p>
                                        <p className="text-xs text-white/70">Send money</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Stats mini cards */}
                        {stats.map((s, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-700"
                            >
                                <div className={`p-2.5 w-fit rounded-xl ${s.bg} ${s.color} mb-4`}>
                                    <s.icon size={20} />
                                </div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                                <p className="text-xl font-bold dark:text-white">{s.value}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white dark:bg-dark-800 rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <History size={24} className="text-indigo-600" />
                                Transaction History
                            </h3>
                            <p className="text-sm text-gray-500">Monitor your recent financial activity</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-900 p-1.5 rounded-2xl border border-gray-100 dark:border-dark-700 max-w-sm w-full">
                            <Search size={18} className="ml-2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-900 dark:text-white"
                            />
                            <button className="p-2 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 text-gray-600 dark:text-gray-400">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-dark-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-8 py-4">Transaction</th>
                                    <th className="px-8 py-4">Amount</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-dark-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm">Loading activity...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <History size={48} className="text-gray-200" />
                                                <p className="text-sm">No transactions found yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-900/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${tx.type === 'Deposit' ? 'bg-green-50 text-green-600' :
                                                        tx.type === 'Withdrawal' ? 'bg-pink-50 text-pink-600' :
                                                            'bg-indigo-50 text-indigo-600'
                                                        }`}>
                                                        {tx.type === 'Deposit' ? <Plus size={20} /> :
                                                            tx.type === 'Withdrawal' ? <ArrowUpRight size={20} /> :
                                                                <CreditCard size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{tx.description}</p>
                                                        <p className="text-xs text-gray-500 uppercase tracking-tighter">{tx.type} • ID: {tx._id.slice(-6).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-pink-600'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                                                {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 hover:bg-white dark:hover:bg-dark-800 rounded-xl transition-all text-gray-400 hover:text-indigo-600">
                                                    <Download size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {(showDepositModal || showWithdrawModal) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowDepositModal(false); setShowWithdrawModal(false); }}
                            className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-dark-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 dark:border-dark-700"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {showDepositModal ? 'Add Funds' : 'Withdraw Funds'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-8">
                                {showDepositModal
                                    ? 'Load your virtual wallet to make property bookings easily.'
                                    : 'Transfer your funds back to your linked bank account.'}
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount (USD)</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-50 dark:bg-dark-900 border-gray-100 dark:border-dark-700 rounded-2xl py-4 pl-10 pr-4 focus:ring-indigo-500 text-lg font-bold"
                                        />
                                    </div>
                                    {showWithdrawModal && (
                                        <p className="text-[10px] text-gray-400 mt-2 italic px-2">Max. withdrawal: {formatCurrency(balance)}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {[500, 1000, 5000, 10000].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val.toString())}
                                            className="py-2 bg-gray-50 dark:bg-dark-900 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100 dark:border-dark-700"
                                        >
                                            +${val / 1000}k
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={processing || !amount}
                                    onClick={() => handleAction(showDepositModal ? 'deposit' : 'withdraw')}
                                    className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${showDepositModal
                                        ? 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
                                        : 'bg-pink-600 text-white shadow-pink-600/20 hover:bg-pink-700'
                                        } disabled:opacity-50`}
                                >
                                    {processing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {processing ? 'Processing...' : (showDepositModal ? 'Confirm Deposit' : 'Confirm Withdrawal')}
                                </button>

                                <button
                                    onClick={() => { setShowDepositModal(false); setShowWithdrawModal(false); }}
                                    className="w-full py-2 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default MyWallet;
