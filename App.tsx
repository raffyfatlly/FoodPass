import React, { useState, useEffect } from 'react';
import Scanner from './components/Scanner';
import ItemForm from './components/ItemForm';
import DeclarationList from './components/DeclarationList';
import CountrySelector from './components/CountrySelector';
import Notification, { NotificationType } from './components/Notification';
import ChatAssistant from './components/ChatAssistant';
import ReportPreview from './components/ReportPreview';
import { DeclaredItem, ScanResult } from './types';
import { analyzeImage, analyzeText, getCustomsAdvice } from './services/geminiService';
import { generateDeclarationPDF } from './services/pdfService';
import { Zap, FileText, MessageCircleQuestion, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<DeclaredItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [editingItem, setEditingItem] = useState<DeclaredItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [destinationCountry, setDestinationCountry] = useState<string>("Australia");
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{msg: string, type: NotificationType} | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('customsItems');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) {}
    }
    const savedCountry = localStorage.getItem('destinationCountry');
    if (savedCountry) { setDestinationCountry(savedCountry); }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
        localStorage.setItem('customsItems', JSON.stringify(items));
    } catch (e) {
        console.error("Storage full", e);
    }
  }, [items]);

  useEffect(() => {
    localStorage.setItem('destinationCountry', destinationCountry);
  }, [destinationCountry]);

  const showNotification = (msg: string, type: NotificationType) => {
      setNotification({ msg, type });
  };

  const handleScan = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const fullBase64 = reader.result as string;
        const base64Content = fullBase64.split(',')[1];
        
        try {
          const result = await analyzeImage(base64Content, destinationCountry);
          setCurrentScan({ ...result, image: fullBase64 });
          setShowForm(true);
        } catch (err) {
          setErrorMsg("Could not identify food item. Please type name.");
          setCurrentScan({ 
            brand: '', name: '', ingredients: '', weight: '', quantity: 1, 
            image: fullBase64 
          });
          setShowForm(true);
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (e) {
      setErrorMsg("Error processing file.");
      setIsProcessing(false);
    }
  };

  const handleTextSearch = async (query: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const result = await analyzeText(query, destinationCountry);
      setCurrentScan({ ...result, image: '' });
      setShowForm(true);
    } catch (err) {
      setErrorMsg("Could not find food details.");
      setCurrentScan({ 
        brand: '', name: query, ingredients: '', weight: '',
        quantity: 1, image: ''
      });
      setShowForm(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAdd = () => {
    setCurrentScan(null);
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item: DeclaredItem) => {
      setEditingItem(item);
      setCurrentScan(null);
      setShowForm(true);
  };

  const handleSaveItem = async (data: Omit<DeclaredItem, 'id' | 'timestamp'>) => {
    let updatedItems: DeclaredItem[] = [];

    if (editingItem) {
        updatedItems = items.map(item => 
            item.id === editingItem.id ? { ...item, ...data } : item
        );
        setItems(updatedItems);
    } else {
        const newItem: DeclaredItem = {
            ...data,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        updatedItems = [newItem, ...items];
        setItems(updatedItems);
    }
    
    setShowForm(false);
    setCurrentScan(null);
    setEditingItem(null);

    // AI Context Check - Triggered immediately after adding/updating
    // We use the 'updatedItems' local variable to ensure we have the latest data
    try {
      // Small delay to let the UI close the modal first
      setTimeout(async () => {
        const advice = await getCustomsAdvice(updatedItems, destinationCountry);
        showNotification(advice, "ai");
      }, 500);
    } catch (e) {
      console.error("AI check failed", e);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleExportPDF = async () => {
    if (items.length === 0) return;
    
    // 1. Notify Downloading
    showNotification("Generating compliant report...", "info");
    
    // 2. Generate PDF (Small delay to allow UI to update)
    await new Promise(r => setTimeout(r, 500));
    generateDeclarationPDF(items);
    
    // 3. Notify Success
    showNotification("Report downloaded successfully!", "success");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-brand-100 relative pb-32">
      
      {/* Notifications */}
      {notification && (
        <Notification 
            message={notification.msg} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
        />
      )}

      {/* Chat Assistant */}
      <ChatAssistant 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
        destinationCountry={destinationCountry}
      />

      {/* Report Preview Modal */}
      {showPreview && (
        <ReportPreview 
            items={items} 
            destination={destinationCountry} 
            onClose={() => setShowPreview(false)} 
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Zap className="w-5 h-5 fill-current" />
           </div>
           <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">FoodClear</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Customs Assistant</p>
           </div>
        </div>

        {/* Chat Trigger Button */}
        <button 
          onClick={() => setShowChat(true)}
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-brand-50 hover:text-brand-500 transition-colors active:scale-95"
          title="Ask AI Expert"
        >
          <MessageCircleQuestion className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-md mx-auto px-6 pt-6 pb-12 flex flex-col items-center">
        
        {/* Country Selector - Top Center */}
        <section className="animate-in slide-in-from-bottom-5 duration-500 delay-100 w-full mb-6">
           <CountrySelector value={destinationCountry} onChange={setDestinationCountry} />
        </section>

        {/* Scanner - Hero */}
        <section className="animate-in slide-in-from-bottom-5 duration-500 delay-200 w-full mb-8">
          <Scanner 
            onScan={handleScan} 
            onTextSearch={handleTextSearch}
            onManualAdd={handleManualAdd}
            isProcessing={isProcessing} 
          />
          {errorMsg && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl text-center border border-red-100 animate-in fade-in shadow-sm">
              {errorMsg}
            </div>
          )}
        </section>

        {/* List */}
        <section className="animate-in slide-in-from-bottom-5 duration-500 delay-300 w-full">
          <DeclarationList items={items} onDelete={handleDeleteItem} onEdit={handleEditItem} />
        </section>

      </main>

      {/* Floating Action Bar (Bottom) */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent transition-transform duration-500 ease-out z-30 ${items.length > 0 ? 'translate-y-0' : 'translate-y-48'}`}>
         <div className="max-w-md mx-auto flex gap-3">
            {/* View Report Button */}
            <button 
              onClick={() => setShowPreview(true)}
              className="flex-1 bg-white border border-slate-200 text-brand-500 font-bold text-lg py-4 rounded-[1.25rem] shadow-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:bg-slate-50 hover:border-brand-200"
            >
               <Eye className="w-5 h-5" />
               <span className="text-base">Preview</span>
            </button>
            
            {/* Generate PDF Button */}
            <button 
              onClick={handleExportPDF}
              className="flex-[2] bg-brand-500 text-white font-bold text-lg py-4 rounded-[1.25rem] shadow-2xl shadow-brand-500/40 flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:bg-brand-600 hover:shadow-brand-500/50"
            >
               <FileText className="w-5 h-5" />
               <span className="text-base">Download PDF</span>
            </button>
         </div>
      </div>

      {/* Edit Form Modal */}
      {showForm && (
        <ItemForm 
          initialData={editingItem || currentScan || {}} 
          onSave={handleSaveItem} 
          onCancel={() => {
            setShowForm(false);
            setCurrentScan(null);
            setEditingItem(null);
          }} 
        />
      )}
    </div>
  );
};

export default App;