import { useEffect, useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { paymentAPI } from '@/services/api';
import { Button, Badge, Card, Modal, Table, TR, TD, EmptyState, Spinner } from '@/components/ui';
import PaymentForm from '@/components/payments/PaymentForm';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.getAll({ month: filterMonth, year: filterYear, limit: 100 });
      setPayments(res.data.payments);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [filterMonth, filterYear]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this payment?')) return;
    try { await paymentAPI.delete(id); toast.success('Deleted'); fetchPayments(); }
    catch { toast.error('Failed to delete'); }
  };

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const methodColor = { cash: 'success', upi: 'primary', bank: 'blue', other: 'default' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Payments</h1>
          <p className="text-slate-500 text-sm">{payments.length} payments • Total: <span className="text-emerald-400">{fmt(total)}</span></p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus size={16} /> Add Payment
        </Button>
      </div>

      <Card className="flex gap-3 items-center flex-wrap p-3">
        <Filter size={14} className="text-slate-400" />
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
      ) : payments.length === 0 ? (
        <EmptyState icon={Plus} title="No payments" description="Record your first payment"
          action={<Button onClick={() => setModal(true)}><Plus size={16} /> Add Payment</Button>} />
      ) : (
        <Card>
          <Table headers={['Lady', 'Date', 'Amount', 'Method', 'Notes', 'Actions']}>
            {payments.map(p => (
              <TR key={p._id}>
                <TD>
                  <p className="text-white text-xs font-medium">{p.lady?.name || '-'}</p>
                  <p className="text-slate-500 text-xs">{p.lady?.mobile}</p>
                </TD>
                <TD>{format(new Date(p.date), 'dd MMM yyyy')}</TD>
                <TD className="text-emerald-400 font-semibold">{fmt(p.amount)}</TD>
                <TD><Badge variant={methodColor[p.method] || 'default'}>{p.method?.toUpperCase()}</Badge></TD>
                <TD className="text-slate-400 text-xs max-w-32 truncate">{p.notes || '-'}</TD>
                <TD>
                  <button onClick={() => handleDelete(p._id)} className="px-2 py-1 text-xs rounded-lg glass text-red-400 hover:bg-red-500/20 transition-colors">Delete</button>
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Payment">
        <PaymentForm onSave={() => { setModal(false); fetchPayments(); }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}
