import React, { useState, useEffect } from 'react';
import { DeclaredItem, ScanResult } from '../types';
import { X, Camera, Sparkles, Scale } from 'lucide-react';

interface ItemFormProps {
  initialData?: Partial<DeclaredItem> | ScanResult;
  onSave: (item: Omit<DeclaredItem, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    ingredients: '',
    weight: '',
    quantity: 1,
    image: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        brand: initialData.brand || '',
        name: initialData.name || '',
        ingredients: initialData.ingredients || '',
        weight: initialData.weight || '',
        quantity: initialData.quantity || 1,
        image: initialData.image || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Removed strict image validation to allow manual entry without photo
    onSave(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col h-[95vh] sm:h-auto sm:max-h-[92vh] animate-in slide-in-from-bottom-20 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6 flex items-center justify-between border-b border-slate-50">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {initialData && (initialData as any).id ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button onClick={onCancel} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10">
          
          {/* Image Section */}
          <div className="flex flex-col items-center justify-center">
             {formData.image ? (
               <div className="relative w-56 h-56 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-brand-500/15 border-4 border-white ring-1 ring-slate-100 group">
                  <img src={formData.image} alt="Item" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                        <Camera className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
               </div>
             ) : (
               <div className="w-full">
                  <label className="flex flex-col items-center gap-5 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-400 hover:shadow-lg transition-all cursor-pointer group">
                      <div className="w-20 h-20 rounded-full bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform duration-300">
                          <Camera className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                          <p className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">Add Product Photo</p>
                          <p className="text-sm text-slate-400 font-medium">Tap to capture or upload (Optional)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                  </label>
               </div>
             )}
          </div>

          <div className="space-y-8">
             {/* Product Details Group */}
             <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Brand Name</label>
                    <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-800 font-bold text-lg placeholder:text-slate-300 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/20 focus:bg-white transition-all outline-none"
                        placeholder="e.g. Nestle"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Product Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-800 font-bold text-lg placeholder:text-slate-300 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/20 focus:bg-white transition-all outline-none"
                        placeholder="e.g. KitKat Gold"
                    />
                </div>
             </div>
          
            {/* Ingredients */}
            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingredients List</label>
                    {initialData && initialData.ingredients && (
                        <div className="flex items-center gap-1 text-xs font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Detected</span>
                        </div>
                    )}
                </div>
                <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-base text-slate-700 font-medium h-32 resize-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/20 focus:bg-white transition-all outline-none leading-relaxed"
                placeholder="List ingredients..."
                />
            </div>

            {/* Weight & Quantity Row */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Net Weight</label>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent text-slate-800 font-bold text-lg placeholder:text-slate-300 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/20 focus:bg-white transition-all outline-none"
                            placeholder="e.g. 250g"
                        />
                        <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Quantity</label>
                    <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-transparent focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500/20 focus-within:bg-white transition-all h-[54px]">
                        <button 
                            type="button" 
                            onClick={() => setFormData(p => ({...p, quantity: Math.max(1, p.quantity - 1)}))}
                            className="w-10 h-full rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600 font-bold text-xl active:scale-90 transition-transform hover:bg-slate-50"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="1"
                            required
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                            className="flex-1 bg-transparent border-0 text-slate-900 font-bold text-xl text-center focus:ring-0 outline-none p-0"
                        />
                        <button 
                            type="button" 
                            onClick={() => setFormData(p => ({...p, quantity: p.quantity + 1}))}
                            className="w-10 h-full rounded-xl bg-brand-500 shadow-sm flex items-center justify-center text-white font-bold text-xl active:scale-90 transition-transform hover:bg-brand-600"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 bg-white flex gap-4 border-t border-slate-50">
             <button
               type="button"
               onClick={onCancel}
               className="flex-1 py-4 px-6 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors"
             >
               Cancel
             </button>
             <button
               type="submit"
               onClick={handleSubmit}
               className="flex-[2] py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all"
             >
               Save Item
             </button>
        </div>

      </div>
    </div>
  );
};

export default ItemForm;