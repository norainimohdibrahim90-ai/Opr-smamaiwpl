import React, { forwardRef } from 'react';
import { OPRData } from '../types';
import { Calendar, Clock, User, Target, Activity, TrendingUp, AlertCircle, Lightbulb, CheckCircle2, Building2 } from 'lucide-react';

interface Props {
  data: OPRData;
}

const PosterPreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const mainImage = data.gambar[0] || "https://placehold.co/600x400/e2e8f0/94a3b8?text=Tiada+Gambar";
  const subImages = data.gambar.slice(1, 4);
  
  // URL Gambar Bangunan Sekolah - Ganti URL ini dengan URL sebenar gambar sekolah anda
  // Nota: Gunakan gambar yang cerah untuk hasil terbaik
  const headerBg = "https://iili.io/frIU2CG.jpg"; 

  return (
    <div className="w-full flex justify-center bg-gray-900 p-8 overflow-hidden">
      {/* 
        Canvas Container 
        A4 Dimensions: 210mm x 297mm
        Uses flex-col to manage vertical spacing strictly within A4 height.
      */}
      <div 
        ref={ref}
        id="poster-canvas"
        className="w-[210mm] h-[297mm] bg-white relative flex flex-col shadow-2xl overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* === HEADER SECTION (Optimized Space) === */}
        <div className="relative h-[60mm] shrink-0 overflow-hidden bg-brand-darkRed">
            
            {/* Background Image (Bangunan Sekolah) with Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={headerBg} 
                    alt="Latar Belakang Sekolah" 
                    className="w-full h-full object-cover opacity-100" // Increased opacity
                    style={{ objectPosition: 'center 30%' }}
                />
                {/* Gradient Overlay - Adjusted to be clearer on the right side for the building to show */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-darkRed via-brand-red/85 to-transparent"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex items-center px-8 gap-5 pt-2">
                
                {/* LOGO SEKOLAH - TANPA BACKGROUND PUTIH */}
                <div className="shrink-0 transform -rotate-1">
                     <img 
                        src="https://iili.io/fv9OFtt.md.png" 
                        alt="Logo" 
                        className="h-[42mm] w-auto object-contain drop-shadow-2xl filter" 
                    />
                </div>

                {/* TEXT SECTION */}
                <div className="flex flex-col justify-center flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                         <h3 className="text-brand-gold font-bold tracking-[0.2em] uppercase text-[10px] drop-shadow-sm">
                            Laporan Aktiviti Sekolah
                        </h3>
                        <div className="h-[1px] flex-1 bg-brand-gold/50 shadow-sm"></div>
                    </div>
                   
                    <h2 className="text-white font-black tracking-wider uppercase text-xl leading-none drop-shadow-lg mb-2 text-shadow-sm">
                        SMA MAIWP LABUAN
                    </h2>
                    
                    {/* TAJUK PROGRAM - DIPERBESARKAN */}
                    <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-xl line-clamp-2 border-l-4 border-brand-gold pl-3 text-shadow-md">
                        {data.tajukProgram || "TAJUK PROGRAM DI SINI"}
                    </h1>

                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20 shadow-lg">
                            <Building2 className="w-3 h-3 text-brand-gold" />
                            {data.unit || "UNIT PENGANJUR"}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Divider Curve */}
            <svg className="absolute bottom-0 w-full h-8 text-gray-50 fill-current z-20" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <path fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,224C1120,245,1280,267,1360,277.3L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
        </div>

        {/* === INFO BAR & MAIN IMAGE === */}
        <div className="relative px-8 -mt-6 z-20 shrink-0">
            <div className="flex gap-4 mb-2">
                <div className="w-2/3">
                    <div className="bg-white p-1 rounded-xl shadow-xl transform hover:scale-[1.01] transition duration-500">
                        <div className="rounded-lg overflow-hidden aspect-video relative h-[45mm] w-full group">
                             <img 
                                src={mainImage} 
                                alt="Main Event" 
                                className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            <div className="absolute bottom-2 left-3">
                                <span className="bg-brand-red/90 text-white text-[9px] px-2 py-0.5 rounded shadow-sm">Gambar Utama</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Info Card Side */}
                <div className="w-1/3 flex flex-col gap-2 pt-6 justify-end">
                     <div className="bg-white p-3 rounded-lg shadow-md border-l-4 border-brand-red flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-red-50 p-1.5 rounded-full text-brand-red">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[8px] text-gray-400 uppercase font-bold tracking-wider">Tarikh</p>
                                <p className="font-bold text-gray-800 text-sm leading-none">{data.tarikh}</p>
                            </div>
                        </div>
                     </div>
                     <div className="bg-white p-3 rounded-lg shadow-md border-l-4 border-brand-gold flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-yellow-50 p-1.5 rounded-full text-yellow-700">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[8px] text-gray-400 uppercase font-bold tracking-wider">Masa</p>
                                <p className="font-bold text-gray-800 text-xs leading-none">{data.masa}</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* === CONTENT GRID === */}
        <div className="px-8 py-2 bg-gray-50 flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 gap-3 flex-1">
                
                {/* Column 1 - Left */}
                <div className="space-y-2 flex flex-col">
                    {/* Objektif */}
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden flex-1 group hover:border-red-200 transition">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-red-50 rounded-bl-full -mr-6 -mt-6 opacity-60"></div>
                        <h4 className="flex items-center gap-1.5 text-brand-red font-bold uppercase tracking-wide mb-1.5 text-[10px]">
                            <Target className="w-3.5 h-3.5" /> Objektif
                        </h4>
                        <p className="text-gray-600 text-[10px] leading-relaxed text-justify line-clamp-[9]">
                            {data.objektif || "Tiada objektif dinyatakan."}
                        </p>
                    </div>

                    {/* Kekuatan */}
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 border-t-2 border-t-green-500 flex-1">
                         <h4 className="flex items-center gap-1.5 text-green-700 font-bold uppercase tracking-wide mb-1.5 text-[10px]">
                            <TrendingUp className="w-3.5 h-3.5" /> Kekuatan
                        </h4>
                        <p className="text-gray-600 text-[10px] leading-relaxed text-justify line-clamp-[7]">
                            {data.kekuatan || "-"}
                        </p>
                    </div>

                    {/* Penambahbaikan */}
                    <div className="bg-gradient-to-br from-amber-50 to-white p-3 rounded-lg shadow-sm border border-amber-100 flex-1">
                         <h4 className="flex items-center gap-1.5 text-amber-800 font-bold uppercase tracking-wide mb-1.5 text-[10px]">
                            <Lightbulb className="w-3.5 h-3.5" /> Penambahbaikan
                        </h4>
                        <p className="text-gray-700 text-[10px] leading-relaxed text-justify italic line-clamp-[7]">
                            "{data.penambahbaikan || "-"}"
                        </p>
                    </div>
                </div>

                {/* Column 2 - Right */}
                <div className="space-y-2 flex flex-col">
                     {/* Aktiviti */}
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden flex-1 group hover:border-red-200 transition">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-purple-50 rounded-bl-full -mr-6 -mt-6 opacity-60"></div>
                        <h4 className="flex items-center gap-1.5 text-brand-red font-bold uppercase tracking-wide mb-1.5 text-[10px]">
                            <Activity className="w-3.5 h-3.5" /> Ringkasan Aktiviti
                        </h4>
                        <p className="text-gray-600 text-[10px] leading-relaxed text-justify line-clamp-[9]">
                            {data.aktiviti || "Tiada ringkasan aktiviti."}
                        </p>
                    </div>

                    {/* Kelemahan */}
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 border-t-2 border-t-red-400 flex-1">
                         <h4 className="flex items-center gap-1.5 text-red-600 font-bold uppercase tracking-wide mb-1.5 text-[10px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Kelemahan
                        </h4>
                        <p className="text-gray-600 text-[10px] leading-relaxed text-justify line-clamp-[7]">
                            {data.kelemahan || "-"}
                        </p>
                    </div>

                    {/* Refleksi */}
                    <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-lg shadow-sm border border-blue-100 flex-1">
                         <h4 className="flex items-center gap-1.5 text-blue-800 font-bold uppercase tracking-wide mb-1.5 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Impak / Refleksi
                        </h4>
                        <p className="text-gray-700 text-[10px] leading-relaxed text-justify italic line-clamp-[7]">
                            "{data.refleksi || "-"}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Gallery Strip - Compact */}
            {subImages.length > 0 && (
                <div className="mt-3 h-[30mm] shrink-0">
                     <div className="flex items-center gap-2 mb-1.5">
                         <div className="h-[1px] bg-gray-300 flex-1"></div>
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Galeri Lensa</span>
                         <div className="h-[1px] bg-gray-300 flex-1"></div>
                     </div>
                     <div className="flex gap-2 h-[23mm]">
                        {subImages.map((img, i) => (
                            <div key={i} className="flex-1 rounded-md overflow-hidden border border-white shadow-sm relative group">
                                 <img src={img} alt="Gallery" className="w-full h-full object-cover transition group-hover:scale-110" />
                            </div>
                        ))}
                         {/* Fillers to maintain layout balance */}
                        {subImages.length < 3 && [...Array(3 - subImages.length)].map((_, i) => (
                             <div key={`empty-${i}`} className="flex-1 bg-gray-100 rounded-md border border-white border-dashed flex items-center justify-center">
                                <span className="text-gray-300 text-[8px]">No Image</span>
                             </div>
                        ))}
                     </div>
                </div>
            )}
        </div>

        {/* === FOOTER === */}
        <div className="bg-gray-900 text-white px-8 h-[25mm] relative overflow-hidden mt-auto shrink-0 flex items-center border-t-4 border-brand-gold">
             <div className="absolute right-0 bottom-0 w-32 h-full bg-brand-red transform skew-x-12 translate-x-8 opacity-40"></div>
             
             <div className="flex justify-between items-center w-full relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center text-white shadow-lg border border-white/20">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest font-semibold">Disediakan Oleh</p>
                        <p className="font-bold text-[11px] text-white leading-tight">{data.disediakanOleh || "Nama Guru"}</p>
                        <p className="text-[9px] text-brand-gold">{data.jawatan || "Jawatan"}</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[8px] text-gray-500 uppercase tracking-wide">Dijana secara automatik</p>
                    <p className="font-black text-sm tracking-widest text-white">SISTEM <span className="text-brand-red">OPR</span> DIGITAL</p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
});

PosterPreview.displayName = 'PosterPreview';
export default PosterPreview;