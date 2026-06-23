import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, CreditCard, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { reportsAPI } from '@/services/api';
import { StatCard, Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl px-3 py-2 border border-violet-500/20 text-xs">
      <p className="text-violet-400 font-medium">{fmt(payload[0]?.value)}</p>
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    reportsAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  );

  const chartData = data?.monthlyChart?.map(m => ({
    name: `${MONTHS[(m._id.month || 1) - 1]} ${m._id.year}`,
    work: m.work || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/work')} variant="secondary">
            <Plus size={14} /> Add Work
          </Button>
          <Button size="sm" onClick={() => navigate('/payments')}>
            <CreditCard size={14} /> Pay
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Ladies" value={data?.ladyCount || 0} icon={Users} color="purple" />
        <StatCard label="This Month Work" value={fmt(data?.currentMonthWork)} icon={TrendingUp} color="blue" />
        <StatCard label="Total Paid" value={fmt(data?.totalPaid)} icon={CreditCard} color="green" />
        <StatCard label="Total Pending" value={fmt(data?.totalPending)} icon={AlertCircle} color="red" />
      </div>

      {/* Chart + Pending Ladies */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Monthly Work Amount</h2>
            <Badge variant="primary">Last 6 Months</Badge>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="workGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="work" stroke="#7C3AED" strokeWidth={2} fill="url(#workGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={TrendingUp} title="No data yet" description="Work entries will appear here" />
          )}
        </Card>

        {/* Pending Ladies */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Pending Payments</h2>
            <button onClick={() => navigate('/reports')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {data?.pendingLadies?.length > 0 ? data.pendingLadies.map(lady => (
              <div key={lady._id} onClick={() => navigate(`/ladies/${lady._id}`)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center shrink-0">
                  <span className="text-violet-300 text-xs font-bold">{lady.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate group-hover:text-violet-300 transition-colors">{lady.name}</p>
                  <p className="text-slate-500 text-xs">₹{lady.totalWork?.toLocaleString('en-IN')}</p>
                </div>
                <span className="text-red-400 text-xs font-semibold">₹{Math.round(lady.pending).toLocaleString('en-IN')}</span>
              </div>
            )) : (
              <p className="text-slate-500 text-xs text-center py-4">No pending payments 🎉</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Work */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Work Entries</h2>
          <button onClick={() => navigate('/work')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View All <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {data?.recentWork?.length > 0 ? data.recentWork.map(w => (
            <div key={w._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                <span className="text-violet-400 text-xs">✂</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{w.lady?.name || 'Unknown'} — {w.workType}</p>
                <p className="text-slate-500 text-xs">{w.quantity} pcs × ₹{w.rate} • {format(new Date(w.date), 'dd MMM')}</p>
              </div>
              <span className="text-emerald-400 text-sm font-semibold">₹{w.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          )) : (
            <EmptyState icon={TrendingUp} title="No work entries" description="Start adding work entries for your ladies" />
          )}
        </div>
      </Card>
    </div>
  );
}
