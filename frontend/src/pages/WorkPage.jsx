import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { workAPI } from '@/services/api';
import { Button, Input, Badge, Card, Modal, Table, TR, TD, EmptyState, Spinner } from '@/components/ui';
import WorkForm from '@/components/work/WorkForm';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function WorkPage() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editWork, setEditWork] = useState(null);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [total, setTotal] = useState(0);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await workAPI.getAll({ month: filterMonth, year: filterYear, limit: 100 });
      setWorks(res.data.works);
      setTotal(res.data.works.reduce((s, w) => s + w.totalAmount, 0));
    } catch { toast.error('Failed to load work entries'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filterMonth, filterYear]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this work entry?')) return;
    try { await workAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Work Entries</h1>
          <p className="text-slate-500 text-sm">{works.length} entries • Total: <span className="text-violet-400">{fmt(total)}</span></p>
        </div>
        <Button onClick={() => { setEditWork(null); setModal(true); }}>
          <Plus size={16} /> Add Work
        </Button>
      </div>

      {/* Month filter */}
      <Card className="flex gap-3 items-center flex-wrap p-3">
        <Filter size={14} className="text-slate-400" />
        <span className="text-slate-400 text-xs">Filter by:</span>
        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
          className="glass text-white text-xs rounded-lg px-3 py-1.5 bg-transparent [&>option]:bg-slate-800 focus:outline-none">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
          className="glass text-white text-xs rounded-lg px-3 py-1.5 bg-transparent [&>option]:bg-slate-800 focus:outline-none">
          {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : works.length === 0 ? (
        <EmptyState icon={Plus} title="No work entries" description="Add work entries for your ladies" action={<Button onClick={() => setModal(true)}><Plus size={16} /> Add First Entry</Button>} />
      ) : (
        <Card>
          <Table headers={['Lady', 'Date', 'Work Type', 'Qty', 'Rate', 'Total', 'Status', 'Actions']}>
            {works.map(w => (
              <TR key={w._id}>
                <TD>
                  <div>
                    <p className="text-white text-xs font-medium">{w.lady?.name || '-'}</p>
                    <p className="text-slate-500 text-xs">{w.lady?.mobile}</p>
                  </div>
                </TD>
                <TD>{format(new Date(w.date), 'dd MMM')}</TD>
                <TD><span className="text-violet-300 text-xs">{w.workType}</span></TD>
                <TD>{w.quantity}</TD>
                <TD>{fmt(w.rate)}</TD>
                <TD className="text-emerald-400 font-semibold">{fmt(w.totalAmount)}</TD>
                <TD><Badge variant={w.paymentStatus === 'paid' ? 'success' : w.paymentStatus === 'partial' ? 'warning' : 'danger'}>{w.paymentStatus}</Badge></TD>
                <TD>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditWork(w); setModal(true); }} className="px-2 py-1 text-xs rounded-lg glass text-violet-400 hover:bg-violet-500/20 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(w._id)} className="px-2 py-1 text-xs rounded-lg glass text-red-400 hover:bg-red-500/20 transition-colors">Del</button>
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      <Modal isOpen={modal} onClose={() => { setModal(false); setEditWork(null); }} title={editWork ? 'Edit Work' : 'Add Work Entry'}>
        <WorkForm work={editWork} onSave={() => { setModal(false); setEditWork(null); fetch(); }} onCancel={() => { setModal(false); setEditWork(null); }} />
      </Modal>
    </div>
  );
}
