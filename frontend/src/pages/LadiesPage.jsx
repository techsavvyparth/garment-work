import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Phone, Calendar, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { ladiesAPI } from '@/services/api';
import { Button, Input, Badge, Modal, Card, EmptyState, Spinner } from '@/components/ui';
import LadyForm from '@/components/ladies/LadyForm';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function LadiesPage() {
  const [ladies, setLadies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editLady, setEditLady] = useState(null);
  const navigate = useNavigate();

  const fetchLadies = async () => {
    setLoading(true);
    try {
      const res = await ladiesAPI.getAll({ search, status: filter !== 'all' ? filter : undefined });
      setLadies(res.data.ladies);
    } catch { toast.error('Failed to load ladies'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLadies(); }, [search, filter]);

  const handleSave = (lady) => {
    if (editLady) setLadies(prev => prev.map(l => l._id === lady._id ? lady : l));
    else fetchLadies();
    setModalOpen(false);
    setEditLady(null);
  };

  const handleDelete = async (lady) => {
    if (!confirm(`Delete ${lady.name}? This will also delete all work and payment records.`)) return;
    try {
      await ladiesAPI.delete(lady._id);
      setLadies(prev => prev.filter(l => l._id !== lady._id));
      toast.success('Lady deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (e, lady) => {
    e.stopPropagation();
    setEditLady(lady);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Ladies</h1>
          <p className="text-slate-500 text-sm">{ladies.length} workers registered</p>
        </div>
        <Button onClick={() => { setEditLady(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Lady
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-52">
          <Input placeholder="Search by name..." prefix={<Search size={14} />} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${filter === s ? 'bg-violet-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Ladies grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : ladies.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No ladies found"
          description="Add your first lady worker to get started"
          action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add First Lady</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {ladies.map(lady => (
            <Card key={lady._id} className="cursor-pointer hover:border-violet-500/30 transition-all group shine"
              onClick={() => navigate(`/ladies/${lady._id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center shrink-0 border border-violet-500/20">
                    {lady.photo ? (
                      <img src={lady.photo} alt={lady.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-violet-300 font-bold text-base">{lady.name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate group-hover:text-violet-300 transition-colors">{lady.name}</p>
                    <Badge variant={lady.status === 'active' ? 'success' : 'default'} className="mt-0.5">
                      {lady.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => handleEdit(e, lady)} className="p-1.5 rounded-lg hover:bg-violet-500/20 text-slate-500 hover:text-violet-400 transition-colors">
                    <Edit size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(lady); }} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                {lady.mobile && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone size={11} /> {lady.mobile}
                  </div>
                )}
                {lady.lastWorkDate && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={11} /> {format(new Date(lady.lastWorkDate), 'dd MMM yyyy')}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-slate-500 text-xs">Work</p>
                  <p className="text-white text-xs font-semibold">{fmt(lady.totalWorkAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Paid</p>
                  <p className="text-emerald-400 text-xs font-semibold">{fmt(lady.totalPaidAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Pending</p>
                  <p className={`text-xs font-semibold ${lady.pendingAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {fmt(lady.pendingAmount)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditLady(null); }} title={editLady ? 'Edit Lady' : 'Add New Lady'}>
        <LadyForm lady={editLady} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditLady(null); }} />
      </Modal>
    </div>
  );
}
