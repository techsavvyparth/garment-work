import { Loader2, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

// Button
export const Button = ({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25',
    secondary: 'glass text-violet-300 hover:bg-white/10 border border-violet-500/30',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/25',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={`inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
};

// Input
export const Input = ({ label, error, prefix, suffix, className = '', ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-slate-500 text-sm">{prefix}</span>}
      <input
        className={`w-full glass text-white placeholder-slate-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''} ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''} ${className}`}
        {...props}
      />
      {suffix && <span className="absolute right-3 text-slate-500 text-sm">{suffix}</span>}
    </div>
    {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
  </div>
);

// Select
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
    <select className={`w-full glass text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all bg-transparent [&>option]:bg-slate-800 ${error ? 'border-red-500/50' : ''} ${className}`} {...props}>
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// Textarea
export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
    <textarea className={`w-full glass text-white placeholder-slate-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none ${error ? 'border-red-500/50' : ''} ${className}`} rows={3} {...props} />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// Card
export const Card = ({ children, className = '', gradient, ...props }) => (
  <div className={`glass rounded-2xl p-5 ${gradient ? 'shine' : ''} ${className}`} {...props}>
    {children}
  </div>
);

// Badge
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-700/50 text-slate-300',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    primary: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
};

// Modal
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} glass-dark rounded-2xl shadow-2xl border border-violet-500/20 animate-in slide-in-from-bottom-4 duration-300`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// Stat Card
export const StatCard = ({ label, value, icon: Icon, trend, color = 'purple', sub }) => {
  const colors = {
    purple: { bg: 'from-violet-600/20 to-purple-600/20', icon: 'bg-violet-500/20 text-violet-400', text: 'text-violet-400' },
    green: { bg: 'from-emerald-600/20 to-teal-600/20', icon: 'bg-emerald-500/20 text-emerald-400', text: 'text-emerald-400' },
    red: { bg: 'from-red-600/20 to-rose-600/20', icon: 'bg-red-500/20 text-red-400', text: 'text-red-400' },
    pink: { bg: 'from-pink-600/20 to-rose-600/20', icon: 'bg-pink-500/20 text-pink-400', text: 'text-pink-400' },
    blue: { bg: 'from-blue-600/20 to-cyan-600/20', icon: 'bg-blue-500/20 text-blue-400', text: 'text-blue-400' },
  };
  const c = colors[color];
  return (
    <Card className={`bg-gradient-to-br ${c.bg} shine`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-2xl font-bold ${c.text} truncate`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${c.icon} shrink-0 ml-3`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <span className={`text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </span>
        </div>
      )}
    </Card>
  );
};

// Loading spinner
export const Spinner = ({ size = 20, className = '' }) => (
  <Loader2 size={size} className={`animate-spin text-violet-400 ${className}`} />
);

// Empty state
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="p-4 rounded-2xl bg-violet-500/10 mb-4">
        <Icon size={32} className="text-violet-400" />
      </div>
    )}
    <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

// Table wrapper
export const Table = ({ headers, children, className = '' }) => (
  <div className={`overflow-x-auto rounded-xl border border-white/5 ${className}`}>
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10">
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">{children}</tbody>
    </table>
  </div>
);

export const TR = ({ children, onClick, className = '' }) => (
  <tr className={`hover:bg-white/3 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
    {children}
  </tr>
);

export const TD = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-slate-300 whitespace-nowrap ${className}`}>{children}</td>
);
