import { useState, useEffect } from 'react';
import { paymentAPI, ladiesAPI } from '@/services/api';
import { Button, Input, Select, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';

export default function PaymentForm({ defaultLadyId, pendingAmount, onSave, onCancel }) {
  const [form, setForm] = useState({
    lady: defaultLadyId || '',
    amount: '',
    method: 'cash',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [ladies, setLadies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!defaultLadyId) {
      ladiesAPI.getAll({ status: 'active', limit: 100 }).then(res => setLadies(res.data.ladies)).catch(() => {});
    }
  }, [defaultLadyId]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleFullPay = () => setForm(f => ({ ...f, amount: pendingAmount?.toFixed(2) || '' }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lady) return toast.error('Select a lady');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter valid amount');
    setLoading(true);
    try {
      await paymentAPI.create({ ...form, amount: Number(form.amount) });
      toast.success('Payment recorded!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!defaultLadyId && (
        <Select label="Select Lady *" value={form.lady} onChange={set('lady')}>
          <option value="">Choose a lady...</option>
          {ladies.map(l => <option key={l._id} value={l._id}>{l.name} — {l.mobile}</option>)}
        </Select>
      )}

      {pendingAmount !== undefined && (
        <div className="glass rounded-xl p-3 border border-red-500/20 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs">Total Pending</p>
            <p className="text-red-400 text-lg font-bold">₹{Number(pendingAmount).toLocaleString('en-IN')}</p>
          </div>
          <Button type="button" size="sm" variant="danger" onClick={handleFullPay}>Pay Full</Button>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Amount (₹) *" type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={set('amount')} prefix="₹" />
        </div>
        <Select label="Method" value={form.method} onChange={set('method')} className="w-36">
          <option value="cash">💵 Cash</option>
          <option value="upi">📱 UPI</option>
          <option value="bank">🏦 Bank</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <Input label="Date *" type="date" value={form.date} onChange={set('date')} />
      <Textarea label="Notes" placeholder="Optional notes about this payment..." value={form.notes} onChange={set('notes')} rows={2} />

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 justify-center">Cancel</Button>
        <Button type="submit" loading={loading} variant="success" className="flex-1 justify-center">
          Record Payment
        </Button>
      </div>
    </form>
  );
}
