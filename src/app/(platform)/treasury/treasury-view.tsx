'use client';

import { TrendingUp, TrendingDown, Users, Wallet, ArrowUpRight, ArrowDownLeft, Zap, Gift, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Props {
 treasury: any;
 transactions: any[];
 weeklyStats: any[];
}

const TYPE_LABELS: Record<string, string> = {
 ubi: 'UBI Distribution',
 reward: 'Citizen Grant / Reward',
 treasury_fee: 'Marketplace Fee',
 quest_reward: 'Quest Reward',
 proposal_fund: 'Proposal Funding',
 community_contribution: 'Community Contribution',
 transfer: 'Transfer',
};

const TYPE_ICONS: Record<string, typeof Wallet> = {
 ubi: Gift,
 reward: Gift,
 treasury_fee: ArrowUpRight,
 quest_reward: Zap,
 proposal_fund: ArrowDownLeft,
 community_contribution: ArrowUpRight,
 transfer: Wallet,
};

export function TreasuryView({ treasury, transactions, weeklyStats }: Props) {
 const totalUbiThisMonth = weeklyStats.reduce((sum, t) => sum + (t.amount || 0), 0);
 const ubiDistributions = weeklyStats.length;
 const balance = Number(treasury?.balance || 0);
 const totalDistributed = Number(treasury?.total_distributed || 0);

 return (
 <div className="space-y-6 animate-fade-in">
 <div>
 <h1 className="page-title">Community Treasury</h1>
 <p className="page-subtitle">
 Full transparency. Every $MLY in, every $MLY out.
 </p>
 </div>

 {/* Treasury stats — glass cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-mly-50/80 to-mly-100/40 border border-mly-200/50 backdrop-blur-sm">
 <Wallet className="h-5 w-5 text-mly-600 mb-2" aria-hidden="true" />
 <p className="text-2xl font-bold tabular-nums text-harbor-800 ">
 {balance >= 1_000_000
 ? `$${(balance / 1_000_000).toFixed(2)}M`
 : balance >= 1_000
 ? `$${(balance / 1_000).toFixed(0)}K`
 : `$${balance.toLocaleString()}`}
 </p>
 <p className="text-xs text-mly-700/70 font-medium uppercase tracking-wide mt-1">Current Balance</p>
 </div>

 <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-teal-50/80 to-teal-100/40 border border-teal-200/50 backdrop-blur-sm">
 <TrendingUp className="h-5 w-5 text-teal-600 mb-2" aria-hidden="true" />
 <p className="text-2xl font-bold tabular-nums text-harbor-800 ">
 {totalDistributed >= 1_000_000
 ? `$${(totalDistributed / 1_000_000).toFixed(2)}M`
 : totalDistributed >= 1_000
 ? `$${(totalDistributed / 1_000).toFixed(0)}K`
 : `$${totalDistributed.toLocaleString()}`}
 </p>
 <p className="text-xs text-teal-700/70 font-medium uppercase tracking-wide mt-1">Total Distributed</p>
 </div>

 <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-harbor-50/80 to-harbor-100/40 border border-harbor-200/50 backdrop-blur-sm">
 <Users className="h-5 w-5 text-harbor-600 mb-2" aria-hidden="true" />
 <p className="text-2xl font-bold tabular-nums text-harbor-800 ">
 {(treasury?.citizen_count || 0).toLocaleString()}
 </p>
 <p className="text-xs text-harbor-700/70 font-medium uppercase tracking-wide mt-1">Verified Citizens</p>
 </div>
 </div>

 {/* How treasury grows */}
 <div className="rounded-xl border border-gray-100 bg-white p-6">
 <h2 className="font-semibold text-harbor-800 mb-3">How the Treasury Operates</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
 <div className="flex items-start gap-3">
 <ArrowUpRight className="h-4 w-4 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
 <div>
 <p className="font-medium text-harbor-800 ">Marketplace Fees</p>
 <p className="text-gray-500 ">Small fees on marketplace transactions flow back to replenish the community pool.</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <ArrowUpRight className="h-4 w-4 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
 <div>
 <p className="font-medium text-harbor-800 ">Community Contributions</p>
 <p className="text-gray-500 ">Citizens contribute funds from their community pots toward shared initiatives.</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <ArrowDownLeft className="h-4 w-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
 <div>
 <p className="font-medium text-harbor-800 ">Weekly UBI & Welcome Grants</p>
 <p className="text-gray-500 ">50 $MLY upon registration and 100 $MLY weekly to every verified citizen.</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <ArrowDownLeft className="h-4 w-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
 <div>
 <p className="font-medium text-harbor-800 ">Steward & Learning Rewards</p>
 <p className="text-gray-500 ">Proposals (25 $MLY), attestations (10 $MLY), and path mastery (50 $MLY) are funded by the treasury.</p>
 </div>
 </div>
 </div>
 </div>

 {/* 30-day summary */}
 <div className="rounded-xl border border-gray-100 bg-white p-6">
 <h2 className="font-semibold text-harbor-800 mb-3">Last 30 Days</h2>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-2xl font-bold tabular-nums text-harbor-800 ">{totalUbiThisMonth.toLocaleString()}</p>
 <p className="text-xs text-gray-500">$MLY distributed via UBI</p>
 </div>
 <div>
 <p className="text-2xl font-bold tabular-nums text-harbor-800 ">{ubiDistributions.toLocaleString()}</p>
 <p className="text-xs text-gray-500">Individual UBI distributions</p>
 </div>
 </div>
 </div>

 {/* Transaction ledger */}
 <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
 <div className="p-5 border-b border-gray-100 ">
 <h2 className="font-semibold text-harbor-800 ">Transaction Ledger</h2>
 <p className="text-xs text-gray-500 mt-0.5">Every treasury movement is public and cryptographically traceable</p>
 </div>

 {transactions.length === 0 ? (
 <div className="p-8 text-center text-sm text-gray-500">
 No treasury transactions recorded yet.
 </div>
 ) : (
 <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
 {transactions.map((tx) => {
 const Icon = TYPE_ICONS[tx.type] || Wallet;
 const isOutflow = tx.type === 'ubi' || tx.type === 'quest_reward' || tx.type === 'proposal_fund' || tx.type === 'reward';
 return (
 <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
 <div className={`rounded-lg p-2 ${isOutflow ? 'bg-red-50 ' : 'bg-green-50 '}`}>
 <Icon className={`h-3.5 w-3.5 ${isOutflow ? 'text-red-500' : 'text-green-500'}`} aria-hidden="true" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-harbor-800 truncate">
 {TYPE_LABELS[tx.type] || tx.type}
 </p>
 <p className="text-xs text-gray-500 truncate">
 {tx.description || (tx.type === 'ubi' ? 'Weekly UBI distribution' : tx.type === 'reward' ? 'Citizen reward grant' : '')}
 </p>
 </div>
 <div className="text-right shrink-0">
 <p className={`text-sm font-bold tabular-nums ${isOutflow ? 'text-red-600 ' : 'text-green-600 '}`}>
 {isOutflow ? '-' : '+'}{tx.amount} $MLY
 </p>
 <p className="text-[10px] text-gray-400">
 {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true }).replace('about ', '')}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 <div className="text-center pt-2">
 <Link href="/transparency" className="text-sm text-teal-600 hover:underline font-medium">
 ← How these algorithms work
 </Link>
 </div>
 </div>
 );
}
