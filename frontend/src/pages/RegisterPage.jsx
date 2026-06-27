import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A1E] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/30 mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Set up your management system</p>
        </div>

        <div className="glass-dark rounded-2xl p-6 border border-violet-500/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Your Name *" placeholder="Enter your name" value={form.name} onChange={set('name')} />
            <Input label="Company / Factory Name" placeholder="e.g. Shree Enterprises" value={form.companyName} onChange={set('companyName')} />
            <Input label="Email Address *" type="email" placeholder="admin@gmail.com" value={form.email} onChange={set('email')} />
            <Input label="Password *" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
            <Button type="submit" className="w-full justify-center" loading={loading} size="lg">
              <UserPlus size={16} /> Create Account
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
