
import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, AlertCircle, Smartphone } from 'lucide-react';
import { validateAccessCode, getDeviceId } from '../services/authService';

interface AccessGateProps {
  onUnlock: () => void;
}

const AccessGate: React.FC<AccessGateProps> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    setDeviceId(getDeviceId());
    
    // Check URL params for auto-fill
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) {
      setCode(urlCode);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await validateAccessCode(code, deviceId);
      if (result.valid) {
        onUnlock();
      } else {
        setError(result.message || 'Invalid code');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 animate-in slide-in-from-top-10 duration-700">
         <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Zap className="w-6 h-6 fill-current" />
         </div>
         <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 leading-none">Food Scanner</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Inventory Assistant</p>
         </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 animate-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome</h2>
            <p className="text-slate-500 text-sm font-medium">Please enter your unique code to activate the app.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-wider">Unique Code</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="XXXX-XXXX"
                maxLength={9}
                className={`w-full text-center text-2xl font-bold tracking-widest py-4 rounded-2xl bg-slate-50 border-2 outline-none transition-all placeholder:text-slate-200 text-slate-800 uppercase
                  ${error ? 'border-red-100 bg-red-50 text-red-600' : 'border-transparent focus:border-brand-500/30 focus:bg-white focus:ring-4 focus:ring-brand-500/10'}
                `}
              />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold justify-center bg-red-50 p-3 rounded-xl animate-in fade-in">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading || !code}
            className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/30 active:scale-[0.98] transition-all hover:bg-brand-600 hover:shadow-brand-500/40 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <span className="opacity-80">Verifying...</span>
            ) : (
              <>
                Activate App
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 opacity-50">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ID: {deviceId}</span>
        </div>

      </div>

    </div>
  );
};

export default AccessGate;
