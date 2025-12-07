import React, { useState } from 'react';
import { ChevronDown, Search, X, MapPin } from 'lucide-react';

interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
}

const COUNTRIES = [
  "Australia", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "India", 
  "Indonesia", "Italy", "Japan", "Malaysia", "Mexico", "New Zealand", "Philippines", 
  "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", 
  "Thailand", "Turkey", "United Arab Emirates", "United Kingdom", "United States", "Vietnam"
].sort();

const CountrySelector: React.FC<CountrySelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Trigger Button - Compact Pill Style */}
      <div className="flex justify-center w-full">
        <button 
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-full shadow-sm border border-slate-200/60 active:scale-95 transition-all hover:border-brand-200 hover:shadow-md hover:shadow-brand-100/50"
        >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</span>
                <span className="text-sm font-bold text-slate-800">{value}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-300 ml-2 group-hover:text-brand-500 transition-colors" />
        </button>
      </div>

      {/* Modal/Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] animate-in slide-in-from-bottom-20 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Select Destination</h3>
                    <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input 
                        autoFocus
                        type="text"
                        placeholder="Search country..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 text-slate-800 font-bold text-lg outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all"
                    />
                </div>
            </div>
            
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 px-6">
                 <div className="grid grid-cols-1 gap-2 pb-10">
                    {filteredCountries.map(country => (
                        <button
                            key={country}
                            onClick={() => {
                                onChange(country);
                                setIsOpen(false);
                                setSearch('');
                            }}
                            className={`
                                p-4 text-left rounded-2xl transition-all flex items-center justify-between
                                ${value === country 
                                    ? 'bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/30' 
                                    : 'hover:bg-slate-50 text-slate-600 font-semibold'}
                            `}
                        >
                            <span className="text-lg">{country}</span>
                            {value === country && <div className="w-3 h-3 rounded-full bg-white" />}
                        </button>
                    ))}
                    {filteredCountries.length === 0 && (
                        <div className="text-center py-20 text-slate-400 font-medium">
                            No countries found.
                        </div>
                    )}
                 </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CountrySelector;