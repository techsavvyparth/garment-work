import { useState } from 'react';
import { ladiesAPI } from '@/services/api';
import { Button, Input, Select, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';

export default function LadyForm({ lady, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: lady?.name || '',
    mobile: lady?.mobile || '',
    address: lady?.address || '',
    status: lady?.status || 'active',
    notes: lady?.notes || '',
    photo: lady?.photo || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) return toast.error('Photo must be under 500KB');
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.mobile.trim()) return toast.error('Mobile number is required');
    setLoading(true);
    try {
      let res;
      if (lady) res = await ladiesAPI.update(lady._id, form);
      else res = await ladiesAPI.create(form);
      toast.success(lady ? 'Lady updated!' : 'Lady added!');
      onSave(res.data.lady);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 flex items-center justify-center overflow-hidden">
          {form.photo ? (
            <img src={form.photo} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <span className="text-violet-400 text-2xl font-bold">{form.name[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
        <div>
          <label className="cursor-pointer inline-block px-3 py-1.5 rounded-lg glass text-violet-400 text-xs border border-violet-500/30 hover:bg-violet-500/10 transition-colors">
            Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
          <p className="text-slate-500 text-xs mt-1">Max 500KB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Full Name *" placeholder="e.g. Reena Patel" value={form.name} onChange={set('name')} />
        <Input label="Mobile Number *" placeholder="9876543210" value={form.mobile} onChange={set('mobile')} type="tel" />
      </div>

      <Textarea label="Address" placeholder="Home address..." value={form.address} onChange={set('address')} rows={2} />
      
      <Select label="Status" value={form.status} onChange={set('status')}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>

      <Textarea label="Notes" placeholder="Any additional notes..." value={form.notes} onChange={set('notes')} rows={2} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 justify-center">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1 justify-center">
          {lady ? 'Save Changes' : 'Add Lady'}
        </Button>
      </div>
    </form>
  );
}
