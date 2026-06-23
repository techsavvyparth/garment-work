import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, AlertCircle, TrendingUp, Users, BarChart3, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { reportsAPI, ladiesAPI, workAPI, paymentAPI } from '@/services/api';
import { Button, Card, Badge, StatCard, Table, TR, TD, Spinner, EmptyState } from '@/components/ui';
import { generateLadyPDF, downloadPDF } from '@/utils/pdfGenerator';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const COLORS = ['#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl px-3 py-2 border border-violet-500/20 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [pendingData, setPendingData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [workTypeData, setWorkTypeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [pdfLoading, setPdfLoading] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  useEffect(() => {
    Promise.all([
      reportsAPI.getPending(),
      workAPI.getAll({ limit: 500 }),
    ]).then(([pendRes, workRes]) => {
      setPendingData(pendRes.data.data);

      // Build monthly chart from work entries
      const byMonth = {};
      workRes.data.works.forEach(w => {
        const key = `${MONTHS[(w.month || 1) - 1]} ${w.year}`;
        byMonth[key] = (byMonth[key] || 0) + w.totalAmount;
      });
      const chart = Object.entries(byMonth).slice(-6).map(([name, work]) => ({ name, work }));
      setChartData(chart);

      // Work type breakdown
      const byType = {};
      workRes.data.works.forEach(w => {
        byType[w.workType] = (byType[w.workType] || 0) + w.totalAmount;
      });
      const typeData = Object.entries(byType)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
      setWorkTypeData(typeData);
    }).catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const handleBulkPDF = async (lady) => {
    setPdfLoading(lady._id);
    try {
      const { reportsAPI: rAPI } = await import('@/services/api');
      const res = await rAPI.getLadyMonthly(lady._id, { month: filterMonth, year: filterYear });
      const { works, payments, summary } = res.data;
      const doc = generateLadyPDF({ lady, works, payments, summary, user, month: filterMonth, year: filterYear });
      downloadPDF(doc, `${lady.name}-${MONTHS[filterMonth - 1]}-${filterYear}.pdf`);
      toast.success(`PDF for ${lady.name} downloaded!`);
    } catch { toast.error('PDF failed'); }
    finally { setPdfLoading(null); }
  };

  const totalPending = pendingData.reduce((s, l) => s + (l.pending || 0), 0);

  if (loading) return <div className="flex justify-center py-32"><Spinner size={32} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Reports</h1>
          <p className="text-slate-500 text-sm">Business insights & analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
            className="glass text-white text-xs rounded-lg px-3 py-2 bg-transparent [&>option]:bg-slate-800 focus:outline-none">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
            className="glass text-white text-xs rounded-lg px-3 py-2 bg-transparent [&>option]:bg-slate-800 focus:outline-none">
            {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Ladies with Pending" value={pendingData.length} icon={Users} color="red" />
        <StatCard label="Total Pending Amount" value={fmt(totalPending)} icon={AlertCircle} color="red" />
        <StatCard label="Work Types Active" value={workTypeData.length} icon={BarChart3} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'pending', label: '⚠ Pending Report' },
          { key: 'chart', label: '📊 Monthly Chart' },
          { key: 'worktype', label: '🧵 Work Breakdown' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${activeTab === tab.key ? 'bg-violet-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pending Report */}
      {activeTab === 'pending' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Pending Payments — All Ladies</h2>
            <Badge variant="danger">{pendingData.length} ladies pending</Badge>
          </div>
          {pendingData.length === 0 ? (
            <EmptyState icon={AlertCircle} title="No pending payments" description="All ladies are fully paid!" />
          ) : (
            <Table headers={['Lady', 'Mobile', 'Total Work', 'Paid', 'Pending', 'Status', 'Actions']}>
              {pendingData.map(lady => (
                <TR key={lady._id} onClick={() => navigate(`/ladies/${lady._id}`)} className="cursor-pointer">
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center shrink-0">
                        <span className="text-violet-300 text-xs font-bold">{lady.name[0]}</span>
                      </div>
                      <span className="text-white font-medium">{lady.name}</span>
                    </div>
                  </TD>
                  <TD>{lady.mobile}</TD>
                  <TD className="text-slate-300">{fmt(lady.totalWork)}</TD>
                  <TD className="text-emerald-400">{fmt(lady.totalPaid)}</TD>
                  <TD className="text-red-400 font-bold">{fmt(lady.pending)}</TD>
                  <TD>
                    <Badge variant={lady.pending > 5000 ? 'danger' : 'warning'}>
                      {lady.pending > 5000 ? 'High' : 'Medium'}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="secondary"
                        loading={pdfLoading === lady._id}
                        onClick={() => handleBulkPDF(lady)}>
                        <Download size={12} /> PDF
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          )}
          {/* Total row */}
          {pendingData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <div className="glass rounded-xl px-6 py-3 flex gap-8">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Total Work</p>
                  <p className="text-white font-bold">{fmt(pendingData.reduce((s, l) => s + l.totalWork, 0))}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Total Paid</p>
                  <p className="text-emerald-400 font-bold">{fmt(pendingData.reduce((s, l) => s + l.totalPaid, 0))}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Total Pending</p>
                  <p className="text-red-400 font-bold text-lg">{fmt(totalPending)}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Monthly Chart */}
      {activeTab === 'chart' && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4">Monthly Work Amount (Last 6 Months)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="work" name="Work Amount" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={BarChart3} title="No chart data" description="Add work entries to see chart" />
          )}
        </Card>
      )}

      {/* Work Type Breakdown */}
      {activeTab === 'worktype' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h2 className="text-sm font-semibold text-white mb-4">Work Type Distribution</h2>
            {workTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={workTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {workTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} title="No data" />
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-white mb-4">Work Type Summary</h2>
            <div className="space-y-3">
              {workTypeData.map((item, i) => {
                const maxVal = workTypeData[0]?.value || 1;
                const pct = (item.value / maxVal) * 100;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{item.name}</span>
                      <span className="font-medium" style={{ color: COLORS[i % COLORS.length] }}>{fmt(item.value)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
              {workTypeData.length === 0 && <EmptyState icon={BarChart3} title="No work data yet" />}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
