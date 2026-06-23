import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Download, Printer, Share2, Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ladiesAPI } from '@/services/api';
import { reportsAPI } from '@/services/api';
import { Button, Badge, Card, StatCard, Table, TR, TD, Modal, Spinner, EmptyState } from '@/components/ui';
import WorkForm from '@/components/work/WorkForm';
import PaymentForm from '@/components/payments/PaymentForm';
import { generateLadyPDF, downloadPDF, printPDF } from '@/utils/pdfGenerator';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { workAPI, paymentAPI } from '@/services/api';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '-';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function LadyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [workModal, setWorkModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [editWork, setEditWork] = useState(null);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ladiesAPI.getById(id, { month: filterMonth, year: filterYear });
      setData(res.data);
    } catch { toast.error('Failed to load lady details'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id, filterMonth, filterYear]);

  const handleDeleteWork = async (workId) => {
    if (!confirm('Delete this work entry?')) return;
    try {
      await workAPI.delete(workId);
      toast.success('Work entry deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDeletePayment = async (payId) => {
    if (!confirm('Delete this payment?')) return;
    try {
      await paymentAPI.delete(payId);
      toast.success('Payment deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handlePDF = async () => {
    try {
      const reportRes = await reportsAPI.getLadyMonthly(id, { month: filterMonth, year: filterYear });
      const { lady, works, payments, summary } = reportRes.data;
      const doc = generateLadyPDF({ lady, works, payments, summary, user, month: filterMonth, year: filterYear });
      downloadPDF(doc, `${lady.name}-${MONTHS[filterMonth - 1]}-${filterYear}.pdf`);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF generation failed'); }
  };

  const handlePrint = async () => {
    try {
      const reportRes = await reportsAPI.getLadyMonthly(id, { month: filterMonth, year: filterYear });
      const { lady, works, payments, summary } = reportRes.data;
      const doc = generateLadyPDF({ lady, works, payments, summary, user, month: filterMonth, year: filterYear });
      printPDF(doc);
    } catch { toast.error('Print failed'); }
  };

  const handleWhatsApp = () => {
    const msg = `*Work Report - ${data?.lady?.name}*\n\nMonth: ${MONTHS[filterMonth - 1]} ${filterYear}\nTotal Work: ${fmt(data?.summary?.currentMonthTotal)}\nPending: ${fmt(data?.summary?.pendingAmount)}\n\n_Ladies Work Management System_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size={32} /></div>;
  if (!data) return null;

  const { lady, allWork, monthWork, allPayments, summary } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/ladies')} className="p-2 rounded-xl glass text-slate-400 hover:text-white transition-colors mt-1">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center border border-violet-500/20 shrink-0">
              {lady.photo ? <img src={lady.photo} className="w-full h-full object-cover rounded-xl" alt={lady.name} /> :
                <span className="text-violet-300 font-bold text-lg">{lady.name[0]}</span>}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{lady.name}</h1>
              <div className="flex items-center gap-3 text-slate-400 text-xs mt-0.5">
                {lady.mobile && <span className="flex items-center gap-1"><Phone size={10} />{lady.mobile}</span>}
                {lady.address && <span className="flex items-center gap-1"><MapPin size={10} />{lady.address}</span>}
                <Badge variant={lady.status === 'active' ? 'success' : 'default'}>{lady.status}</Badge>
              </div>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" onClick={handlePDF}><Download size={14} /> PDF</Button>
          <Button size="sm" variant="secondary" onClick={handlePrint}><Printer size={14} /> Print</Button>
          <Button size="sm" variant="secondary" onClick={handleWhatsApp}><Share2 size={14} /> WhatsApp</Button>
        </div>
      </div>

      {/* Month filter */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Filter:</span>
        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
          className="glass text-white text-xs rounded-lg px-2 py-1.5 bg-transparent [&>option]:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
          className="glass text-white text-xs rounded-lg px-2 py-1.5 bg-transparent [&>option]:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Work" value={fmt(summary.totalWorkAmount)} color="purple" />
        <StatCard label="Total Paid" value={fmt(summary.totalPaidAmount)} color="green" />
        <StatCard label="Total Pending" value={fmt(summary.pendingAmount)} color="red" />
        <StatCard label={`${MONTHS[filterMonth - 1]} Work`} value={fmt(summary.currentMonthTotal)} color="blue" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={() => { setEditWork(null); setWorkModal(true); }}>
          <Plus size={16} /> Add Work
        </Button>
        <Button variant="success" onClick={() => setPaymentModal(true)}>
          <CreditCard size={16} /> Add Payment
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'current', label: `${MONTHS[filterMonth - 1]} Work` },
          { key: 'all', label: 'All Work' },
          { key: 'payments', label: 'Payments' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${activeTab === tab.key ? 'bg-violet-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Work Tables */}
      {activeTab === 'current' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">{MONTHS[filterMonth - 1]} {filterYear} Work</h2>
            <span className="text-violet-400 text-sm font-semibold">{fmt(monthWork?.reduce((s, w) => s + w.totalAmount, 0))}</span>
          </div>
          {monthWork?.length > 0 ? (
            <Table headers={['Date', 'Work Type', 'Qty', 'Rate', 'Total', '']}>
              {monthWork.map(w => (
                <TR key={w._id}>
                  <TD>{fmtDate(w.date)}</TD>
                  <TD><span className="text-violet-300">{w.workType}</span></TD>
                  <TD>{w.quantity}</TD>
                  <TD>{fmt(w.rate)}</TD>
                  <TD className="text-emerald-400 font-medium">{fmt(w.totalAmount)}</TD>
                  <TD>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditWork(w); setWorkModal(true); }} className="p-1.5 rounded-lg hover:bg-violet-500/20 text-slate-500 hover:text-violet-400 transition-colors">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDeleteWork(w._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          ) : <EmptyState icon={Plus} title="No work this month" description="Add work entries for this month" />}
        </Card>
      )}

      {activeTab === 'all' && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4">Complete Work History</h2>
          {allWork?.length > 0 ? (
            <Table headers={['Date', 'Work Type', 'Qty', 'Rate', 'Total', 'Status', '']}>
              {allWork.map(w => (
                <TR key={w._id}>
                  <TD>{fmtDate(w.date)}</TD>
                  <TD><span className="text-violet-300">{w.workType}</span></TD>
                  <TD>{w.quantity}</TD>
                  <TD>{fmt(w.rate)}</TD>
                  <TD className="text-emerald-400 font-medium">{fmt(w.totalAmount)}</TD>
                  <TD><Badge variant={w.paymentStatus === 'paid' ? 'success' : w.paymentStatus === 'partial' ? 'warning' : 'danger'}>{w.paymentStatus}</Badge></TD>
                  <TD>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditWork(w); setWorkModal(true); }} className="p-1.5 rounded-lg hover:bg-violet-500/20 text-slate-500 hover:text-violet-400 transition-colors"><Edit size={12} /></button>
                      <button onClick={() => handleDeleteWork(w._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          ) : <EmptyState icon={Plus} title="No work history" />}
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4">Payment History</h2>
          {allPayments?.length > 0 ? (
            <Table headers={['Date', 'Amount', 'Method', 'Notes', '']}>
              {allPayments.map(p => (
                <TR key={p._id}>
                  <TD>{fmtDate(p.date)}</TD>
                  <TD className="text-emerald-400 font-semibold">{fmt(p.amount)}</TD>
                  <TD><Badge variant="primary">{p.method?.toUpperCase()}</Badge></TD>
                  <TD className="text-slate-400 max-w-32 truncate">{p.notes || '-'}</TD>
                  <TD>
                    <button onClick={() => handleDeletePayment(p._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  </TD>
                </TR>
              ))}
            </Table>
          ) : <EmptyState icon={CreditCard} title="No payments yet" />}
        </Card>
      )}

      {/* Modals */}
      <Modal isOpen={workModal} onClose={() => { setWorkModal(false); setEditWork(null); }} title={editWork ? 'Edit Work Entry' : 'Add Work Entry'}>
        <WorkForm work={editWork} defaultLadyId={id} onSave={() => { setWorkModal(false); setEditWork(null); fetchData(); }} onCancel={() => { setWorkModal(false); setEditWork(null); }} />
      </Modal>

      <Modal isOpen={paymentModal} onClose={() => setPaymentModal(false)} title="Add Payment">
        <PaymentForm defaultLadyId={id} pendingAmount={summary.pendingAmount} onSave={() => { setPaymentModal(false); fetchData(); }} onCancel={() => setPaymentModal(false)} />
      </Modal>
    </div>
  );
}
