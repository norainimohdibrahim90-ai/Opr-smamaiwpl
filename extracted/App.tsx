import React, { useState, useEffect, useRef } from 'react';
import { OPRData, UnitType } from './types';
import OPRForm from './components/OPRForm';
import OPRPreview from './components/OPRPreview';
import PosterPreview from './components/PosterPreview'; // Import new component
import Dashboard from './components/Dashboard';
import { saveReport, getDashboardStats } from './services/storageService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LayoutDashboard, PlusCircle, ArrowLeft, Download, CheckCircle, Save, FileText, Image as ImageIcon } from 'lucide-react';

const INITIAL_DATA: OPRData = {
  id: '',
  unit: '',
  tajukProgram: '',
  tarikh: new Date().toISOString().split('T')[0],
  hari: '',
  masa: '',
  objektif: '',
  aktiviti: '',
  kekuatan: '',
  kelemahan: '',
  penambahbaikan: '',
  refleksi: '',
  disediakanOleh: '',
  jawatan: '',
  gambar: [],
  status: 'Draft',
  createdAt: Date.now()
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'form' | 'preview'>('dashboard');
  const [previewMode, setPreviewMode] = useState<'standard' | 'poster'>('standard'); // Toggle state
  const [currentData, setCurrentData] = useState<OPRData>(INITIAL_DATA);
  const [stats, setStats] = useState(getDashboardStats());
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null); // Ref for poster

  useEffect(() => {
    // Refresh stats when view changes to dashboard
    if (view === 'dashboard') {
      setStats(getDashboardStats());
    }
  }, [view]);

  // Show notification toast
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateNew = () => {
    setCurrentData({ ...INITIAL_DATA, id: Date.now().toString() });
    setPreviewMode('standard'); // Default to standard
    setView('form');
  };

  const handlePreview = (data: OPRData) => {
    setCurrentData(data);
    setView('preview');
  };

  // Function to view existing report from Dashboard
  const handleViewReport = (data: OPRData) => {
    setCurrentData(data);
    setPreviewMode('standard');
    setView('preview');
  };

  // Helper: Generate PDF as Data URL (Base64)
  const generatePDFBase64 = async (): Promise<string | null> => {
      if (!printRef.current) return null;
      try {
        const element = printRef.current;
        const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 210 * 3.7795275591, 
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        return pdf.output('datauristring');
      } catch (e) {
          console.error("PDF Generation Error", e);
          return null;
      }
  };

  const handleDownloadPDF = async () => {
    setIsSaving(true);
    try {
        const pdfBase64 = await generatePDFBase64();
        if (pdfBase64) {
             const link = document.createElement('a');
             link.href = pdfBase64;
             const filename = `OPR_${currentData.unit.replace(/\s/g, '')}_${currentData.tajukProgram.replace(/\s/g, '_')}_${currentData.tarikh}`;
             link.download = `${filename}.pdf`;
             link.click();
             showToast("PDF Berjaya Dimuat Turun!");
        }
    } catch (e) {
        console.error(e);
        alert("Ralat semasa menjana PDF.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setIsSaving(true);
    try {
        const element = posterRef.current;
        // High scale for crisp text on mobile
        const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });
        
        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        const filename = `Poster_${currentData.tajukProgram.replace(/\s/g, '_')}.png`;
        link.download = filename;
        link.href = image;
        link.click();
        showToast("Poster Berjaya Dimuat Turun!");
    } catch (e) {
        console.error("Poster Error", e);
        alert("Ralat semasa menjana Poster.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveDraft = async (data: OPRData) => {
      await saveReport(data);
      showToast("Draft disimpan di dalam browser.");
  };

  return (
    <div className="min-h-screen bg-brand-softYellow font-sans text-slate-900 pb-10">
      {/* Toast Notification */}
      {notification && (
          <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-top-5">
              <CheckCircle className="w-5 h-5" />
              {notification}
          </div>
      )}

      {/* Header */}
      <header className="bg-brand-red text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-white p-1 rounded-full">
                <img 
                  src="https://iili.io/fv9OFtt.md.png" 
                  alt="Logo SMA MAIWP Labuan" 
                  className="w-10 h-10 object-contain" 
                />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight">Sistem OPR Digital</h1>
                <p className="text-xs text-yellow-100 font-medium">Sistem Pelaporan Aktiviti SMA MAIWP Labuan</p>
             </div>
          </div>
          
          <nav className="flex gap-2">
             {view !== 'dashboard' && (
                 <button 
                    onClick={() => setView('dashboard')}
                    className="px-3 py-1.5 rounded-md hover:bg-brand-darkRed text-sm flex items-center gap-2 transition"
                 >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                 </button>
             )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {view === 'dashboard' && (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Utama</h2>
                    <button 
                        onClick={handleCreateNew}
                        className="bg-brand-gold hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 transition transform hover:scale-105"
                    >
                        <PlusCircle className="w-5 h-5" /> Cipta Laporan Baru
                    </button>
                </div>
                <Dashboard stats={stats} onViewReport={handleViewReport} />
            </div>
        )}

        {view === 'form' && (
            <OPRForm 
                initialData={currentData} 
                onPreview={handlePreview} 
                onSave={handleSaveDraft}
                isSaving={isSaving}
            />
        )}

        {view === 'preview' && (
            <div className="flex flex-col items-center gap-6">
                 {/* Toolbar with Mode Toggle */}
                 <div className="w-full max-w-4xl space-y-4">
                    
                    {/* Mode Toggle Buttons */}
                    <div className="flex justify-center p-1 bg-white border border-gray-200 rounded-full w-max mx-auto shadow-sm">
                        <button
                            onClick={() => setPreviewMode('standard')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${previewMode === 'standard' ? 'bg-brand-red text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <FileText className="w-4 h-4" /> Dokumen Rasmi (A4)
                        </button>
                        <button
                            onClick={() => setPreviewMode('poster')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${previewMode === 'poster' ? 'bg-brand-gold text-black shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <ImageIcon className="w-4 h-4" /> Poster Kreatif (PNG)
                        </button>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white rounded shadow-sm border border-red-100">
                        <button onClick={() => setView('form')} className="text-gray-600 hover:text-black flex items-center gap-2 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Edit Semula
                        </button>
                        
                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            {previewMode === 'standard' ? (
                                <>
                                    <button 
                                        onClick={handleDownloadPDF}
                                        disabled={isSaving}
                                        className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded shadow flex items-center justify-center gap-2 transition w-full md:w-auto"
                                    >
                                        <Download className="w-4 h-4" /> Export PDF
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={handleDownloadPoster}
                                    disabled={isSaving}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded shadow flex items-center justify-center gap-2 transition w-full md:w-auto"
                                >
                                    <Download className="w-4 h-4" /> Muat Turun Poster (PNG)
                                </button>
                            )}
                        </div>
                    </div>
                 </div>
                 
                 {/* Conditional Rendering of Preview Components */}
                 <div className={`${previewMode === 'standard' ? 'block' : 'hidden'} w-full`}>
                    <OPRPreview ref={printRef} data={currentData} />
                 </div>
                 
                 <div className={`${previewMode === 'poster' ? 'block' : 'hidden'} w-full`}>
                    <PosterPreview ref={posterRef} data={currentData} />
                 </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;