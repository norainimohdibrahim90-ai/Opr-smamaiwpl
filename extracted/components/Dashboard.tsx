import React from 'react';
import { DashboardStats, UnitType, OPRData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Calendar, User, Eye, Briefcase, BookOpen, Trophy, Heart, Users, Star } from 'lucide-react';

interface Props {
  stats: DashboardStats;
  onViewReport: (data: OPRData) => void;
}

// Updated Colors: Red, Orange, Yellow, Gold, Maroon
const COLORS = ['#991b1b', '#f59e0b', '#fbbf24', '#b45309', '#7f1d1d'];

const Dashboard: React.FC<Props> = ({ stats, onViewReport }) => {
  const chartData = Object.entries(stats.byUnit).map(([name, value]) => ({
    name: name,
    value: value
  }));

  // Helper to get icon based on unit
  const getUnitIcon = (unit: string | UnitType) => {
    switch (unit) {
      case UnitType.PENTADBIRAN:
        return <Briefcase className="w-3 h-3 text-gray-600" />;
      case UnitType.KURIKULUM:
        return <BookOpen className="w-3 h-3 text-blue-600" />;
      case UnitType.KOKURIKULUM:
        return <Trophy className="w-3 h-3 text-amber-600" />;
      case UnitType.HEM:
        return <Heart className="w-3 h-3 text-red-500" />;
      case UnitType.PIBG:
        return <Users className="w-3 h-3 text-green-600" />;
      default:
        return <FileText className="w-3 h-3 text-gray-400" />;
    }
  };

  // Helper to calculate quality rating (1-5 Stars)
  const calculateRating = (report: OPRData): number => {
    let score = 1; // Base score
    
    // Criteria 1: Status (Submitted gets +1)
    if (report.status === 'Submitted') score += 1;
    
    // Criteria 2: Content Completeness (Images >= 4)
    if (report.gambar && report.gambar.length >= 4) score += 1;
    
    // Criteria 3: Reflection Quality (Length > 50 chars)
    if (report.refleksi && report.refleksi.length > 50) score += 1;
    
    // Criteria 4: Improvement Plan Quality (Length > 50 chars)
    if (report.penambahbaikan && report.penambahbaikan.length > 50) score += 1;

    return Math.min(score, 5); // Max 5
  };

  const renderStars = (score: number) => {
      return (
          <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                  />
              ))}
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Jumlah Laporan</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stats.totalReports}</h3>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full">
                        <FileText className="w-6 h-6 text-brand-red" />
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Unit Teraktif</p>
                        <h3 className="text-xl font-bold text-gray-900">
                            {chartData.length > 0 ? chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name : '-'}
                        </h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full">
                        <User className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Status Sistem</p>
                        <h3 className="text-xl font-bold text-green-600">Aktif</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                        <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>
        </div>

        {/* Charts & Recent List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Statistik Mengikut Unit</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{fontSize: 10}} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#991b1b">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent List */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Laporan Terkini</h3>
                    <div className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border">
                        Skor Kualiti (1-5)
                    </div>
                </div>
                
                <div className="overflow-y-auto max-h-64 space-y-3">
                    {stats.recentReports.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Tiada laporan terkini.</p>
                    ) : (
                        stats.recentReports.map((report, idx) => {
                            const rating = calculateRating(report);
                            return (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-brand-softYellow rounded border border-brand-cream hover:bg-yellow-50 transition relative group">
                                    <div className="bg-red-100 p-2 rounded shrink-0 self-start mt-1">
                                        <FileText className="w-4 h-4 text-brand-red" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-sm text-gray-800 truncate pr-2" title={report.tajukProgram}>
                                                {report.tajukProgram}
                                            </p>
                                        </div>
                                        
                                        {/* Rating Stars */}
                                        <div className="flex items-center gap-2 mt-1">
                                            {renderStars(rating)}
                                            <span className="text-[10px] font-medium text-gray-500">
                                                {rating}/5
                                            </span>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex items-center flex-wrap gap-2 mt-1.5">
                                            <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-yellow-200 shadow-sm">
                                                {getUnitIcon(report.unit)}
                                                <span className="text-[10px] text-gray-600 font-medium uppercase">{report.unit || 'UMUM'}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{report.tarikh}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${report.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {report.status === 'Submitted' ? 'HANTAR' : 'DRAFT'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="self-center pl-1">
                                        <button 
                                            onClick={() => onViewReport(report)}
                                            className="flex items-center gap-1 text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition shadow-sm"
                                            title="Lihat Laporan"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default React.memo(Dashboard);