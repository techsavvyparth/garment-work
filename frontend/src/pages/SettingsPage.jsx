import { useState } from 'react';
import { Building2, Lock, Download, Upload, Bell, Palette, Shield } from 'lucide-react';
import { authAPI } from '@/services/api';
import { Button, Input, Card, Textarea } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    companyName: user?.companyName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    companyLogo: user?.companyLogo || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const setP = (k) => (e) => setProfile(f => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPasswords(f => ({ ...f, [k]: e.target.value }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200000) return toast.error('Logo must be under 200KB');
    const reader = new FileReader();
    reader.onload = (ev) => setProfile(f => ({ ...f, companyLogo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword)
      return toast.error('New passwords do not match');
    if (passwords.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters');
    setPassLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const tabs = [
    { key: 'company', icon: Building2, label: 'Company' },
    { key: 'security', icon: Lock, label: 'Security' },
    { key: 'backup', icon: Download, label: 'Backup' },
    { key: 'about', icon: Shield, label: 'About' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your account and preferences</p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${activeTab === key ? 'bg-violet-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Company Profile */}
      {activeTab === 'company' && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-violet-400" /> Company Profile
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 flex items-center justify-center overflow-hidden">
                {profile.companyLogo ? (
                  <img src={profile.companyLogo} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <Building2 size={24} className="text-violet-400" />
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-block px-3 py-1.5 rounded-lg glass text-violet-400 text-xs border border-violet-500/30 hover:bg-violet-500/10 transition-colors">
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                <p className="text-slate-500 text-xs mt-1">PNG/JPG, max 200KB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Your Name" value={profile.name} onChange={setP('name')} placeholder="Admin name" />
              <Input label="Company / Factory Name" value={profile.companyName} onChange={setP('companyName')} placeholder="e.g. Shree Enterprises" />
            </div>
            <Input label="Phone Number" value={profile.phone} onChange={setP('phone')} placeholder="9876543210" type="tel" />
            <Input label="Address" value={profile.address} onChange={setP('address')} placeholder="Company address" />

            <div className="pt-1">
              <p className="text-xs text-slate-500 mb-3">Email: <span className="text-slate-300">{user?.email}</span> (cannot be changed)</p>
              <Button type="submit" loading={profileLoading}>Save Profile</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Lock size={16} className="text-violet-400" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input label="Current Password" type="password" value={passwords.currentPassword} onChange={setPw('currentPassword')} placeholder="Enter current password" />
            <Input label="New Password" type="password" value={passwords.newPassword} onChange={setPw('newPassword')} placeholder="Min 6 characters" />
            <Input label="Confirm New Password" type="password" value={passwords.confirmPassword} onChange={setPw('confirmPassword')} placeholder="Repeat new password" />
            <Button type="submit" loading={passLoading} variant="danger">Change Password</Button>
          </form>
        </Card>
      )}

      {/* Backup */}
      {activeTab === 'backup' && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Download size={16} className="text-violet-400" /> Backup & Restore
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
              <h3 className="text-white text-sm font-medium mb-1">Export Data</h3>
              <p className="text-slate-400 text-xs mb-3">Download all your data as JSON backup file.</p>
              <Button size="sm" variant="secondary" onClick={() => toast.success('Backup feature — connect to your backend API endpoint')}>
                <Download size={14} /> Download Backup
              </Button>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <h3 className="text-white text-sm font-medium mb-1">Restore Data</h3>
              <p className="text-slate-400 text-xs mb-3">Restore from a previous backup file. This will overwrite existing data.</p>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-amber-400 text-xs border border-amber-500/30 hover:bg-amber-500/10 transition-colors">
                  <Upload size={14} /> Upload Backup
                </span>
                <input type="file" accept=".json" className="hidden" onChange={() => toast.success('Restore feature — connect to your backend API')} />
              </label>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <h3 className="text-white text-sm font-medium mb-1">PWA Status</h3>
              <p className="text-slate-400 text-xs mb-2">Install this app on your device for offline access.</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-xs">Service Worker Active</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* About */}
      {activeTab === 'about' && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={16} className="text-violet-400" /> About
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">LW</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Ladies Work System</h3>
                <p className="text-violet-400 text-sm">v1.0.0 — Production</p>
                <p className="text-slate-500 text-xs mt-1">Professional Piece-Work Management</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Tech Stack', 'Node + React + PWA'],
                ['Frontend', 'React + Vite + Tailwind'],
                ['Backend', 'Node.js + Express'],
                ['Database', 'JSON File DB'],
                ['Auth', 'JWT + bcrypt'],
                ['Offline', 'IndexedDB + SW'],
              ].map(([k, v]) => (
                <div key={k} className="glass rounded-lg p-3">
                  <p className="text-slate-500">{k}</p>
                  <p className="text-violet-300 font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
