import React from 'react';
import { DeclaredItem } from '../types';
import { X, Printer, ImageOff } from 'lucide-react';

interface ReportPreviewProps {
  items: DeclaredItem[];
  destination: string;
  onClose: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ items, destination, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Report Preview</h3>
            <p className="text-slate-400 text-xs mt-1">Ready for {destination}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Paper Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="bg-white shadow-lg rounded-xl min-h-full p-8 max-w-full mx-auto border border-slate-200">
            
            {/* Report Header */}
            <div className="border-b-2 border-brand-500 pb-6 mb-6">
               <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Customs Declaration</h1>
                    <p className="text-slate-500 text-sm mt-1">Food Items List</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Destination: {destination}</p>
                  </div>
               </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-3 px-2 text-xs font-bold text-slate-900 uppercase tracking-wider w-16">Image</th>
                    <th className="py-3 px-2 text-xs font-bold text-slate-900 uppercase tracking-wider">Product Details</th>
                    <th className="py-3 px-2 text-xs font-bold text-slate-900 uppercase tracking-wider">Ingredients</th>
                    <th className="py-3 px-2 text-xs font-bold text-slate-900 uppercase tracking-wider w-20 text-center">Weight</th>
                    <th className="py-3 px-2 text-xs font-bold text-slate-900 uppercase tracking-wider w-16 text-center">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50">
                      <td className="py-4 px-2 align-top">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt="Thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2 align-top">
                        <p className="font-bold text-slate-900 text-sm">{item.brand}</p>
                        <p className="text-slate-600 text-sm">{item.name}</p>
                      </td>
                      <td className="py-4 px-2 align-top">
                        <p className="text-xs text-slate-500 leading-relaxed">{item.ingredients}</p>
                      </td>
                      <td className="py-4 px-2 align-top text-center">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md whitespace-nowrap">{item.weight}</span>
                      </td>
                      <td className="py-4 px-2 align-top text-center">
                        <span className="text-sm font-bold text-slate-900">{item.quantity}</span>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No items added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
               <div className="text-right">
                  <p className="text-sm text-slate-500">Total Items Declared</p>
                  <p className="text-2xl font-bold text-brand-500">{items.length}</p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;