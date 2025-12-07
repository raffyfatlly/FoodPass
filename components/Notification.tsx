import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, Sparkles, X } from 'lucide-react';

export type NotificationType = 'success' | 'info' | 'ai';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    // Auto close only for simple success messages after 3s
    if (type === 'success') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const styles = {
    success: { bg: 'bg-green-500', icon: CheckCircle2, shadow: 'shadow-green-500/30' },
    info: { bg: 'bg-slate-800', icon: Info, shadow: 'shadow-slate-800/30' },
    ai: { bg: 'bg-brand-500', icon: Sparkles, shadow: 'shadow-brand-500/40' },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 animate-in slide-in-from-top-4 duration-300">
      <div className={`${style.bg} ${style.shadow} p-4 rounded-2xl text-white shadow-xl flex items-start gap-3 relative`}>
        <div className="p-1 bg-white/20 rounded-lg shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 pt-0.5">
            {type === 'ai' && <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Customs Insight</p>}
            <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-4 h-4 opacity-70" />
        </button>
      </div>
    </div>
  );
};

export default Notification;