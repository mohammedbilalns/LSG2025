import React from 'react';

export const MapLegend: React.FC = () => {
    return (
        <div className="bg-white/50 backdrop-blur-sm border border-slate-200 p-2 md:p-3 rounded-lg shadow-md">
            <h4 className="hidden md:block font-semibold text-xs text-slate-700 mb-2 uppercase tracking-wide">Legend</h4>
            <div className="flex flex-row md:flex-col gap-3 md:gap-0 md:space-y-1.5 items-center md:items-start">
                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                    <span className="text-[10px] md:text-xs font-medium text-slate-600">LDF</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2 h-2 rounded-sm bg-indigo-500"></div>
                    <span className="text-[10px] md:text-xs font-medium text-slate-600">UDF</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2 h-2 rounded-sm bg-orange-500"></div>
                    <span className="text-[10px] md:text-xs font-medium text-slate-600">NDA</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2 h-2 rounded-sm bg-slate-500"></div>
                    <span className="text-[10px] md:text-xs font-medium text-slate-600">Others</span>
                </div>
            </div>
        </div>
    );
};
