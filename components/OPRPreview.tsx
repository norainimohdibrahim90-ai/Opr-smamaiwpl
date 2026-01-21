import React, { forwardRef } from 'react';
import { OPRData } from '../types';

interface Props {
  data: OPRData;
}

const OPRPreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ms-MY', options);
  };

  return (
    <div className="w-full flex justify-center bg-gray-100 p-8 overflow-hidden">
        {/* A4 Paper Dimensions: 210mm x 297mm. STRICT One Page Constraint. */}
        <div 
            id="printable-opr" 
            ref={ref}
            className="bg-white shadow-lg w-[210mm] h-[297mm] p-[15mm] relative text-black overflow-hidden box-border"
            style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt' }} // Changed to Arial and 10pt base size
        >
            {/* Header - Logo Left, Text Center */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4 relative h-[25mm]">
                {/* Logo Section - Absolute Left to ensure text remains perfectly centered to page */}
                <div className="absolute left-0 top-0 h-full flex items-center">
                    <img 
                        src="https://iili.io/fv9OFtt.md.png" 
                        alt="Logo Sekolah" 
                        className="h-[22mm] w-auto object-contain" 
                    />
                </div>
                
                {/* Text Section - Width Full to Center alignment */}
                <div className="w-full text-center pl-[25mm]"> {/* Added padding-left to balance the logo visual center if needed, but sticking to absolute for true center */}
                    <h1 className="text-xl font-bold uppercase tracking-wider text-black leading-tight">ONE PAGE REPORT (OPR)</h1>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-black leading-tight">SMA MAIWP LABUAN</h2>
                    <p className="text-[10pt] italic text-gray-500 mt-1 uppercase tracking-widest">{data.unit || "UNIT"}</p>
                </div>
            </div>

            {/* Table Info */}
            <table className="w-full border-collapse border border-gray-400 mb-4 text-[10pt]">
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-1.5 bg-gray-100 font-bold w-1/4">TAJUK PROGRAM</td>
                        <td className="border border-gray-400 p-1.5 font-bold uppercase w-3/4" colSpan={3}>{data.tajukProgram}</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-1.5 bg-gray-100 font-bold">TARIKH</td>
                        <td className="border border-gray-400 p-1.5">{formatDate(data.tarikh)}</td>
                        <td className="border border-gray-400 p-1.5 bg-gray-100 font-bold">HARI</td>
                        <td className="border border-gray-400 p-1.5 uppercase">{data.hari}</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-1.5 bg-gray-100 font-bold">MASA</td>
                        <td className="border border-gray-400 p-1.5" colSpan={3}>{data.masa}</td>
                    </tr>
                </tbody>
            </table>

            {/* Content Sections - Updated to text-[10pt] */}
            <div className="space-y-3 mb-4">
                <div className="flex flex-col">
                    <span className="font-bold border-b border-gray-300 mb-1 text-[10pt]">1. OBJEKTIF PROGRAM</span>
                    <div className="text-justify whitespace-pre-line text-[10pt] leading-snug pl-2">
                        {data.objektif || "-"}
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="font-bold border-b border-gray-300 mb-1 text-[10pt]">2. RINGKASAN AKTIVITI</span>
                    <div className="text-justify whitespace-pre-line text-[10pt] leading-snug pl-2">
                        {data.aktiviti || "-"}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col">
                        <span className="font-bold border-b border-gray-300 mb-1 text-[10pt]">3. KEKUATAN</span>
                        <div className="text-justify whitespace-pre-line text-[10pt] leading-snug pl-2">
                            {data.kekuatan || "-"}
                        </div>
                    </div>
                     <div className="flex flex-col">
                        <span className="font-bold border-b border-gray-300 mb-1 text-[10pt]">4. KELEMAHAN</span>
                        <div className="text-justify whitespace-pre-line text-[10pt] leading-snug pl-2">
                            {data.kelemahan || "-"}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col">
                        <span className="font-bold border-b border-gray-300 mb-1 text-black text-[10pt]">5. PENAMBAHBAIKAN (AI)</span>
                        {/* Changed bg-blue-50 to bg-yellow-50 for consistency */}
                        <div className="text-justify whitespace-pre-line text-[10pt] leading-snug pl-2 bg-yellow-50 p-1.5 rounded">
                            {data.penambahbaikan || "-"}
                        </div>
                    </div>
                     <div className="flex flex-col">
                        <span className="font-bold border-b border-gray-300 mb-1 text-black text-[10pt]">6. REFLEKSI (AI)</span>
                        <div className="text-justify whitespace-pre-line text-[10pt] leading-snug pl-2 bg-yellow-50 p-1.5 rounded">
                            {data.refleksi || "-"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Images - Grid of 4 minimum, fixed height to ensure fit */}
            <div className="mb-2">
                <span className="font-bold block border-b border-gray-300 mb-1 text-[10pt]">GAMBAR SEKITAR AKTIVITI</span>
                {data.gambar.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 h-[65mm] overflow-hidden">
                         {data.gambar.slice(0, 4).map((img, idx) => (
                             <div key={idx} className="bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden h-full">
                                 <img src={img} alt={`Gambar ${idx + 1}`} className="w-full h-full object-cover" />
                             </div>
                         ))}
                    </div>
                ) : (
                    <div className="text-gray-400 italic text-center p-4 border border-dashed h-[65mm]">Tiada gambar dilampirkan</div>
                )}
            </div>

            {/* Footer / Signatures - Absolute bottom */}
            <div className="absolute bottom-[15mm] right-[15mm] w-1/3 text-center">
                <div className="h-12 mb-1"></div> {/* Space for signature */}
                <p className="font-bold border-t border-black pt-1 uppercase text-[10pt]">{data.disediakanOleh || "NAMA GURU"}</p>
                <p className="text-[10pt]">{data.jawatan || "JAWATAN"}</p>
                <p className="text-[10pt]">{formatDate(new Date().toISOString())}</p>
            </div>
        </div>
    </div>
  );
});

OPRPreview.displayName = 'OPRPreview';
export default OPRPreview;