import React from 'react';
import { DeclaredItem } from '../types';
import { Trash2, ShoppingBag, ImageOff, Edit3 } from 'lucide-react';

interface DeclarationListProps {
  items: DeclaredItem[];
  onDelete: (id: string) => void;
  onEdit: (item: DeclaredItem) => void;
}

const DeclarationList: React.FC<DeclarationListProps> = ({ items, onDelete, onEdit }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 mt-2">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
           <ShoppingBag className="w-10 h-10 text-slate-200" />
        </div>
        <p className="text-lg font-bold text-slate-400">Your list is empty</p>
        <p className="text-sm text-slate-300 mt-2">Scan an item to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <div className="flex justify-between items-end px-2">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Your Items <span className="bg-slate-100 text-slate-500 text-sm font-bold px-2 py-1 rounded-lg ml-2 align-middle">{items.length}</span></h3>
      </div>
      
      <div className="space-y-4">
        {items.map((item) => (
            <div 
            key={item.id}
            onClick={() => onEdit(item)}
            className="group bg-white rounded-[1.75rem] p-4 shadow-[0_2px_15px_-6px_rgba(0,0,0,0.06)] border border-slate-100 flex gap-5 items-center cursor-pointer active:scale-[0.99] transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-200"
            >
            {/* Thumbnail */}
            <div className="w-24 h-24 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden relative border border-slate-100 shadow-sm">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageOff className="w-8 h-8" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 py-1 space-y-1">
                <div className="flex flex-wrap gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 text-[10px] font-bold uppercase tracking-wider">
                        {item.brand}
                    </span>
                    {item.weight && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            {item.weight}
                        </span>
                    )}
                </div>
                <h4 className="font-bold text-slate-900 text-lg leading-tight truncate pr-2">{item.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed">
                    {item.ingredients}
                </p>
            </div>

            <div className="flex flex-col items-center gap-3 pr-1">
                <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-slate-900/20">
                    {item.quantity}
                </span>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default DeclarationList;