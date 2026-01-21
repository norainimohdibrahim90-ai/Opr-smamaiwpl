import React, { useState, ChangeEvent, useCallback } from 'react';
import { UnitType, OPRData } from '../types';
import { generateOPRContent } from '../services/geminiService';
import { Loader2, Wand2, Upload, X, Save, FileText, ArrowRight, Calendar } from 'lucide-react';

interface Props {
  initialData: OPRData;
  onPreview: (data: OPRData) => void;
  onSave: (data: OPRData) => Promise<void>;
  isSaving: boolean;
}

// ============================================================================
// OPTIMIZATION: Separate Image Component & Memoize it
// This prevents the heavy image grid from re-rendering every time user types text
// ============================================================================
interface ImageSectionProps {
    images: string[];
    onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
}

const ImageSection = React.memo(({ images, onUpload, onRemove }: ImageSectionProps) => {
    return (
        <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-brand-red border-b pb-1">3. Evidens Bergambar</h3>
            <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg p-6 text-center hover:bg-yellow-100 transition relative">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={onUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-brand-gold mb-2" />
                    <p className="text-sm text-gray-600">Klik atau heret gambar ke sini (Min 4 Gambar)</p>
                </div>
            </div>
            
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {images.map((src, idx) => (
                        <div key={idx} className="relative group aspect-square bg-gray-100 rounded overflow-hidden shadow-sm border">
                            <img src={src} alt="preview" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => onRemove(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
ImageSection.displayName = 'ImageSection';

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================
const OPRForm: React.FC<Props> = ({ initialData, onPreview, onSave, isSaving }) => {
  const [formData, setFormData] = useState<OPRData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // useCallback prevents function recreation on every render, essential for React.memo to work on child
  const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = files.map((file) => URL.createObjectURL(file as Blob));
      setFormData(prev => ({ ...prev, gambar: [...prev.gambar, ...newImages] }));
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      gambar: prev.gambar.filter((_, i) => i !== index)
    }));
  }, []);

  const handleGenerateAI = async () => {
    if (!formData.aktiviti || !formData.kelemahan || !formData.objektif) {
      alert("Sila isi Bahagian Objektif, Aktiviti, dan Kelemahan dahulu untuk bantuan AI.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateOPRContent(formData.aktiviti, formData.objektif, formData.kekuatan, formData.kelemahan);
      setFormData(prev => ({
        ...prev,
        penambahbaikan: result.penambahbaikan,
        refleksi: result.refleksi
      }));
    } catch (e) {
      alert("Ralat semasa menjana AI. Sila cuba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewClick = () => {
    const missingFields: string[] = [];
    if (!formData.unit) missingFields.push("Unit");
    if (!formData.tajukProgram) missingFields.push("Tajuk Program");
    if (!formData.tarikh) missingFields.push("Tarikh");
    if (!formData.disediakanOleh) missingFields.push("Disediakan Oleh");

    if (missingFields.length > 0) {
      alert(`Sila lengkapkan maklumat wajib berikut:\n\n${missingFields.map(field => `- ${field}`).join('\n')}`);
      return;
    }
    onPreview(formData);
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
        setFormData(prev => ({ ...prev, tarikh: val, hari: '' }));
        return;
    }
    const date = new Date(val);
    if (isNaN(date.getTime())) {
         setFormData(prev => ({ ...prev, tarikh: val, hari: '' }));
         return;
    }
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const dayName = new Intl.DateTimeFormat('ms-MY', options).format(date);
    setFormData(prev => ({ ...prev, tarikh: val, hari: dayName }));
  };

  // Force open calendar picker on click for better UX
  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target && 'showPicker' in target && typeof target.showPicker === 'function') {
        try {
            target.showPicker();
        } catch (err) {
            // Ignore errors
            console.log("Could not open picker programmatically");
        }
    }
  };

  const inputClass = "mt-1 block w-full rounded-md border-yellow-300 bg-yellow-50 border p-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900 placeholder-gray-400";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto border-t-4 border-brand-red">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-brand-red" />
            Borang OPR Digital
        </h2>
        <p className="text-gray-500">Isi maklumat di bawah untuk menjana laporan automatik.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Basic Info */}
        <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-brand-red border-b pb-1">1. Maklumat Program (Wajib)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Unit <span className="text-red-500">*</span></label>
                    <select 
                        name="unit" 
                        value={formData.unit} 
                        onChange={handleChange}
                        className={inputClass}
                    >
                        <option value="">-- Pilih Unit --</option>
                        {Object.values(UnitType).map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700">Tajuk Program <span className="text-red-500">*</span></label>
                     <input type="text" name="tajukProgram" value={formData.tajukProgram} onChange={handleChange} className={inputClass} placeholder="Contoh: Sambutan Hari Guru 2024" />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-brand-red" />
                        Tarikh <span className="text-red-500">*</span>
                     </label>
                     <div className="relative">
                        <input 
                            type="date" 
                            name="tarikh" 
                            value={formData.tarikh} 
                            onChange={handleDateChange} 
                            onClick={handleDateClick}
                            className={`${inputClass} cursor-pointer appearance-none relative z-10`} 
                        />
                        {/* Fallback visual hint if browser doesn't show icon */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-0 pointer-events-none text-gray-400">
                             <Calendar className="w-4 h-4" />
                        </div>
                     </div>
                     <p className="text-xs text-gray-500 mt-1">Klik kotak untuk membuka kalendar.</p>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hari</label>
                        <input type="text" name="hari" value={formData.hari} onChange={handleChange} className="mt-1 block w-full rounded-md border-yellow-300 bg-yellow-100 border p-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-600" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Masa</label>
                        <input type="text" name="masa" value={formData.masa} onChange={handleChange} className={inputClass} placeholder="8.00 Pagi - 12.00 Tgh" />
                    </div>
                </div>
            </div>
        </div>

        {/* Section 2: Content */}
        <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-brand-red border-b pb-1">2. Kandungan Laporan</h3>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Objektif Program (Bullet atau Perenggan)</label>
                <textarea name="objektif" rows={3} value={formData.objektif} onChange={handleChange} className={inputClass} placeholder="- Mengeratkan silaturrahim..."></textarea>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Ringkasan Aktiviti</label>
                <textarea name="aktiviti" rows={3} value={formData.aktiviti} onChange={handleChange} className={inputClass} placeholder="Acara dimulakan dengan..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kekuatan</label>
                    <textarea name="kekuatan" rows={3} value={formData.kekuatan} onChange={handleChange} className={inputClass} placeholder="Kerjasama guru yang baik..."></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kelemahan</label>
                    <textarea name="kelemahan" rows={3} value={formData.kelemahan} onChange={handleChange} className={inputClass} placeholder="Masalah teknikal PA sistem..."></textarea>
                </div>
            </div>
        </div>

        {/* Section 3: AI Generation */}
        <div className="md:col-span-2 bg-brand-cream p-4 rounded-xl border border-yellow-200 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-brand-red flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-brand-gold" /> AI Assistant (Gemini)
                </h3>
                <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-md hover:bg-brand-darkRed transition disabled:opacity-50 text-sm font-medium shadow-sm"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {isGenerating ? 'Sedang Menjana...' : 'Auto-Jana Penambahbaikan & Refleksi'}
                </button>
             </div>
             <p className="text-xs text-gray-600 mb-4">AI akan menganalisis Objektif, Aktiviti dan Kelemahan untuk menjana cadangan yang profesional.</p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-red-900">Penambahbaikan (Auto/Manual)</label>
                    <textarea name="penambahbaikan" rows={3} value={formData.penambahbaikan} onChange={handleChange} className="mt-1 block w-full rounded-md border-yellow-400 bg-yellow-50 border p-2 shadow-sm focus:border-red-500 focus:ring-red-500"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-red-900">Refleksi (Auto/Manual)</label>
                    <textarea name="refleksi" rows={3} value={formData.refleksi} onChange={handleChange} className="mt-1 block w-full rounded-md border-yellow-400 bg-yellow-50 border p-2 shadow-sm focus:border-red-500 focus:ring-red-500"></textarea>
                </div>
            </div>
        </div>

         {/* Optimized Image Section */}
         <ImageSection 
            images={formData.gambar} 
            onUpload={handleImageUpload} 
            onRemove={removeImage} 
         />

        {/* Section 5: Provider Info */}
        <div className="space-y-4 md:col-span-2 border-t pt-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Disediakan Oleh (Nama) <span className="text-red-500">*</span></label>
                    <input type="text" name="disediakanOleh" value={formData.disediakanOleh} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Jawatan</label>
                    <input type="text" name="jawatan" value={formData.jawatan} onChange={handleChange} className={inputClass} />
                </div>
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8 border-t pt-6 sticky bottom-0 bg-white py-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button 
            onClick={() => onSave(formData)}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium transition text-sm flex items-center gap-2"
          >
             <Save className="w-4 h-4" /> Simpan Draft
          </button>
          <button 
            onClick={handlePreviewClick}
            className="flex items-center gap-2 px-6 py-2 bg-brand-red text-white rounded-md hover:bg-brand-darkRed font-bold transition shadow-lg transform hover:-translate-y-1"
          >
             Generate OPR <ArrowRight className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
};

export default React.memo(OPRForm);