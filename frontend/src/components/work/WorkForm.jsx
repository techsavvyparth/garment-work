import { useState, useEffect } from 'react';
import { workAPI, ladiesAPI } from '@/services/api';
import { Button, Input, Select, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';

const DEFAULT_TYPES = ['Stitching', 'Packing', 'Handwork', 'Cutting', 'Finishing', 'Embroidery', 'Beading', 'Knitting'];

export default function WorkForm({ work, defaultLadyId, onSave, onCancel }) {
  const [form, setForm] = useState({
    lady: work?.lady?._id || work?.lady || defaultLadyId || '',
    workType: work?.workType || '',
    customType: '',
    quantity: work?.quantity || '',
    rate: work?.rate || '',
    date: work?.date ? work.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    notes: work?.notes || '',
    paymentStatus: work?.paymentStatus || 'pending',
  });
  const [ladies, setLadies] = useState([]);
  const [workTypes, setWorkTypes] = useState(DEFAULT_TYPES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ladiesAPI.getAll({ status: 'active', limit: 100 }).then(res => setLadies(res.data.ladies)).catch(() => {});
    workAPI.getTypes().then(res => {
      const all = [...new Set([...DEFAULT_TYPES, ...res.data.types])];
      setWorkTypes(all);
    }).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const totalAmount = form.quantity && form.rate ? (parseFloat(form.quantity) * parseFloat(form.rate)).toFixed(2) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lady) return toast.error('Select a lady');
    if (!form.quantity || !form.rate) return toast.error('Quantity and rate are required');
    const workType = form.workType === '__custom__' ? form.customType : form.workType;
    if (!workType) return toast.error('Select work type');

    setLoading(true);
    try {
      const payload = { ...form, workType, totalAmount: Number(totalAmount) };
      delete payload.customType;
      if (work) await workAPI.update(work._id, payload);
      else await workAPI.create(payload);
      toast.success(work ? 'Work updated!' : 'Work entry added!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
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

      <div className="grid grid-cols-2 gap-3">
        <Select label="Work Type *" value={form.workType} onChange={set('workType')}>
          <option value="">Select type...</option>
          {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
          <option value="__custom__">+ Custom Type</option>
        </Select>
        {form.workType === '__custom__' && (
          <Input label="Custom Type *" placeholder="Enter work type" value={form.customType} onChange={set('customType')} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Quantity (pieces) *" type="number" placeholder="0" min="0" value={form.quantity} onChange={set('quantity')} />
        <Input label="Rate per piece (₹) *" type="number" placeholder="0.00" min="0" step="0.01" value={form.rate} onChange={set('rate')} />
      </div>

      {/* Auto total */}
      <div className="glass rounded-xl px-4 py-3 border border-violet-500/20 flex items-center justify-between">
        <span className="text-slate-400 text-sm">Total Amount</span>
        <span className="text-emerald-400 text-xl font-bold">₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Date *" type="date" value={form.date} onChange={set('date')} />
        <Select label="Payment Status" value={form.paymentStatus} onChange={set('paymentStatus')}>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </Select>
      </div>

      <Textarea label="Notes" placeholder="Optional notes..." value={form.notes} onChange={set('notes')} rows={2} />

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 justify-center">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1 justify-center">
          {work ? 'Save Changes' : 'Add Entry'}
        </Button>
      </div>
    </form>
  );
}
